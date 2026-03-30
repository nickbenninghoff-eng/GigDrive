import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// POST /api/v1/prelaunch/rider-waitlist
const waitlistSchema = z.object({
  email: z.string().email(),
  zipCode: z.string().max(10).optional(),
  referralSource: z.string().max(50).optional(),
});

router.post('/rider-waitlist', validate(waitlistSchema), async (req, res) => {
  try {
    const { email, zipCode, referralSource } = req.body;

    await db
      .insertInto('rider_waitlist')
      .values({
        email: email.toLowerCase(),
        zip_code: zipCode || null,
        referral_source: referralSource || null,
      })
      .onConflict((oc) => oc.column('email').doNothing())
      .execute();

    // Get current count
    const count = await db
      .selectFrom('rider_waitlist')
      .select(db.fn.count<number>('id').as('total'))
      .executeTakeFirst();

    res.json({ success: true, position: Number(count?.total || 0) });
  } catch (err) {
    console.error('Waitlist error:', err);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

// POST /api/v1/prelaunch/driver-preregister
const preregisterSchema = z.object({
  email: z.string().email(),
  zipCode: z.string().max(10).optional(),
  platformsCurrent: z.array(z.string()).optional(),
  yearsExperience: z.number().optional(),
  vehicleYear: z.number().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  weeklyHoursAvailable: z.number().optional(),
  interestedIn: z.array(z.string()).optional(),
});

router.post('/driver-preregister', validate(preregisterSchema), async (req, res) => {
  try {
    const body = req.body;

    await db
      .insertInto('driver_preregistration')
      .values({
        user_id: (req as any).user?.userId || null,
        email: body.email.toLowerCase(),
        zip_code: body.zipCode || null,
        platforms_current: body.platformsCurrent || null,
        years_experience: body.yearsExperience || null,
        vehicle_year: body.vehicleYear || null,
        vehicle_make: body.vehicleMake || null,
        vehicle_model: body.vehicleModel || null,
        weekly_hours_available: body.weeklyHoursAvailable || null,
        interested_in: body.interestedIn || null,
      })
      .execute();

    res.json({ success: true });
  } catch (err) {
    console.error('Preregister error:', err);
    res.status(500).json({ error: 'Failed to preregister' });
  }
});

// PUT /api/v1/prelaunch/availability — driver availability preferences
const availabilitySchema = z.object({
  schedule: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startHour: z.number().min(0).max(23),
    endHour: z.number().min(0).max(23),
    preferredAreas: z.array(z.string()).optional(),
    gigTypes: z.array(z.string()).optional(),
  })),
});

router.put('/availability', requireAuth, validate(availabilitySchema), async (req, res) => {
  try {
    const { schedule } = req.body;

    // Delete existing and replace
    await db.deleteFrom('driver_availability').where('user_id', '=', req.user!.userId).execute();

    for (const slot of schedule) {
      await db
        .insertInto('driver_availability')
        .values({
          user_id: req.user!.userId,
          day_of_week: slot.dayOfWeek,
          start_hour: slot.startHour,
          end_hour: slot.endHour,
          preferred_areas: slot.preferredAreas || null,
          gig_types: slot.gigTypes || null,
        })
        .execute();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

export default router;
