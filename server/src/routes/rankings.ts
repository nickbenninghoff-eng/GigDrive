import { Router } from 'express';
import { z } from 'zod';
import { sql } from 'kysely';
import { db } from '../db/connection.js';
import { validate } from '../middleware/validation.js';

const router = Router();

const GIG_CATEGORIES = ['rideshare', 'food_delivery', 'grocery', 'package'] as const;

const rankingsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  year_min: z.coerce.number().optional(),
  year_max: z.coerce.number().optional(),
  body_style: z.string().optional(),
  fuel_type: z.string().optional(),
});

// GET /api/v1/rankings/:gigCategory
router.get('/:gigCategory', validate(rankingsQuerySchema, 'query'), async (req, res) => {
  try {
    const { gigCategory } = req.params;

    if (!GIG_CATEGORIES.includes(gigCategory as any)) {
      res.status(400).json({ error: `Invalid gig category. Must be one of: ${GIG_CATEGORIES.join(', ')}` });
      return;
    }

    const { limit, offset, year_min, year_max, body_style, fuel_type } = (res.locals.query || req.query) as unknown as z.infer<typeof rankingsQuerySchema>;

    let q = db
      .selectFrom('gig_vehicle_scores as g')
      .innerJoin('vehicles as v', 'v.id', 'g.vehicle_id')
      .select([
        'v.id',
        'v.year',
        'v.make',
        'v.model',
        'v.trim',
        'v.fuel_type',
        'v.mpg_combined',
        'v.body_style',
        'v.msrp_original',
        'v.nhtsa_overall_safety_rating',
        'v.passenger_capacity',
        'v.cargo_volume_cuft',
        'g.overall_score',
        'g.cost_score',
        'g.comfort_score',
        'g.cargo_score',
        'g.reliability_score',
        'g.gig_category',
      ])
      .where('g.gig_category', '=', gigCategory);

    if (year_min) q = q.where('v.year', '>=', year_min);
    if (year_max) q = q.where('v.year', '<=', year_max);
    if (body_style) q = q.where('v.body_style', '=', body_style);
    if (fuel_type) q = q.where('v.fuel_type', '=', fuel_type);

    q = q.orderBy('g.overall_score', 'desc').limit(limit).offset(offset);

    const results = await q.execute();

    // Get total count for pagination
    let countQ = db
      .selectFrom('gig_vehicle_scores as g')
      .innerJoin('vehicles as v', 'v.id', 'g.vehicle_id')
      .select(sql<number>`count(*)`.as('total'))
      .where('g.gig_category', '=', gigCategory);

    if (year_min) countQ = countQ.where('v.year', '>=', year_min);
    if (year_max) countQ = countQ.where('v.year', '<=', year_max);
    if (body_style) countQ = countQ.where('v.body_style', '=', body_style);
    if (fuel_type) countQ = countQ.where('v.fuel_type', '=', fuel_type);

    const countResult = await countQ.executeTakeFirst();
    const total = Number(countResult?.total || 0);

    res.json({
      category: gigCategory,
      results,
      pagination: { total, limit, offset },
    });
  } catch (err) {
    console.error('Rankings error:', err);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

// GET /api/v1/rankings — list available categories with top vehicle preview
router.get('/', async (_req, res) => {
  try {
    const categories = [];
    for (const cat of GIG_CATEGORIES) {
      const top3 = await db
        .selectFrom('gig_vehicle_scores as g')
        .innerJoin('vehicles as v', 'v.id', 'g.vehicle_id')
        .select(['v.year', 'v.make', 'v.model', 'g.overall_score'])
        .where('g.gig_category', '=', cat)
        .orderBy('g.overall_score', 'desc')
        .limit(3)
        .execute();

      categories.push({ category: cat, topVehicles: top3 });
    }
    res.json({ categories });
  } catch (err) {
    console.error('Rankings categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
