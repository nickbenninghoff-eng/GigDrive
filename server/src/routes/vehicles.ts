import { Router } from 'express';
import { db } from '../db/connection.js';

const router = Router();

// GET /api/v1/vehicles/:id — Full vehicle detail
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid vehicle ID' });
      return;
    }

    const vehicle = await db
      .selectFrom('vehicles')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    // Get gig scores
    const gigScores = await db
      .selectFrom('gig_vehicle_scores')
      .selectAll()
      .where('vehicle_id', '=', id)
      .execute();

    // Get maintenance schedules
    const maintenance = await db
      .selectFrom('maintenance_schedules')
      .selectAll()
      .where('vehicle_id', '=', id)
      .execute();

    res.json({
      ...vehicle,
      gig_scores: gigScores,
      maintenance,
    });
  } catch (err) {
    console.error('Vehicle detail error:', err);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

export default router;
