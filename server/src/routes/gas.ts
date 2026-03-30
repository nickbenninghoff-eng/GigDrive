import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// GET /api/v1/gas/nearby — nearby gas prices by zip
router.get('/nearby', async (req, res) => {
  try {
    const zip = req.query.zip as string;
    if (!zip) {
      res.status(400).json({ error: 'zip query parameter required' });
      return;
    }

    // Get recent prices for this zip area (last 48 hours)
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 48);

    const prices = await db
      .selectFrom('community_gas_prices')
      .selectAll()
      .where('zip_code', '=', zip)
      .where('reported_at', '>=', cutoff)
      .orderBy('regular_cents', 'asc')
      .limit(20)
      .execute();

    res.json(prices);
  } catch (err) {
    console.error('Gas nearby error:', err);
    res.status(500).json({ error: 'Failed to fetch gas prices' });
  }
});

// GET /api/v1/gas/average — national averages
router.get('/average', async (_req, res) => {
  try {
    // Fetch from FuelEconomy.gov national average (cached)
    const response = await fetch('https://www.fueleconomy.gov/ws/rest/fuelprices', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      res.json({
        regular: 3.50, midgrade: 3.89, premium: 4.19, diesel: 3.79,
        source: 'estimated', updated: new Date().toISOString(),
      });
      return;
    }

    const data = await response.json();
    res.json({
      regular: parseFloat(data.regular),
      midgrade: parseFloat(data.midgrade),
      premium: parseFloat(data.premium),
      diesel: parseFloat(data.diesel),
      source: 'fueleconomy.gov',
      updated: new Date().toISOString(),
    });
  } catch {
    res.json({
      regular: 3.50, midgrade: 3.89, premium: 4.19, diesel: 3.79,
      source: 'estimated', updated: new Date().toISOString(),
    });
  }
});

const reportGasSchema = z.object({
  stationName: z.string().min(1).max(100),
  brand: z.string().max(50).optional(),
  address: z.string().max(200).optional(),
  zipCode: z.string().min(5).max(10),
  regularCents: z.number().min(100).max(1000).optional(),
  midgradeCents: z.number().min(100).max(1000).optional(),
  premiumCents: z.number().min(100).max(1000).optional(),
  dieselCents: z.number().min(100).max(1000).optional(),
});

// POST /api/v1/gas/report — report a gas price (auth required)
router.post('/report', requireAuth, validate(reportGasSchema), async (req, res) => {
  try {
    const body = req.body;

    const entry = await db
      .insertInto('community_gas_prices')
      .values({
        user_id: req.user!.userId,
        station_name: body.stationName,
        brand: body.brand || null,
        address: body.address || null,
        zip_code: body.zipCode,
        regular_cents: body.regularCents || null,
        midgrade_cents: body.midgradeCents || null,
        premium_cents: body.premiumCents || null,
        diesel_cents: body.dieselCents || null,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.status(201).json({ id: entry.id });
  } catch (err) {
    console.error('Report gas error:', err);
    res.status(500).json({ error: 'Failed to report gas price' });
  }
});

export default router;
