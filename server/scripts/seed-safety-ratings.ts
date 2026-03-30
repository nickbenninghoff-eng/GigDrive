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

const NHTSA_BASE = 'https://api.nhtsa.gov/SafetyRatings';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json();
}

interface SafetyResult {
  VehicleId: number;
  OverallRating: string;
  OverallFrontCrashRating: string;
  OverallSideCrashRating: string;
  RolloverRating: string;
}

async function seedSafetyRatings() {
  console.log('Fetching NHTSA safety ratings for seeded vehicles...\n');

  // Get distinct make/model/year combinations from our database
  const { rows: vehicles } = await pool.query(`
    SELECT DISTINCT year, make, model, id
    FROM vehicles
    WHERE nhtsa_overall_safety_rating IS NULL
    ORDER BY year DESC, make, model
  `);

  console.log(`Found ${vehicles.length} vehicles needing safety ratings\n`);

  let updated = 0;
  let notFound = 0;
  let errors = 0;

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    const { year, make, model, id } = v;

    try {
      // Step 1: Get NHTSA vehicle IDs for this make/model/year
      const encodedMake = encodeURIComponent(make);
      const encodedModel = encodeURIComponent(model);
      const searchUrl = `${NHTSA_BASE}/modelyear/${year}/make/${encodedMake}/model/${encodedModel}?format=json`;

      const searchData = await fetchJson(searchUrl);
      await sleep(250);

      if (!searchData?.Results?.length) {
        notFound++;
        continue;
      }

      // Step 2: Get safety ratings for the first matching vehicle
      const nhtsaVehicleId = searchData.Results[0].VehicleId;
      const ratingUrl = `${NHTSA_BASE}/VehicleId/${nhtsaVehicleId}?format=json`;
      const ratingData = await fetchJson(ratingUrl);
      await sleep(250);

      if (!ratingData?.Results?.length) {
        notFound++;
        continue;
      }

      const rating: SafetyResult = ratingData.Results[0];
      const overallRating = rating.OverallRating === 'Not Rated' ? null : parseInt(rating.OverallRating);

      if (overallRating !== null) {
        await pool.query(
          `UPDATE vehicles SET nhtsa_overall_safety_rating = $1, nhtsa_vehicle_id = $2, updated_at = NOW() WHERE id = $3`,
          [overallRating, String(nhtsaVehicleId), id]
        );
        updated++;
      } else {
        notFound++;
      }
    } catch (err: any) {
      errors++;
      if (errors <= 5) {
        console.error(`  Error for ${year} ${make} ${model}: ${err.message}`);
      }
    }

    // Progress log every 50 vehicles
    if ((i + 1) % 50 === 0) {
      console.log(`  Progress: ${i + 1}/${vehicles.length} (${updated} updated, ${notFound} not found)`);
    }
  }

  console.log(`\nSafety ratings complete: ${updated} updated, ${notFound} not found, ${errors} errors`);
}

async function seedComplaintCounts() {
  console.log('\nFetching NHTSA complaint counts...\n');

  const { rows: vehicles } = await pool.query(`
    SELECT DISTINCT year, make, model, id
    FROM vehicles
    WHERE nhtsa_complaint_count IS NULL
    ORDER BY year DESC, make, model
  `);

  console.log(`Found ${vehicles.length} vehicles needing complaint counts\n`);

  let updated = 0;
  let errors = 0;

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    const { year, make, model, id } = v;

    try {
      const encodedMake = encodeURIComponent(make);
      const encodedModel = encodeURIComponent(model);
      const url = `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodedMake}&model=${encodedModel}&modelYear=${year}`;

      const data = await fetchJson(url);
      await sleep(250);

      const count = data?.results?.length ?? 0;

      await pool.query(
        `UPDATE vehicles SET nhtsa_complaint_count = $1, updated_at = NOW() WHERE id = $2`,
        [count, id]
      );
      updated++;
    } catch (err: any) {
      errors++;
      if (errors <= 5) {
        console.error(`  Error for ${year} ${make} ${model}: ${err.message}`);
      }
    }

    if ((i + 1) % 50 === 0) {
      console.log(`  Progress: ${i + 1}/${vehicles.length} (${updated} updated)`);
    }
  }

  console.log(`\nComplaint counts complete: ${updated} updated, ${errors} errors`);
}

async function main() {
  await seedSafetyRatings();
  await seedComplaintCounts();
  await pool.end();
  console.log('\nAll NHTSA data seeding complete!');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  pool.end();
  process.exit(1);
});
