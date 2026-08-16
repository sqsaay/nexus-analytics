import { Router } from 'express';
import { z } from 'zod';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';

const router = Router();

const transactionSchema = z.object({
  body: z.object({
    coinId: z.string().min(1, 'coinId is required'),
    coinSymbol: z.string().min(1, 'coinSymbol is required'),
    coinName: z.string().min(1, 'coinName is required'),
    type: z.enum(['BUY', 'SELL', 'TRANSFER']).optional(),
    amount: z.number().positive('Amount must be positive'),
    pricePerUnit: z.number().positive('Price per unit must be positive'),
    fee: z.number().nonnegative().optional(),
    notes: z.string().optional(),
    transactionDate: z.string().optional(),
  }),
});

router.use(authenticateToken);

router.get('/portfolio/:portfolioId', getTransactions);
router.post('/portfolio/:portfolioId', validateRequest(transactionSchema), addTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
