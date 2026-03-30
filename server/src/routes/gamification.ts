import { Router } from 'express';
import { sql } from 'kysely';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { BADGE_DEFINITIONS, checkAndAwardBadges } from '../services/badgeChecker.js';

const router = Router();

// GET /api/v1/gamification/badges/definitions — all possible badges
router.get('/badges/definitions', (_req, res) => {
  res.json(BADGE_DEFINITIONS);
});

// GET /api/v1/gamification/my/badges — current user's badges (auth required)
router.get('/my/badges', requireAuth, async (req, res) => {
  try {
    // Check for new badges
    const newBadges = await checkAndAwardBadges(req.user!.userId);

    const badges = await db
      .selectFrom('user_badges')
      .selectAll()
      .where('user_id', '=', req.user!.userId)
      .orderBy('earned_at', 'desc')
      .execute();

    res.json({ badges, newlyAwarded: newBadges });
  } catch (err) {
    console.error('Get badges error:', err);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// GET /api/v1/gamification/my/stats — current user's stats (auth required)
router.get('/my/stats', requireAuth, async (req, res) => {
  try {
    const stats = await db
      .selectFrom('user_stats')
      .selectAll()
      .where('user_id', '=', req.user!.userId)
      .executeTakeFirst();

    if (!stats) {
      res.json({
        total_repair_reports: 0,
        total_tips: 0,
        total_upvotes_received: 0,
        current_streak_days: 0,
        longest_streak_days: 0,
        reputation_score: 0,
      });
      return;
    }

    res.json(stats);
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/v1/gamification/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const period = (req.query.period as string) || 'alltime';
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 50);

    let leaders;

    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      leaders = await db
        .selectFrom('user_stats as s')
        .innerJoin('users as u', 'u.id', 's.user_id')
        .select([
          'u.id', 'u.display_name',
          's.reputation_score', 's.total_repair_reports', 's.total_tips',
          's.total_upvotes_received', 's.current_streak_days',
        ])
        .where('s.last_contribution_date', '>=', weekAgo)
        .orderBy('s.reputation_score', 'desc')
        .limit(limit)
        .execute();
    } else {
      leaders = await db
        .selectFrom('user_stats as s')
        .innerJoin('users as u', 'u.id', 's.user_id')
        .select([
          'u.id', 'u.display_name',
          's.reputation_score', 's.total_repair_reports', 's.total_tips',
          's.total_upvotes_received', 's.current_streak_days',
        ])
        .orderBy('s.reputation_score', 'desc')
        .limit(limit)
        .execute();
    }

    // Get badge counts for each leader
    const leadersWithBadges = await Promise.all(
      leaders.map(async (leader) => {
        const badgeCount = await db
          .selectFrom('user_badges')
          .select(db.fn.count<number>('id').as('cnt'))
          .where('user_id', '=', leader.id)
          .executeTakeFirst();

        return { ...leader, badge_count: Number(badgeCount?.cnt || 0) };
      })
    );

    res.json({ period, leaders: leadersWithBadges });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
