import { Router } from 'express';
import { z } from 'zod';
import { sql } from 'kysely';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// ============ REPAIR REPORTS ============

const repairReportSchema = z.object({
  vehicleId: z.number(),
  serviceType: z.string().min(1).max(50),
  amountCents: z.number().min(100).max(5000000),
  mileageAtService: z.number().optional(),
  shopType: z.enum(['dealer', 'independent', 'diy', 'chain']).optional(),
  zipCode: z.string().max(10).optional(),
  description: z.string().max(1000).optional(),
});

// GET /api/v1/community/repairs — browse reports
router.get('/repairs', async (req, res) => {
  try {
    const vehicleId = req.query.vehicleId ? parseInt(req.query.vehicleId as string, 10) : undefined;
    const serviceType = req.query.serviceType as string | undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 50);

    let q = db
      .selectFrom('community_repair_reports as r')
      .innerJoin('vehicles as v', 'v.id', 'r.vehicle_id')
      .innerJoin('users as u', 'u.id', 'r.user_id')
      .select([
        'r.id', 'r.service_type', 'r.amount_cents', 'r.mileage_at_service',
        'r.shop_type', 'r.description', 'r.upvotes', 'r.downvotes', 'r.created_at',
        'v.year', 'v.make', 'v.model',
        'u.display_name',
      ])
      .orderBy('r.created_at', 'desc')
      .limit(limit);

    if (vehicleId) q = q.where('r.vehicle_id', '=', vehicleId);
    if (serviceType) q = q.where('r.service_type', '=', serviceType);

    const reports = await q.execute();
    res.json(reports);
  } catch (err) {
    console.error('Get repairs error:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/v1/community/repairs/averages — aggregated averages for a vehicle
router.get('/repairs/averages', async (req, res) => {
  try {
    const vehicleId = parseInt(req.query.vehicleId as string, 10);
    if (isNaN(vehicleId)) {
      res.status(400).json({ error: 'vehicleId required' });
      return;
    }

    const averages = await db
      .selectFrom('community_repair_aggregates')
      .selectAll()
      .where('vehicle_id', '=', vehicleId)
      .orderBy('service_type', 'asc')
      .execute();

    res.json(averages);
  } catch (err) {
    console.error('Get averages error:', err);
    res.status(500).json({ error: 'Failed to fetch averages' });
  }
});

// POST /api/v1/community/repairs — submit a report (auth required)
router.post('/repairs', requireAuth, validate(repairReportSchema), async (req, res) => {
  try {
    const body = req.body;

    const report = await db
      .insertInto('community_repair_reports')
      .values({
        user_id: req.user!.userId,
        vehicle_id: body.vehicleId,
        service_type: body.serviceType,
        amount_cents: body.amountCents,
        mileage_at_service: body.mileageAtService || null,
        shop_type: body.shopType || null,
        zip_code: body.zipCode || null,
        description: body.description || null,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    // Recompute aggregates for this vehicle+service
    await recomputeAggregate(body.vehicleId, body.serviceType);

    // Update user stats
    await db
      .insertInto('user_stats')
      .values({
        user_id: req.user!.userId,
        total_repair_reports: 1,
        last_contribution_date: new Date(),
        reputation_score: 10,
      })
      .onConflict((oc) =>
        oc.column('user_id').doUpdateSet((eb) => ({
          total_repair_reports: sql`user_stats.total_repair_reports + 1`,
          last_contribution_date: new Date(),
          reputation_score: sql`user_stats.reputation_score + 10`,
        }))
      )
      .execute();

    res.status(201).json({ id: report.id });
  } catch (err) {
    console.error('Submit repair error:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// POST /api/v1/community/repairs/:id/vote
router.post('/repairs/:id/vote', requireAuth, async (req, res) => {
  try {
    const reportId = parseInt(req.params.id as string, 10);
    const { vote } = req.body; // 1 or -1

    if (vote !== 1 && vote !== -1) {
      res.status(400).json({ error: 'Vote must be 1 or -1' });
      return;
    }

    // Upsert vote
    await db
      .insertInto('repair_report_votes')
      .values({ user_id: req.user!.userId, report_id: reportId, vote })
      .onConflict((oc) => oc.columns(['user_id', 'report_id']).doUpdateSet({ vote }))
      .execute();

    // Recount votes
    const upvotes = await db
      .selectFrom('repair_report_votes')
      .select(db.fn.count<number>('user_id').as('cnt'))
      .where('report_id', '=', reportId)
      .where('vote', '=', 1)
      .executeTakeFirst();

    const downvotes = await db
      .selectFrom('repair_report_votes')
      .select(db.fn.count<number>('user_id').as('cnt'))
      .where('report_id', '=', reportId)
      .where('vote', '=', -1)
      .executeTakeFirst();

    await db
      .updateTable('community_repair_reports')
      .set({ upvotes: Number(upvotes?.cnt || 0), downvotes: Number(downvotes?.cnt || 0) })
      .where('id', '=', reportId)
      .execute();

    res.json({ upvotes: Number(upvotes?.cnt || 0), downvotes: Number(downvotes?.cnt || 0) });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// ============ TIPS ============

const tipSchema = z.object({
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  gigPlatform: z.string().optional(),
  title: z.string().min(1).max(150),
  body: z.string().min(1).max(2000),
});

// GET /api/v1/community/tips
router.get('/tips', async (req, res) => {
  try {
    const make = req.query.make as string | undefined;
    const platform = req.query.platform as string | undefined;

    let q = db
      .selectFrom('community_tips as t')
      .innerJoin('users as u', 'u.id', 't.user_id')
      .select([
        't.id', 't.vehicle_make', 't.vehicle_model', 't.gig_platform',
        't.title', 't.body', 't.upvotes', 't.downvotes', 't.created_at',
        'u.display_name',
      ])
      .orderBy('t.upvotes', 'desc')
      .limit(50);

    if (make) q = q.where('t.vehicle_make', 'ilike', make as string);
    if (platform) q = q.where('t.gig_platform', '=', platform as string);

    const tips = await q.execute();
    res.json(tips);
  } catch (err) {
    console.error('Get tips error:', err);
    res.status(500).json({ error: 'Failed to fetch tips' });
  }
});

// POST /api/v1/community/tips
router.post('/tips', requireAuth, validate(tipSchema), async (req, res) => {
  try {
    const body = req.body;

    const tip = await db
      .insertInto('community_tips')
      .values({
        user_id: req.user!.userId,
        vehicle_make: body.vehicleMake || null,
        vehicle_model: body.vehicleModel || null,
        gig_platform: body.gigPlatform || null,
        title: body.title,
        body: body.body,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.status(201).json({ id: tip.id });
  } catch (err) {
    console.error('Submit tip error:', err);
    res.status(500).json({ error: 'Failed to submit tip' });
  }
});

// ============ HELPERS ============

async function recomputeAggregate(vehicleId: number, serviceType: string) {
  const reports = await db
    .selectFrom('community_repair_reports')
    .select('amount_cents')
    .where('vehicle_id', '=', vehicleId)
    .where('service_type', '=', serviceType)
    .where(sql`upvotes - downvotes`, '>=', -5) // Exclude heavily downvoted
    .execute();

  if (reports.length === 0) return;

  const amounts = reports.map((r) => r.amount_cents).sort((a, b) => a - b);
  const avg = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);
  const median = amounts[Math.floor(amounts.length / 2)];
  const min = amounts[0];
  const max = amounts[amounts.length - 1];
  const confidence = amounts.length < 5 ? 'low' : amounts.length < 20 ? 'medium' : 'high';

  await db
    .insertInto('community_repair_aggregates')
    .values({
      vehicle_id: vehicleId,
      service_type: serviceType,
      avg_cost_cents: avg,
      median_cost_cents: median,
      min_cost_cents: min,
      max_cost_cents: max,
      report_count: amounts.length,
      confidence_level: confidence,
    })
    .onConflict((oc) =>
      oc.columns(['vehicle_id', 'service_type']).doUpdateSet({
        avg_cost_cents: avg,
        median_cost_cents: median,
        min_cost_cents: min,
        max_cost_cents: max,
        report_count: amounts.length,
        confidence_level: confidence,
        computed_at: new Date(),
      })
    )
    .execute();
}

export default router;
