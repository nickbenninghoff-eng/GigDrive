import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { computeCpm, cpmInputSchema } from '../services/cpmCalculator.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// GET /api/v1/calculator/vehicles?query=camry&year=2022
const vehicleSearchSchema = z.object({
  query: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().optional(),
});

router.get('/vehicles', validate(vehicleSearchSchema, 'query'), async (req, res) => {
  try {
    const { query, make, model, year } = (res.locals.query || req.query) as z.infer<typeof vehicleSearchSchema>;

    let q = db.selectFrom('vehicles').selectAll().limit(50);

    if (query) {
      const search = `%${query}%`;
      q = q.where((eb) =>
        eb.or([
          eb('make', 'ilike', search),
          eb('model', 'ilike', search),
        ])
      );
    }
    if (make) q = q.where('make', 'ilike', make);
    if (model) q = q.where('model', 'ilike', model);
    if (year) q = q.where('year', '=', year);

    q = q.orderBy('year', 'desc').orderBy('make', 'asc').orderBy('model', 'asc');

    const vehicles = await q.execute();
    res.json(vehicles);
  } catch (err) {
    console.error('Vehicle search error:', err);
    res.status(500).json({ error: 'Failed to search vehicles' });
  }
});

// POST /api/v1/calculator/cost-per-mile
router.post('/cost-per-mile', validate(cpmInputSchema), async (req, res) => {
  try {
    const input = req.body;
    let mpg: number | undefined;
    let vehicleInfo: { year: number; make: string; model: string; mpgCombined: number } | undefined;

    if (input.vehicleId) {
      const vehicle = await db
        .selectFrom('vehicles')
        .selectAll()
        .where('id', '=', input.vehicleId)
        .executeTakeFirst();

      if (vehicle) {
        mpg = vehicle.mpg_combined ?? undefined;
        vehicleInfo = {
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          mpgCombined: vehicle.mpg_combined ?? 30,
        };
      }
    }

    const result = computeCpm(input, mpg);
    if (vehicleInfo) result.vehicle = vehicleInfo;

    res.json(result);
  } catch (err) {
    console.error('CPM calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate CPM' });
  }
});

// POST /api/v1/calculator/compare
const compareSchema = z.object({
  vehicles: z.array(cpmInputSchema).min(2).max(4),
});

router.post('/compare', validate(compareSchema), async (req, res) => {
  try {
    const { vehicles: inputs } = req.body;
    const results = [];

    for (const input of inputs) {
      let mpg: number | undefined;
      let vehicleInfo: { id: number; year: number; make: string; model: string } | undefined;

      if (input.vehicleId) {
        const vehicle = await db
          .selectFrom('vehicles')
          .selectAll()
          .where('id', '=', input.vehicleId)
          .executeTakeFirst();

        if (vehicle) {
          mpg = vehicle.mpg_combined ?? undefined;
          vehicleInfo = {
            id: vehicle.id,
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
          };
        }
      }

      const cpm = computeCpm(input, mpg);
      results.push({ vehicle: vehicleInfo, cpm });
    }

    res.json({ vehicles: results });
  } catch (err) {
    console.error('Compare error:', err);
    res.status(500).json({ error: 'Failed to compare vehicles' });
  }
});

export default router;
