import { Router } from 'express';
import authRoutes from './authRoutes';
import portfolioRoutes from './portfolioRoutes';
import transactionRoutes from './transactionRoutes';
import watchlistRoutes from './watchlistRoutes';
import marketRoutes from './marketRoutes';
import aiRoutes from './aiRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/portfolios', portfolioRoutes);
router.use('/transactions', transactionRoutes);
router.use('/watchlists', watchlistRoutes);
router.use('/market', marketRoutes);
router.use('/analytics', aiRoutes);

export default router;
