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

// Normalize a value to 0-10 scale given min/max range
function normalize(value: number | null, min: number, max: number, invert = false): number {
  if (value === null || value === undefined) return 5; // Default middle score
  const clamped = Math.max(min, Math.min(max, value));
  const score = ((clamped - min) / (max - min)) * 10;
  return invert ? 10 - score : score;
}

// Body style comfort mapping (for rideshare passenger comfort)
function comfortFromBodyStyle(bodyStyle: string | null): number {
  const map: Record<string, number> = {
    full_size_sedan: 9,
    midsize_sedan: 8,
    sedan: 7.5,
    suv: 8,
    van: 7,
    wagon: 7,
    compact: 6,
    small_car: 5,
    truck: 5,
    sports: 6,
  };
  return map[bodyStyle || ''] ?? 6;
}

// Cargo volume scoring
function cargoScore(volumeCuft: number | null, bodyStyle: string | null): number {
  // If we have actual volume, use it
  if (volumeCuft) return normalize(volumeCuft, 5, 80);
  // Otherwise estimate from body style
  const map: Record<string, number> = {
    suv: 8, van: 9, truck: 9, wagon: 7,
    full_size_sedan: 6, midsize_sedan: 5.5, sedan: 5,
    compact: 4, small_car: 3, sports: 2,
  };
  return map[bodyStyle || ''] ?? 5;
}

interface VehicleRow {
  id: number;
  mpg_combined: number | null;
  nhtsa_overall_safety_rating: number | null;
  nhtsa_complaint_count: number | null;
  msrp_original: number | null;
  body_style: string | null;
  cargo_volume_cuft: number | null;
  fuel_type: string;
  passenger_capacity: number | null;
}

type GigCategory = 'rideshare' | 'food_delivery' | 'grocery' | 'package';

interface GigWeights {
  mpg: number;
  comfort: number;
  reliability: number;
  safety: number;
  cost: number;
  cargo: number;
}

const WEIGHTS: Record<GigCategory, GigWeights> = {
  rideshare:     { mpg: 0.35, comfort: 0.25, reliability: 0.25, safety: 0.15, cost: 0,    cargo: 0 },
  food_delivery: { mpg: 0.50, comfort: 0,    reliability: 0.20, safety: 0,    cost: 0.30, cargo: 0 },
  grocery:       { mpg: 0.30, comfort: 0,    reliability: 0.15, safety: 0,    cost: 0.20, cargo: 0.35 },
  package:       { mpg: 0.20, comfort: 0,    reliability: 0.30, safety: 0,    cost: 0.10, cargo: 0.40 },
};

function computeScores(vehicle: VehicleRow, category: GigCategory) {
  const w = WEIGHTS[category];

  const mpgScore = normalize(vehicle.mpg_combined, 15, 60);
  const safetyScore = normalize(vehicle.nhtsa_overall_safety_rating, 1, 5) ;
  // Fewer complaints = better reliability (invert)
  const reliabilityScore = normalize(vehicle.nhtsa_complaint_count, 0, 200, true);
  const costScore = normalize(vehicle.msrp_original, 15000, 60000, true); // Cheaper = better
  const comfort = comfortFromBodyStyle(vehicle.body_style);
  const cargo = cargoScore(vehicle.cargo_volume_cuft, vehicle.body_style);

  const overall =
    mpgScore * w.mpg +
    comfort * w.comfort +
    reliabilityScore * w.reliability +
    safetyScore * w.safety +
    costScore * w.cost +
    cargo * w.cargo;

  return {
    overall: Math.round(overall * 100) / 100,
    cost: Math.round(costScore * 100) / 100,
    comfort: Math.round(comfort * 100) / 100,
    cargo: Math.round(cargo * 100) / 100,
    reliability: Math.round(reliabilityScore * 100) / 100,
  };
}

async function main() {
  console.log('Computing gig vehicle scores...\n');

  const { rows: vehicles } = await pool.query<VehicleRow>(`
    SELECT id, mpg_combined, nhtsa_overall_safety_rating, nhtsa_complaint_count,
           msrp_original, body_style, cargo_volume_cuft, fuel_type, passenger_capacity
    FROM vehicles
    WHERE mpg_combined IS NOT NULL
  `);

  console.log(`Found ${vehicles.length} vehicles with MPG data\n`);

  // Clear existing scores
  await pool.query('DELETE FROM gig_vehicle_scores');

  const categories: GigCategory[] = ['rideshare', 'food_delivery', 'grocery', 'package'];
  let totalInserted = 0;

  for (const vehicle of vehicles) {
    for (const category of categories) {
      const scores = computeScores(vehicle, category);

      await pool.query(
        `INSERT INTO gig_vehicle_scores (vehicle_id, gig_category, overall_score, cost_score, comfort_score, cargo_score, reliability_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (vehicle_id, gig_category) DO UPDATE SET
           overall_score = EXCLUDED.overall_score,
           cost_score = EXCLUDED.cost_score,
           comfort_score = EXCLUDED.comfort_score,
           cargo_score = EXCLUDED.cargo_score,
           reliability_score = EXCLUDED.reliability_score,
           computed_at = NOW()`,
        [vehicle.id, category, scores.overall, scores.cost, scores.comfort, scores.cargo, scores.reliability]
      );
      totalInserted++;
    }

    if (totalInserted % 200 === 0) {
      console.log(`  Inserted ${totalInserted} scores...`);
    }
  }

  console.log(`\nDone! Inserted ${totalInserted} gig scores for ${vehicles.length} vehicles.`);

  // Show top 5 for each category
  for (const cat of categories) {
    const { rows: top } = await pool.query(`
      SELECT v.year, v.make, v.model, g.overall_score, g.cost_score, g.comfort_score, g.cargo_score, g.reliability_score
      FROM gig_vehicle_scores g
      JOIN vehicles v ON v.id = g.vehicle_id
      WHERE g.gig_category = $1
      ORDER BY g.overall_score DESC
      LIMIT 5
    `, [cat]);

    console.log(`\nTop 5 for ${cat}:`);
    top.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.year} ${r.make} ${r.model} — Score: ${r.overall_score}`);
    });
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Compute failed:', err);
  pool.end();
  process.exit(1);
});
