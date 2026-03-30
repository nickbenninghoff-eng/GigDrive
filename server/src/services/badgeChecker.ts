import { sql } from 'kysely';
import { db } from '../db/connection.js';

export const BADGE_DEFINITIONS = [
  { type: 'first_report', name: 'First Report', description: 'Submitted your first repair report', icon: '🔧' },
  { type: 'first_tip', name: 'First Tip', description: 'Shared your first driver tip', icon: '💡' },
  { type: 'streak_7', name: '7-Day Streak', description: '7 consecutive days of contributions', icon: '🔥' },
  { type: 'streak_30', name: '30-Day Streak', description: '30 consecutive days of contributions', icon: '🔥' },
  { type: 'helpful_10', name: 'Helpful', description: 'Received 10 upvotes', icon: '👍' },
  { type: 'helpful_100', name: 'Super Helpful', description: 'Received 100 upvotes', icon: '⭐' },
  { type: 'data_pioneer', name: 'Data Pioneer', description: 'First report for a vehicle model', icon: '🚩' },
  { type: 'top_weekly', name: 'Weekly Champion', description: '#1 on the weekly leaderboard', icon: '🏆' },
  { type: 'gas_scout', name: 'Gas Scout', description: 'Reported 10 gas prices', icon: '⛽' },
  { type: 'fleet_expert', name: 'Fleet Expert', description: 'Reports on 5+ different vehicles', icon: '🚗' },
] as const;

export type BadgeType = typeof BADGE_DEFINITIONS[number]['type'];

export async function checkAndAwardBadges(userId: number): Promise<string[]> {
  const awarded: string[] = [];

  // Get current stats
  const stats = await db
    .selectFrom('user_stats')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirst();

  if (!stats) return awarded;

  // Get existing badges
  const existing = await db
    .selectFrom('user_badges')
    .select('badge_type')
    .where('user_id', '=', userId)
    .execute();

  const hasBadge = (type: string) => existing.some((b) => b.badge_type === type);

  const badgesToCheck: Array<{ type: string; condition: boolean }> = [
    { type: 'first_report', condition: stats.total_repair_reports >= 1 },
    { type: 'first_tip', condition: stats.total_tips >= 1 },
    { type: 'streak_7', condition: stats.current_streak_days >= 7 },
    { type: 'streak_30', condition: stats.current_streak_days >= 30 },
    { type: 'helpful_10', condition: stats.total_upvotes_received >= 10 },
    { type: 'helpful_100', condition: stats.total_upvotes_received >= 100 },
  ];

  // Check distinct vehicles for fleet_expert
  const distinctVehicles = await db
    .selectFrom('community_repair_reports')
    .select(db.fn.count<number>(sql`DISTINCT vehicle_id`).as('cnt'))
    .where('user_id', '=', userId)
    .executeTakeFirst();

  badgesToCheck.push({
    type: 'fleet_expert',
    condition: Number(distinctVehicles?.cnt || 0) >= 5,
  });

  for (const { type, condition } of badgesToCheck) {
    if (condition && !hasBadge(type)) {
      await db
        .insertInto('user_badges')
        .values({ user_id: userId, badge_type: type })
        .onConflict((oc) => oc.columns(['user_id', 'badge_type']).doNothing())
        .execute();
      awarded.push(type);
    }
  }

  return awarded;
}

export async function updateStreak(userId: number): Promise<void> {
  const stats = await db
    .selectFrom('user_stats')
    .select(['last_contribution_date', 'current_streak_days', 'longest_streak_days'])
    .where('user_id', '=', userId)
    .executeTakeFirst();

  if (!stats) return;

  const today = new Date().toISOString().split('T')[0];
  const lastDate = stats.last_contribution_date
    ? new Date(stats.last_contribution_date).toISOString().split('T')[0]
    : null;

  if (lastDate === today) return; // Already contributed today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak: number;
  if (lastDate === yesterdayStr) {
    newStreak = stats.current_streak_days + 1;
  } else {
    newStreak = 1; // Streak broken, restart
  }

  const newLongest = Math.max(stats.longest_streak_days, newStreak);

  await db
    .updateTable('user_stats')
    .set({
      current_streak_days: newStreak,
      longest_streak_days: newLongest,
      last_contribution_date: new Date(today),
    })
    .where('user_id', '=', userId)
    .execute();
}
