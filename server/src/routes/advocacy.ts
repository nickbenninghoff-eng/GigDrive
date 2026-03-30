import { Router } from 'express';
import { z } from 'zod';
import { sql } from 'kysely';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// ============ KNOW YOUR RIGHTS ============

// GET /api/v1/advocacy/guides
router.get('/guides', async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const platform = req.query.platform as string | undefined;

    let q = db
      .selectFrom('rights_guides')
      .select(['id', 'slug', 'title', 'category', 'state', 'platform', 'created_at'])
      .where('is_published', '=', true)
      .orderBy('category', 'asc');

    if (category) q = q.where('category', '=', category);
    if (platform) q = q.where((eb) => eb.or([eb('platform', 'is', null), eb('platform', '=', platform)]));

    const guides = await q.execute();
    res.json(guides);
  } catch (err) {
    console.error('Guides error:', err);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// GET /api/v1/advocacy/guides/:slug
router.get('/guides/:slug', async (req, res) => {
  try {
    const guide = await db
      .selectFrom('rights_guides')
      .selectAll()
      .where('slug', '=', req.params.slug as string)
      .where('is_published', '=', true)
      .executeTakeFirst();

    if (!guide) {
      res.status(404).json({ error: 'Guide not found' });
      return;
    }

    res.json(guide);
  } catch (err) {
    console.error('Guide error:', err);
    res.status(500).json({ error: 'Failed to fetch guide' });
  }
});

// ============ SATISFACTION SURVEYS ============

const surveySchema = z.object({
  platform: z.enum(['uber', 'lyft', 'doordash', 'instacart', 'amazon_flex', 'grubhub']),
  overallSatisfaction: z.number().min(1).max(5),
  payFairness: z.number().min(1).max(5).optional(),
  appQuality: z.number().min(1).max(5).optional(),
  supportQuality: z.number().min(1).max(5).optional(),
  safetyFeeling: z.number().min(1).max(5).optional(),
  deactivationFear: z.number().min(1).max(5).optional(),
  wouldRecommend: z.boolean().optional(),
  comments: z.string().max(1000).optional(),
});

// POST /api/v1/advocacy/survey
router.post('/survey', requireAuth, validate(surveySchema), async (req, res) => {
  try {
    const body = req.body;
    const surveyMonth = new Date();
    surveyMonth.setDate(1); // First of current month

    await db
      .insertInto('satisfaction_surveys')
      .values({
        user_id: req.user!.userId,
        platform: body.platform,
        survey_month: surveyMonth,
        overall_satisfaction: body.overallSatisfaction,
        pay_fairness: body.payFairness || null,
        app_quality: body.appQuality || null,
        support_quality: body.supportQuality || null,
        safety_feeling: body.safetyFeeling || null,
        deactivation_fear: body.deactivationFear || null,
        would_recommend: body.wouldRecommend ?? null,
        comments: body.comments || null,
      })
      .onConflict((oc) =>
        oc.columns(['user_id', 'platform', 'survey_month']).doUpdateSet({
          overall_satisfaction: body.overallSatisfaction,
          pay_fairness: body.payFairness || null,
          app_quality: body.appQuality || null,
          support_quality: body.supportQuality || null,
          safety_feeling: body.safetyFeeling || null,
          deactivation_fear: body.deactivationFear || null,
          would_recommend: body.wouldRecommend ?? null,
          comments: body.comments || null,
        })
      )
      .execute();

    res.json({ success: true });
  } catch (err) {
    console.error('Survey error:', err);
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

// GET /api/v1/advocacy/satisfaction-index
router.get('/satisfaction-index', async (_req, res) => {
  try {
    const index = await db
      .selectFrom('satisfaction_index')
      .selectAll()
      .orderBy('survey_month', 'desc')
      .orderBy('platform', 'asc')
      .limit(30)
      .execute();

    // If no real data, return estimates
    if (index.length === 0) {
      res.json({
        platforms: [
          { platform: 'uber', avg_overall: 3.2, avg_pay_fairness: 2.8, avg_support_quality: 2.5, avg_deactivation_fear: 3.8, recommend_pct: 55 },
          { platform: 'lyft', avg_overall: 3.4, avg_pay_fairness: 3.0, avg_support_quality: 2.7, avg_deactivation_fear: 3.5, recommend_pct: 60 },
          { platform: 'doordash', avg_overall: 3.1, avg_pay_fairness: 2.6, avg_support_quality: 2.3, avg_deactivation_fear: 3.2, recommend_pct: 48 },
          { platform: 'instacart', avg_overall: 3.0, avg_pay_fairness: 2.5, avg_support_quality: 2.4, avg_deactivation_fear: 3.0, recommend_pct: 45 },
          { platform: 'amazon_flex', avg_overall: 3.5, avg_pay_fairness: 3.3, avg_support_quality: 2.2, avg_deactivation_fear: 4.0, recommend_pct: 58 },
        ],
        source: 'estimated',
      });
      return;
    }

    res.json({ platforms: index, source: 'community' });
  } catch (err) {
    console.error('Satisfaction index error:', err);
    res.status(500).json({ error: 'Failed to fetch index' });
  }
});

// ============ DRIVER PROFILE ============

// GET /api/v1/advocacy/profile/:userId
router.get('/profile/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId as string, 10);

    const profile = await db
      .selectFrom('driver_profiles as dp')
      .innerJoin('users as u', 'u.id', 'dp.user_id')
      .select([
        'dp.total_trips', 'dp.total_miles', 'dp.years_driving',
        'dp.platforms_active', 'dp.avg_rating', 'dp.specialties', 'dp.bio',
        'u.display_name', 'u.joined_at',
      ])
      .where('dp.user_id', '=', userId)
      .where('dp.is_public', '=', true)
      .executeTakeFirst();

    if (!profile) {
      res.status(404).json({ error: 'Profile not found or not public' });
      return;
    }

    // Get badges
    const badges = await db
      .selectFrom('user_badges')
      .select(['badge_type', 'earned_at'])
      .where('user_id', '=', userId)
      .execute();

    // Get stats
    const stats = await db
      .selectFrom('user_stats')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();

    res.json({ profile, badges, stats });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
