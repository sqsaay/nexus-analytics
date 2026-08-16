import { Router } from 'express';
import { z } from 'zod';
import {
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from '../controllers/portfolioController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';

const router = Router();

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Portfolio name is required'),
    description: z.string().optional(),
    currency: z.string().optional(),
  }),
});

router.use(authenticateToken);

router.get('/', getPortfolios);
router.get('/:id', getPortfolioById);
router.post('/', validateRequest(createSchema), createPortfolio);
router.put('/:id', updatePortfolio);
router.delete('/:id', deletePortfolio);

export default router;
