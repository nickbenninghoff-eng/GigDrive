import { Router } from 'express';
import { db } from '../db/connection.js';

const router = Router();

// GET /api/v1/affiliates — list affiliate links
router.get('/', async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const vehicleMake = req.query.vehicle_make as string | undefined;

    let q = db
      .selectFrom('affiliate_links')
      .selectAll()
      .where('is_active', '=', true)
      .orderBy('category', 'asc');

    if (category) q = q.where('category', '=', category);
    if (vehicleMake) {
      q = q.where((eb) =>
        eb.or([
          eb('vehicle_make', 'is', null),
          eb('vehicle_make', 'ilike', vehicleMake),
        ])
      );
    }

    const links = await q.execute();
    res.json(links);
  } catch (err) {
    console.error('Affiliates error:', err);
    res.status(500).json({ error: 'Failed to fetch affiliates' });
  }
});

// POST /api/v1/affiliates/:id/click — track click
router.post('/:id/click', async (req, res) => {
  try {
    const linkId = parseInt(req.params.id as string, 10);
    const userId = (req as any).user?.userId || null;
    const vehicleId = req.body.vehicleId || null;

    await db
      .insertInto('affiliate_clicks')
      .values({
        affiliate_link_id: linkId,
        user_id: userId,
        context_vehicle_id: vehicleId,
      })
      .execute();

    // Get the link URL
    const link = await db
      .selectFrom('affiliate_links')
      .select('base_url')
      .where('id', '=', linkId)
      .executeTakeFirst();

    res.json({ url: link?.base_url });
  } catch (err) {
    console.error('Affiliate click error:', err);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

export default router;
