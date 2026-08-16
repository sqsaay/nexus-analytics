import { Router } from 'express';
import { getTopCoins, getCoinHistory } from '../controllers/marketController';

const router = Router();

router.get('/coins', getTopCoins);
router.get('/coins/:id/history', getCoinHistory);

export default router;
