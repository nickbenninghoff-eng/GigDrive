import { Router } from 'express';
import { z } from 'zod';
import { sql } from 'kysely';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// GET /api/v1/benchmarks/market?zip=90210 — earnings benchmarks for a market
router.get('/market', async (req, res) => {
  try {
    const zip = (req.query.zip as string) || '';
    const zipPrefix = zip.substring(0, 3);

    if (zipPrefix.length < 3) {
      res.status(400).json({ error: 'Valid zip code required' });
      return;
    }

    const benchmarks = await db
      .selectFrom('earnings_benchmarks')
      .selectAll()
      .where('zip_prefix', '=', zipPrefix)
      .orderBy('platform', 'asc')
      .execute();

    const comparison = await db
      .selectFrom('market_comparisons')
      .selectAll()
      .where('zip_prefix', '=', zipPrefix)
      .executeTakeFirst();

    res.json({ zipPrefix, benchmarks, comparison });
  } catch (err) {
    console.error('Market benchmark error:', err);
    res.status(500).json({ error: 'Failed to fetch benchmarks' });
  }
});

// GET /api/v1/benchmarks/national — national averages across all markets
router.get('/national', async (_req, res) => {
  try {
    const nationals = await db
      .selectFrom('earnings_benchmarks')
      .select([
        'platform',
        sql<number>`AVG(avg_gross_hourly_cents)`.as('avg_hourly'),
        sql<number>`AVG(avg_tips_pct)`.as('avg_tips_pct'),
        sql<number>`AVG(avg_platform_fee_pct)`.as('avg_fee_pct'),
        sql<number>`SUM(sample_size)`.as('total_sample'),
      ])
      .groupBy('platform')
      .execute();

    // If no real data, return industry estimates
    if (nationals.length === 0) {
      res.json({
        platforms: [
          { platform: 'uber', avg_hourly_cents: 2150, avg_tips_pct: 12, avg_fee_pct: 35, total_sample: 0 },
          { platform: 'lyft', avg_hourly_cents: 1980, avg_tips_pct: 10, avg_fee_pct: 32, total_sample: 0 },
          { platform: 'doordash', avg_hourly_cents: 1750, avg_tips_pct: 25, avg_fee_pct: 28, total_sample: 0 },
          { platform: 'instacart', avg_hourly_cents: 1620, avg_tips_pct: 18, avg_fee_pct: 30, total_sample: 0 },
          { platform: 'amazon_flex', avg_hourly_cents: 2200, avg_tips_pct: 5, avg_fee_pct: 0, total_sample: 0 },
        ],
        source: 'estimated',
      });
      return;
    }

    res.json({ platforms: nationals, source: 'community' });
  } catch (err) {
    console.error('National benchmark error:', err);
    res.status(500).json({ error: 'Failed to fetch national benchmarks' });
  }
});

// ============ FEE TRANSPARENCY ============

const feeReportSchema = z.object({
  platform: z.enum(['uber', 'lyft', 'doordash', 'instacart', 'amazon_flex', 'grubhub']),
  tripDate: z.string(),
  riderPaidCents: z.number().min(100),
  driverReceivedCents: z.number().min(0),
  tipCents: z.number().min(0).default(0),
  surgeMultiplier: z.number().min(1).default(1.0),
  tripDistanceMiles: z.number().min(0).optional(),
  tripDurationMinutes: z.number().min(0).optional(),
  zipCode: z.string().max(10).optional(),
});

