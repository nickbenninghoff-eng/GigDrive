import { Router } from 'express';
import { z } from 'zod';
import { sql } from 'kysely';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// GET /api/v1/forum/channels
router.get('/channels', async (_req, res) => {
  try {
    const channels = await db
      .selectFrom('forum_channels')
      .selectAll()
      .orderBy('channel_type', 'asc')
      .orderBy('name', 'asc')
      .execute();

    res.json(channels);
  } catch (err) {
    console.error('Get channels error:', err);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// GET /api/v1/forum/channels/:slug/posts
router.get('/channels/:slug/posts', async (req, res) => {
  try {
    const slug = req.params.slug as string;
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 50);
    const offset = parseInt((req.query.offset as string) || '0', 10);
    const sort = (req.query.sort as string) === 'top' ? 'top' : 'new';

    const channel = await db
      .selectFrom('forum_channels')
      .select('id')
      .where('slug', '=', slug)
      .executeTakeFirst();

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    let q = db
      .selectFrom('forum_posts as p')
      .innerJoin('users as u', 'u.id', 'p.user_id')
      .select([
        'p.id', 'p.title', 'p.body', 'p.upvotes', 'p.downvotes',
        'p.reply_count', 'p.is_pinned', 'p.vehicle_make', 'p.vehicle_model',
        'p.gig_platform', 'p.city', 'p.created_at',
        'u.display_name',
      ])
      .where('p.channel_id', '=', channel.id);

    if (sort === 'top') {
      q = q.orderBy(sql`p.upvotes - p.downvotes`, 'desc');
    } else {
      q = q.orderBy('p.is_pinned', 'desc').orderBy('p.created_at', 'desc');
    }

    const posts = await q.limit(limit).offset(offset).execute();
    res.json(posts);
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

const createPostSchema = z.object({
  channelSlug: z.string(),
  title: z.string().min(3).max(200),
  body: z.string().min(10).max(5000),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  gigPlatform: z.string().optional(),
  city: z.string().optional(),
});

// POST /api/v1/forum/posts
router.post('/posts', requireAuth, validate(createPostSchema), async (req, res) => {
  try {
    const body = req.body;

    const channel = await db
      .selectFrom('forum_channels')
      .select('id')
      .where('slug', '=', body.channelSlug)
      .executeTakeFirst();

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    const post = await db
      .insertInto('forum_posts')
      .values({
        channel_id: channel.id,
        user_id: req.user!.userId,
        title: body.title,
        body: body.body,
        vehicle_make: body.vehicleMake || null,
        vehicle_model: body.vehicleModel || null,
        gig_platform: body.gigPlatform || null,
        city: body.city || null,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    // Increment channel post count
    await db
      .updateTable('forum_channels')
      .set({ post_count: sql`post_count + 1` })
      .where('id', '=', channel.id)
      .execute();

    res.status(201).json({ id: post.id });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET /api/v1/forum/posts/:id — single post with replies
router.get('/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string, 10);

    const post = await db
      .selectFrom('forum_posts as p')
      .innerJoin('users as u', 'u.id', 'p.user_id')
      .innerJoin('forum_channels as c', 'c.id', 'p.channel_id')
      .select([
        'p.id', 'p.title', 'p.body', 'p.upvotes', 'p.downvotes',
        'p.reply_count', 'p.vehicle_make', 'p.vehicle_model',
        'p.gig_platform', 'p.city', 'p.created_at',
        'u.display_name',
        'c.slug as channel_slug', 'c.name as channel_name',
      ])
      .where('p.id', '=', postId)
      .executeTakeFirst();

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const replies = await db
      .selectFrom('forum_replies as r')
      .innerJoin('users as u', 'u.id', 'r.user_id')
      .select([
        'r.id', 'r.body', 'r.upvotes', 'r.downvotes',
        'r.parent_reply_id', 'r.created_at',
        'u.display_name',
      ])
      .where('r.post_id', '=', postId)
      .orderBy('r.created_at', 'asc')
      .execute();

    res.json({ post, replies });
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

const createReplySchema = z.object({
  body: z.string().min(1).max(3000),
  parentReplyId: z.number().optional(),
});

// POST /api/v1/forum/posts/:id/replies
router.post('/posts/:id/replies', requireAuth, validate(createReplySchema), async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string, 10);
    const { body: replyBody, parentReplyId } = req.body;

    const reply = await db
      .insertInto('forum_replies')
      .values({
        post_id: postId,
        user_id: req.user!.userId,
        body: replyBody,
        parent_reply_id: parentReplyId || null,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    // Increment reply count
    await db
      .updateTable('forum_posts')
      .set({ reply_count: sql`reply_count + 1`, updated_at: new Date() })
      .where('id', '=', postId)
      .execute();

    res.status(201).json({ id: reply.id });
  } catch (err) {
    console.error('Create reply error:', err);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// POST /api/v1/forum/posts/:id/vote
router.post('/posts/:id/vote', requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string, 10);
    const { vote } = req.body;

    if (vote !== 1 && vote !== -1) {
      res.status(400).json({ error: 'Vote must be 1 or -1' });
      return;
    }

    await db
      .insertInto('forum_post_votes')
      .values({ user_id: req.user!.userId, post_id: postId, vote })
      .onConflict((oc) => oc.columns(['user_id', 'post_id']).doUpdateSet({ vote }))
      .execute();

    // Recount
    const up = await db.selectFrom('forum_post_votes').select(db.fn.count<number>('user_id').as('c')).where('post_id', '=', postId).where('vote', '=', 1).executeTakeFirst();
    const down = await db.selectFrom('forum_post_votes').select(db.fn.count<number>('user_id').as('c')).where('post_id', '=', postId).where('vote', '=', -1).executeTakeFirst();

    await db.updateTable('forum_posts').set({ upvotes: Number(up?.c || 0), downvotes: Number(down?.c || 0) }).where('id', '=', postId).execute();

    res.json({ upvotes: Number(up?.c || 0), downvotes: Number(down?.c || 0) });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// ============ DEMAND HEATMAP ============

// GET /api/v1/forum/heatmap?zip=90210 — demand heatmap for a zip
router.get('/heatmap', async (req, res) => {
  try {
    const zip = req.query.zip as string;
    if (!zip) {
      res.status(400).json({ error: 'zip required' });
      return;
    }

    const data = await db
      .selectFrom('demand_heatmap_aggregates')
      .selectAll()
      .where('zip_code', '=', zip)
      .orderBy('day_of_week', 'asc')
      .orderBy('hour_of_day', 'asc')
      .execute();

    // If no real data, generate estimated heatmap
    if (data.length === 0) {
      const estimated = generateEstimatedHeatmap();
      res.json({ zip, data: estimated, source: 'estimated' });
      return;
    }

    res.json({ zip, data, source: 'community' });
  } catch (err) {
    console.error('Heatmap error:', err);
    res.status(500).json({ error: 'Failed to fetch heatmap' });
  }
});

function generateEstimatedHeatmap() {
  const data = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      let level: string;
      const isWeekend = day === 0 || day === 5 || day === 6;
      const isMorningRush = hour >= 7 && hour <= 9;
      const isEveningRush = hour >= 17 && hour <= 20;
      const isLateNight = hour >= 22 || hour <= 4;
      const isLunchRush = hour >= 11 && hour <= 13;

      if (isWeekend && (isEveningRush || isLateNight)) level = 'very_high';
      else if (isEveningRush || (isWeekend && isLunchRush)) level = 'high';
      else if (isMorningRush || isLunchRush) level = 'medium';
      else if (isLateNight && !isWeekend) level = 'medium';
      else if (hour >= 5 && hour <= 22) level = 'low';
      else level = 'very_low';

      data.push({
        day_of_week: day,
        day_name: dayNames[day],
        hour_of_day: hour,
        demand_level: level,
      });
    }
  }
  return data;
}

export default router;
