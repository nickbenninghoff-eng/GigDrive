import { Router } from 'express';
import { z } from 'zod';
import { sql } from 'kysely';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// All dashboard routes require auth
router.use(requireAuth);

// Ownership verification helper — prevents horizontal privilege escalation
async function verifyVehicleOwnership(userVehicleId: number, userId: number): Promise<boolean> {
  const vehicle = await db
    .selectFrom('user_vehicles')
    .select('user_id')
    .where('id', '=', userVehicleId)
    .where('user_id', '=', userId)
    .executeTakeFirst();
  return !!vehicle;
}

// ============ USER VEHICLES ============

const addVehicleSchema = z.object({
  vehicleId: z.number(),
  nickname: z.string().max(50).optional(),
  purchasePrice: z.number().optional(),
  purchaseMileage: z.number().optional(),
  currentMileage: z.number().optional(),
  monthlyInsuranceCents: z.number().optional(),
  monthlyPaymentCents: z.number().optional(),
});

// GET /api/v1/my/vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await db
      .selectFrom('user_vehicles as uv')
      .innerJoin('vehicles as v', 'v.id', 'uv.vehicle_id')
      .select([
        'uv.id', 'uv.nickname', 'uv.purchase_price', 'uv.current_mileage',
        'uv.monthly_insurance_cents', 'uv.monthly_payment_cents', 'uv.is_primary',
        'v.year', 'v.make', 'v.model', 'v.trim', 'v.mpg_combined', 'v.fuel_type',
        'v.body_style',
      ])
      .where('uv.user_id', '=', req.user!.userId)
      .orderBy('uv.is_primary', 'desc')
      .execute();

    res.json(vehicles);
  } catch (err) {
    console.error('Get vehicles error:', err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// POST /api/v1/my/vehicles
router.post('/vehicles', validate(addVehicleSchema), async (req, res) => {
  try {
    const { vehicleId, nickname, purchasePrice, purchaseMileage, currentMileage, monthlyInsuranceCents, monthlyPaymentCents } = req.body;

    // Check if user has any vehicles (first one becomes primary)
    const existing = await db
      .selectFrom('user_vehicles')
      .select('id')
      .where('user_id', '=', req.user!.userId)
      .executeTakeFirst();

    const userVehicle = await db
      .insertInto('user_vehicles')
      .values({
        user_id: req.user!.userId,
        vehicle_id: vehicleId,
        nickname: nickname || null,
        purchase_price: purchasePrice || null,
        purchase_mileage: purchaseMileage || null,
        current_mileage: currentMileage || null,
        monthly_insurance_cents: monthlyInsuranceCents || null,
        monthly_payment_cents: monthlyPaymentCents || null,
        is_primary: !existing,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.status(201).json({ id: userVehicle.id });
  } catch (err) {
    console.error('Add vehicle error:', err);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

// ============ EXPENSES ============

const addExpenseSchema = z.object({
  userVehicleId: z.number(),
  category: z.enum(['fuel', 'oil_change', 'tires', 'repair', 'insurance', 'car_wash', 'other']),
  subcategory: z.string().optional(),
  amountCents: z.number().min(1),
  odometerReading: z.number().optional(),
  date: z.string(), // ISO date string
  notes: z.string().optional(),
  gallons: z.number().optional(),
  pricePerGallonCents: z.number().optional(),
  stationName: z.string().optional(),
  isBusinessExpense: z.boolean().default(true),
});

// GET /api/v1/my/vehicles/:id/expenses
router.get('/vehicles/:id/expenses', async (req, res) => {
  try {
    const userVehicleId = parseInt(req.params.id, 10);
    if (!(await verifyVehicleOwnership(userVehicleId, req.user!.userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const { from, to, category } = req.query;

    let q = db
      .selectFrom('expense_logs')
      .selectAll()
      .where('user_vehicle_id', '=', userVehicleId)
      .orderBy('date', 'desc')
      .limit(100);

    if (from) q = q.where('date', '>=', new Date(from as string));
    if (to) q = q.where('date', '<=', new Date(to as string));
    if (category) q = q.where('category', '=', category as string);

    const expenses = await q.execute();
    res.json(expenses);
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/v1/my/vehicles/:id/expenses
router.post('/vehicles/:id/expenses', validate(addExpenseSchema), async (req, res) => {
  try {
    const body = req.body;
    if (!(await verifyVehicleOwnership(body.userVehicleId, req.user!.userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const expense = await db
      .insertInto('expense_logs')
      .values({
        user_vehicle_id: body.userVehicleId,
        category: body.category,
        subcategory: body.subcategory || null,
        amount_cents: body.amountCents,
        odometer_reading: body.odometerReading || null,
        date: new Date(body.date),
        notes: body.notes || null,
        gallons: body.gallons || null,
        price_per_gallon_cents: body.pricePerGallonCents || null,
        station_name: body.stationName || null,
        is_business_expense: body.isBusinessExpense,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.status(201).json({ id: expense.id });
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// GET /api/v1/my/vehicles/:id/expenses/summary
router.get('/vehicles/:id/expenses/summary', async (req, res) => {
  try {
    const userVehicleId = parseInt(req.params.id, 10);
    if (!(await verifyVehicleOwnership(userVehicleId, req.user!.userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const summary = await db
      .selectFrom('expense_logs')
      .select([
        'category',
        db.fn.sum<number>('amount_cents').as('total_cents'),
        db.fn.count<number>('id').as('count'),
      ])
      .where('user_vehicle_id', '=', userVehicleId)
      .groupBy('category')
      .execute();

    const totalCents = summary.reduce((acc, s) => acc + Number(s.total_cents), 0);

    res.json({ summary, totalCents });
  } catch (err) {
    console.error('Expense summary error:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// ============ MILEAGE ============

const addMileageSchema = z.object({
  userVehicleId: z.number(),
  date: z.string(),
  miles: z.number().min(0.1),
  purpose: z.enum(['gig_rideshare', 'gig_delivery', 'personal', 'commute']),
  gigPlatform: z.string().optional(),
  startOdometer: z.number().optional(),
  endOdometer: z.number().optional(),
  notes: z.string().optional(),
});

// POST /api/v1/my/vehicles/:id/mileage
router.post('/vehicles/:id/mileage', validate(addMileageSchema), async (req, res) => {
  try {
    const body = req.body;
    if (!(await verifyVehicleOwnership(body.userVehicleId, req.user!.userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const entry = await db
      .insertInto('mileage_logs')
      .values({
        user_vehicle_id: body.userVehicleId,
        date: new Date(body.date),
        miles: body.miles,
        purpose: body.purpose,
        gig_platform: body.gigPlatform || null,
        start_odometer: body.startOdometer || null,
        end_odometer: body.endOdometer || null,
        notes: body.notes || null,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.status(201).json({ id: entry.id });
  } catch (err) {
    console.error('Add mileage error:', err);
    res.status(500).json({ error: 'Failed to add mileage' });
  }
});

// GET /api/v1/my/vehicles/:id/mileage
router.get('/vehicles/:id/mileage', async (req, res) => {
  try {
    const userVehicleId = parseInt(req.params.id, 10);
    if (!(await verifyVehicleOwnership(userVehicleId, req.user!.userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const entries = await db
      .selectFrom('mileage_logs')
      .selectAll()
      .where('user_vehicle_id', '=', userVehicleId)
      .orderBy('date', 'desc')
      .limit(100)
      .execute();

    res.json(entries);
  } catch (err) {
    console.error('Get mileage error:', err);
    res.status(500).json({ error: 'Failed to fetch mileage' });
  }
});

// GET /api/v1/my/vehicles/:id/tax-summary
router.get('/vehicles/:id/tax-summary', async (req, res) => {
  try {
    const userVehicleId = parseInt(req.params.id, 10);
    if (!(await verifyVehicleOwnership(userVehicleId, req.user!.userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const year = parseInt((req.query.year as string) || String(new Date().getFullYear()), 10);

    // Get business miles for the year
    const mileageResult = await db
      .selectFrom('mileage_logs')
      .select(db.fn.sum<number>('miles').as('total_miles'))
      .where('user_vehicle_id', '=', userVehicleId)
      .where('purpose', 'in', ['gig_rideshare', 'gig_delivery'])
      .where(sql`EXTRACT(YEAR FROM date)`, '=', year)
      .executeTakeFirst();

    // Get actual expenses for the year
    const expenseResult = await db
      .selectFrom('expense_logs')
      .select(db.fn.sum<number>('amount_cents').as('total_cents'))
      .where('user_vehicle_id', '=', userVehicleId)
      .where('is_business_expense', '=', true)
      .where(sql`EXTRACT(YEAR FROM date)`, '=', year)
      .executeTakeFirst();

    const totalMiles = Number(mileageResult?.total_miles || 0);
    const actualExpenseCents = Number(expenseResult?.total_cents || 0);
    const irsRateCents = 70; // 2026 IRS standard mileage rate (estimated)
    const standardDeduction = Math.round(totalMiles * irsRateCents);

    res.json({
      year,
      totalBusinessMiles: totalMiles,
      actualExpenseCents,
      standardDeductionCents: standardDeduction,
      irsRateCentsPerMile: irsRateCents,
      recommendation: standardDeduction > actualExpenseCents ? 'standard' : 'actual',
      savingsCents: Math.abs(standardDeduction - actualExpenseCents),
    });
  } catch (err) {
    console.error('Tax summary error:', err);
    res.status(500).json({ error: 'Failed to compute tax summary' });
  }
});

// ============ DASHBOARD OVERVIEW ============

// GET /api/v1/my/vehicles/:id/dashboard
router.get('/vehicles/:id/dashboard', async (req, res) => {
  try {
    const userVehicleId = parseInt(req.params.id, 10);
    if (!(await verifyVehicleOwnership(userVehicleId, req.user!.userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Recent expenses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentExpenses = await db
      .selectFrom('expense_logs')
      .selectAll()
      .where('user_vehicle_id', '=', userVehicleId)
      .where('date', '>=', thirtyDaysAgo)
      .orderBy('date', 'desc')
      .execute();

    // Total mileage (last 30 days)
    const mileageResult = await db
      .selectFrom('mileage_logs')
      .select(db.fn.sum<number>('miles').as('total_miles'))
      .where('user_vehicle_id', '=', userVehicleId)
      .where('date', '>=', thirtyDaysAgo)
      .executeTakeFirst();

    const totalExpenseCents = recentExpenses.reduce((acc, e) => acc + e.amount_cents, 0);
    const totalMiles = Number(mileageResult?.total_miles || 0);
    const cpm = totalMiles > 0 ? totalExpenseCents / 100 / totalMiles : 0;

    // Expense breakdown by category
    const breakdown = recentExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount_cents;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      period: '30d',
      totalExpenseCents,
      totalMiles,
      costPerMile: Math.round(cpm * 10000) / 10000,
      breakdown,
      recentExpenses: recentExpenses.slice(0, 10),
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;
