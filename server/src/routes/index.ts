import { Router } from 'express';
import calculatorRoutes from './calculator.js';
import rankingsRoutes from './rankings.js';
import vehiclesRoutes from './vehicles.js';
import authRoutes from './auth.js';
import dashboardRoutes from './dashboard.js';
import earningsRoutes from './earnings.js';
import communityRoutes from './community.js';
import gamificationRoutes from './gamification.js';
import gasRoutes from './gas.js';
import affiliateRoutes from './affiliates.js';
import benchmarkingRoutes from './benchmarking.js';
import forumRoutes from './forum.js';
import advocacyRoutes from './advocacy.js';
import prelaunchRoutes from './prelaunch.js';

const router = Router();

router.use('/calculator', calculatorRoutes);
router.use('/rankings', rankingsRoutes);
router.use('/vehicles', vehiclesRoutes);
router.use('/auth', authRoutes);
router.use('/my', dashboardRoutes);
router.use('/my/earnings', earningsRoutes);
router.use('/community', communityRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/gas', gasRoutes);
router.use('/affiliates', affiliateRoutes);
router.use('/benchmarks', benchmarkingRoutes);
router.use('/forum', forumRoutes);
router.use('/advocacy', advocacyRoutes);
router.use('/prelaunch', prelaunchRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
