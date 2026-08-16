import { Router } from 'express';
import { getAiPortfolioInsights } from '../controllers/aiController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/portfolio/:portfolioId/ai-insights', getAiPortfolioInsights);

export default router;
