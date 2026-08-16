import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { register, login, refreshToken, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';

const router = Router();

// Strict Auth Rate Limiter to prevent Brute Force / Credential Stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format').max(100),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    name: z.string().min(2, 'Name must be at least 2 characters long').max(50),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/refresh', authLimiter, refreshToken);
router.get('/me', authenticateToken, getMe);

export default router;
