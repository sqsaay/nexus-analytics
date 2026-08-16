import { Router } from 'express';
import { z } from 'zod';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../controllers/watchlistController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';

const router = Router();

const watchlistSchema = z.object({
  body: z.object({
    coinId: z.string().min(1, 'coinId is required'),
    coinSymbol: z.string().min(1, 'coinSymbol is required'),
    coinName: z.string().min(1, 'coinName is required'),
    targetPrice: z.number().optional(),
    notes: z.string().optional(),
  }),
});

router.use(authenticateToken);

router.get('/', getWatchlist);
router.post('/', validateRequest(watchlistSchema), addToWatchlist);
router.delete('/:id', removeFromWatchlist);

export default router;
