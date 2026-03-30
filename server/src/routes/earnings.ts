import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();
router.use(requireAuth);

// Manual earnings entry
const manualEarningsSchema = z.object({
  platform: z.enum(['uber', 'lyft', 'doordash', 'instacart', 'amazon_flex', 'grubhub', 'other']),
  periodStart: z.string(),
  periodEnd: z.string(),
  grossEarningsCents: z.number().min(0),
  tipsCents: z.number().min(0).default(0),
  bonusesCents: z.number().min(0).default(0),
  tripsCount: z.number().optional(),
  onlineHours: z.number().optional(),
});

// POST /api/v1/my/earnings/manual
router.post('/manual', validate(manualEarningsSchema), async (req, res) => {
  try {
    const body = req.body;

    const entry = await db
      .insertInto('earnings_imports')
      .values({
        user_id: req.user!.userId,
        platform: body.platform,
        import_method: 'manual',
        period_start: new Date(body.periodStart),
        period_end: new Date(body.periodEnd),
        gross_earnings_cents: body.grossEarningsCents,
        tips_cents: body.tipsCents,
        bonuses_cents: body.bonusesCents,
        trips_count: body.tripsCount || null,
        online_hours: body.onlineHours || null,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.status(201).json({ id: entry.id });
  } catch (err) {
    console.error('Manual earnings error:', err);
    res.status(500).json({ error: 'Failed to save earnings' });
  }
});

// POST /api/v1/my/earnings/import-csv
const importCsvSchema = z.object({
  platform: z.enum(['uber', 'lyft', 'doordash', 'instacart', 'amazon_flex', 'grubhub', 'other']),
  csvData: z.string().min(10).max(500000), // Max ~500KB CSV
});

router.post('/import-csv', validate(importCsvSchema), async (req, res) => {
  try {
    const { platform, csvData } = req.body;

    if (!csvData || typeof csvData !== 'string') {
      res.status(400).json({ error: 'csvData string required' });
      return;
    }

    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      res.status(400).json({ error: 'CSV must have at least a header and one data row' });
      return;
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase().replace(/"/g, ''));
    const entries: Array<{
      periodStart: string; periodEnd: string;
      grossCents: number; tipsCents: number; trips: number;
    }> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h: string, idx: number) => { row[h] = values[idx] || ''; });

      // Parse based on platform format
      const parsed = parseRow(platform, row);
      if (parsed) entries.push(parsed);
    }

    // Insert all entries
    let inserted = 0;
    for (const entry of entries) {
      await db
        .insertInto('earnings_imports')
        .values({
          user_id: req.user!.userId,
          platform,
          import_method: 'csv',
          period_start: new Date(entry.periodStart),
          period_end: new Date(entry.periodEnd),
          gross_earnings_cents: entry.grossCents,
          tips_cents: entry.tipsCents,
          bonuses_cents: 0,
          trips_count: entry.trips || null,
          online_hours: null,
        })
        .execute();
      inserted++;
    }

    res.json({ imported: inserted, total: entries.length });
  } catch (err) {
    console.error('CSV import error:', err);
    res.status(500).json({ error: 'Failed to import CSV' });
  }
});

function parseRow(platform: string, row: Record<string, string>) {
  const toCents = (s: string) => Math.round(parseFloat(s.replace(/[$,]/g, '') || '0') * 100);

  try {
    switch (platform) {
      case 'uber': {
        // Uber CSV typically: Date, Trip Earnings, Tips, Total
        const date = row['date'] || row['trip date'] || row['request time'] || '';
        const earnings = toCents(row['trip earnings'] || row['fare'] || row['total'] || '0');
        const tips = toCents(row['tips'] || row['tip'] || '0');
        if (!date) return null;
        return { periodStart: date, periodEnd: date, grossCents: earnings, tipsCents: tips, trips: 1 };
      }
      case 'lyft': {
        // Lyft CSV: Date, Ride Earnings, Tips, Total
        const date = row['date'] || row['ride date'] || '';
        const earnings = toCents(row['ride earnings'] || row['earnings'] || row['total'] || '0');
        const tips = toCents(row['tips'] || row['tip'] || '0');
        if (!date) return null;
        return { periodStart: date, periodEnd: date, grossCents: earnings, tipsCents: tips, trips: 1 };
      }
      case 'doordash': {
        // DoorDash: Date, Subtotal, Tip, Total
        const date = row['date'] || row['delivery date'] || '';
        const earnings = toCents(row['subtotal'] || row['dasher pay'] || row['total'] || '0');
        const tips = toCents(row['tip'] || row['tips'] || '0');
        if (!date) return null;
        return { periodStart: date, periodEnd: date, grossCents: earnings, tipsCents: tips, trips: 1 };
      }
      default: {
        // Generic: try to find date, amount, tip columns
        const date = row['date'] || Object.values(row)[0] || '';
        const earnings = toCents(row['total'] || row['earnings'] || row['amount'] || Object.values(row)[1] || '0');
        const tips = toCents(row['tips'] || row['tip'] || '0');
        if (!date) return null;
        return { periodStart: date, periodEnd: date, grossCents: earnings, tipsCents: tips, trips: 1 };
      }
    }
  } catch {
    return null;
  }
}

// GET /api/v1/my/earnings
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;

    let q = db
      .selectFrom('earnings_imports')
      .selectAll()
      .where('user_id', '=', req.user!.userId)
      .orderBy('period_start', 'desc')
      .limit(200);

    if (from) q = q.where('period_start', '>=', new Date(from as string));
    if (to) q = q.where('period_end', '<=', new Date(to as string));

    const earnings = await q.execute();
    res.json(earnings);
  } catch (err) {
    console.error('Get earnings error:', err);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// GET /api/v1/my/earnings/summary
router.get('/summary', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db
      .selectFrom('earnings_imports')
      .select([
        db.fn.sum<number>('gross_earnings_cents').as('total_gross'),
        db.fn.sum<number>('tips_cents').as('total_tips'),
        db.fn.sum<number>('bonuses_cents').as('total_bonuses'),
        db.fn.sum<number>('trips_count').as('total_trips'),
      ])
      .where('user_id', '=', req.user!.userId)
      .where('period_start', '>=', thirtyDaysAgo)
      .executeTakeFirst();

    res.json({
      period: '30d',
      totalGrossCents: Number(result?.total_gross || 0),
      totalTipsCents: Number(result?.total_tips || 0),
      totalBonusesCents: Number(result?.total_bonuses || 0),
      totalTrips: Number(result?.total_trips || 0),
      totalEarningsCents: Number(result?.total_gross || 0) + Number(result?.total_tips || 0) + Number(result?.total_bonuses || 0),
    });
  } catch (err) {
    console.error('Earnings summary error:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
