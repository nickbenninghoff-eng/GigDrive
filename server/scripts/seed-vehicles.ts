import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
const envTxtPath = path.resolve(__dirname, '../env.txt');
dotenv.config({ path: existsSync(envPath) ? envPath : envTxtPath });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const FUEL_ECO_BASE = 'https://www.fueleconomy.gov/ws/rest';
const HEADERS = { Accept: 'application/json' };

// Rate limiter: max N requests per second
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url: string): Promise<any> {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

interface MenuItem {
  text: string;
  value: string;
}

async function getYears(): Promise<number[]> {
  const data = await fetchJson(`${FUEL_ECO_BASE}/vehicle/menu/year`);
  const items: MenuItem[] = data.menuItem;
  return items.map((i) => parseInt(i.value)).filter((y) => y >= 2010 && y <= 2026);
}

async function getMakes(year: number): Promise<string[]> {
  const data = await fetchJson(`${FUEL_ECO_BASE}/vehicle/menu/make?year=${year}`);
  const items: MenuItem[] = Array.isArray(data.menuItem) ? data.menuItem : [data.menuItem];
  return items.map((i) => i.text);
}

async function getModels(year: number, make: string): Promise<string[]> {
  const encodedMake = encodeURIComponent(make);
  const data = await fetchJson(
    `${FUEL_ECO_BASE}/vehicle/menu/model?year=${year}&make=${encodedMake}`
  );
  if (!data.menuItem) return [];
  const items: MenuItem[] = Array.isArray(data.menuItem) ? data.menuItem : [data.menuItem];
  return items.map((i) => i.text);
}

async function getVehicleOptions(
  year: number,
  make: string,
  model: string
): Promise<Array<{ text: string; value: string }>> {
  const encodedMake = encodeURIComponent(make);
  const encodedModel = encodeURIComponent(model);
  const data = await fetchJson(
    `${FUEL_ECO_BASE}/vehicle/menu/options?year=${year}&make=${encodedMake}&model=${encodedModel}`
  );
  if (!data.menuItem) return [];
  const items = Array.isArray(data.menuItem) ? data.menuItem : [data.menuItem];
  return items;
}

interface VehicleDetail {
  id: number;
  year: number;
  make: string;
  model: string;
  trany: string;
  VClass: string;
  drive: string;
  displ: string;
  cylinders: string;
  fuelType: string;
  fuelType1: string;
  city08: number;
  highway08: number;
  comb08: number;
  co2TailpipeGpm: number;
  fuelCost08: number;
  combE: number; // kWh/100mi for EVs
}

async function getVehicleDetail(epaId: string): Promise<VehicleDetail | null> {
  try {
    const data = await fetchJson(`${FUEL_ECO_BASE}/vehicle/${epaId}`);
    return data;
  } catch {
    return null;
  }
}

function mapFuelType(fuelType1: string): string {
  const ft = (fuelType1 || '').toLowerCase();
  if (ft.includes('electricity')) return 'electric';
  if (ft.includes('e85') || ft.includes('ethanol')) return 'flex_fuel';
  if (ft.includes('diesel')) return 'diesel';
  if (ft.includes('premium') || ft.includes('regular') || ft.includes('midgrade')) return 'gas';
  return 'gas';
}

function mapBodyStyle(vClass: string): string {
  const vc = (vClass || '').toLowerCase();
  if (vc.includes('pickup') || vc.includes('truck')) return 'truck';
  if (vc.includes('suv') || vc.includes('sport utility')) return 'suv';
  if (vc.includes('van') || vc.includes('minivan')) return 'van';
  if (vc.includes('wagon')) return 'wagon';
  if (vc.includes('compact') || vc.includes('subcompact')) return 'compact';
  if (vc.includes('midsize')) return 'midsize_sedan';
  if (vc.includes('large')) return 'full_size_sedan';
  if (vc.includes('small')) return 'small_car';
  if (vc.includes('two seater') || vc.includes('sports')) return 'sports';
  return 'sedan';
}

async function seedVehicles() {
  console.log('Starting vehicle seed from FuelEconomy.gov...');

  const years = await getYears();
  console.log(`Found years: ${years.join(', ')}`);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const year of years) {
    console.log(`\n--- Processing year ${year} ---`);
    const makes = await getMakes(year);
    console.log(`  Found ${makes.length} makes`);
    await sleep(200);

    for (const make of makes) {
      const models = await getModels(year, make);
      await sleep(200);

      for (const model of models) {
        const options = await getVehicleOptions(year, make, model);
        await sleep(200);

        // Just take the first option (trim) for each make/model/year
        // to keep the database manageable
        const option = options[0];
        if (!option) continue;

        const detail = await getVehicleDetail(option.value);
        if (!detail) continue;
        await sleep(200);

        const fuelType = mapFuelType(detail.fuelType1);
        const bodyStyle = mapBodyStyle(detail.VClass);

        try {
          await pool.query(
            `INSERT INTO vehicles (
              year, make, model, trim, fuel_type,
              mpg_city, mpg_highway, mpg_combined,
              kwh_per_100mi, epa_vehicle_id, body_style
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (year, make, model, COALESCE(trim, ''))
            DO UPDATE SET
              mpg_city = EXCLUDED.mpg_city,
              mpg_highway = EXCLUDED.mpg_highway,
              mpg_combined = EXCLUDED.mpg_combined,
              fuel_type = EXCLUDED.fuel_type,
              body_style = EXCLUDED.body_style,
              updated_at = NOW()`,
            [
              year,
              make,
              model,
              option.text !== `${year} ${make} ${model}` ? option.text : null,
              fuelType,
              detail.city08 || null,
              detail.highway08 || null,
              detail.comb08 || null,
              fuelType === 'electric' && detail.combE ? detail.combE : null,
              option.value,
              bodyStyle,
            ]
          );
          totalInserted++;
        } catch (err: any) {
          if (err.code === '23505') {
            totalSkipped++;
          } else {
            console.error(`  Error inserting ${year} ${make} ${model}:`, err.message);
          }
        }
      }
    }

    console.log(`  Year ${year} complete. Total so far: ${totalInserted} inserted, ${totalSkipped} skipped`);
  }

  console.log(`\nSeed complete! ${totalInserted} vehicles inserted, ${totalSkipped} duplicates skipped.`);
  await pool.end();
}

seedVehicles().catch((err) => {
  console.error('Seed failed:', err);
  pool.end();
  process.exit(1);
});