// POST /api/v1/benchmarks/fee-report — submit a fee transparency report
router.post('/fee-report', requireAuth, validate(feeReportSchema), async (req, res) => {
  try {
    const body = req.body;

    const report = await db
      .insertInto('platform_fee_reports')
      .values({
        user_id: req.user!.userId,
        platform: body.platform,
        trip_date: new Date(body.tripDate),
        rider_paid_cents: body.riderPaidCents,
        driver_received_cents: body.driverReceivedCents,
        tip_cents: body.tipCents,
        surge_multiplier: body.surgeMultiplier,
        trip_distance_miles: body.tripDistanceMiles || null,
        trip_duration_minutes: body.tripDurationMinutes || null,
        zip_code: body.zipCode || null,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.status(201).json({ id: report.id });
  } catch (err) {
    console.error('Fee report error:', err);
    res.status(500).json({ error: 'Failed to submit fee report' });
  }
});

// GET /api/v1/benchmarks/fee-transparency — aggregated fee data by platform
router.get('/fee-transparency', async (req, res) => {
  try {
    const platform = req.query.platform as string | undefined;

    let q = db
      .selectFrom('platform_fee_reports')
      .select([
        'platform',
        sql<number>`AVG(rider_paid_cents)`.as('avg_rider_paid'),
        sql<number>`AVG(driver_received_cents)`.as('avg_driver_received'),
        sql<number>`AVG(tip_cents)`.as('avg_tip'),
        sql<number>`AVG((rider_paid_cents - driver_received_cents - tip_cents)::float / NULLIF(rider_paid_cents, 0) * 100)`.as('avg_fee_pct'),
        sql<number>`COUNT(*)`.as('report_count'),
      ])
      .groupBy('platform');

    if (platform) q = q.having('platform', '=', platform);

    const results = await q.execute();

    // If no real data, return industry estimates
    if (results.length === 0) {
      res.json({
        platforms: [
          { platform: 'uber', avg_fee_pct: 35, avg_rider_paid: 2500, avg_driver_received: 1625, report_count: 0 },
          { platform: 'lyft', avg_fee_pct: 32, avg_rider_paid: 2200, avg_driver_received: 1496, report_count: 0 },
          { platform: 'doordash', avg_fee_pct: 28, avg_rider_paid: 1800, avg_driver_received: 1296, report_count: 0 },
          { platform: 'instacart', avg_fee_pct: 30, avg_rider_paid: 3500, avg_driver_received: 2450, report_count: 0 },
        ],
        source: 'estimated',
      });
      return;
    }

    res.json({ platforms: results, source: 'community' });
  } catch (err) {
    console.error('Fee transparency error:', err);
    res.status(500).json({ error: 'Failed to fetch fee data' });
  }
});

// POST /api/v1/benchmarks/fee-calculator — personal fee breakdown
router.post('/fee-calculator', async (req, res) => {
  try {
    const { weeklyEarningsCents, platform, hoursWorked } = req.body;

    if (!weeklyEarningsCents || !platform) {
      res.status(400).json({ error: 'weeklyEarningsCents and platform required' });
      return;
    }

    // Platform fee estimates
    const feeRates: Record<string, number> = {
      uber: 0.35,
      lyft: 0.32,
      doordash: 0.28,
      instacart: 0.30,
      amazon_flex: 0.0,
      grubhub: 0.25,
    };

    const feeRate = feeRates[platform] || 0.30;
    const grossRiderPaid = Math.round(weeklyEarningsCents / (1 - feeRate));
    const platformFeeCents = grossRiderPaid - weeklyEarningsCents;
    const monthlyFeeCents = platformFeeCents * 4.33;
    const yearlyFeeCents = platformFeeCents * 52;

    // What you'd save at different fee rates
    const savings = [
      { feeRate: 0.15, label: '15% fee platform', savingsWeekly: platformFeeCents - Math.round(grossRiderPaid * 0.15) },
      { feeRate: 0.10, label: '10% fee platform', savingsWeekly: platformFeeCents - Math.round(grossRiderPaid * 0.10) },
      { feeRate: 0.05, label: '5% fee platform', savingsWeekly: platformFeeCents - Math.round(grossRiderPaid * 0.05) },
    ].map((s) => ({
      ...s,
      savingsMonthly: Math.round(s.savingsWeekly * 4.33),
      savingsYearly: s.savingsWeekly * 52,
    }));

    const hourlyGross = hoursWorked ? Math.round(weeklyEarningsCents / hoursWorked) : null;

    res.json({
      platform,
      weeklyEarningsCents,
      estimatedFeeRate: feeRate,
      estimatedGrossRiderPaidCents: grossRiderPaid,
      platformFeeCents: {
        weekly: platformFeeCents,
        monthly: monthlyFeeCents,
        yearly: yearlyFeeCents,
      },
      hourlyGrossCents: hourlyGross,
      savings,
    });
  } catch (err) {
    console.error('Fee calculator error:', err);
    res.status(500).json({ error: 'Failed to calculate fees' });
  }
});

export default router;
