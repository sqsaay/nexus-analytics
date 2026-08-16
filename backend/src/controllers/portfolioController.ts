import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { portfolioAnalyticsService } from '../services/portfolioAnalyticsService';

export const getPortfolios = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: { transactions: true },
      orderBy: { createdAt: 'desc' },
    });

    const summaries = await Promise.all(
      portfolios.map((p) => portfolioAnalyticsService.calculatePortfolioSummary(p))
    );

    return res.json({ success: true, data: summaries });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPortfolioById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId },
      include: { transactions: { orderBy: { transactionDate: 'desc' } } },
    });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const summary = await portfolioAnalyticsService.calculatePortfolioSummary(portfolio);
    return res.json({ success: true, data: { ...portfolio, summary } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPortfolio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, description, currency } = req.body;

    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name,
        description,
        currency: currency || 'USD',
      },
    });

    return res.status(201).json({ success: true, message: 'Portfolio created successfully', data: portfolio });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePortfolio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, description, currency, isDefault } = req.body;

    const existing = await prisma.portfolio.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    const updated = await prisma.portfolio.update({
      where: { id },
      data: { name, description, currency, isDefault },
    });

    return res.json({ success: true, message: 'Portfolio updated successfully', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePortfolio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.portfolio.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    await prisma.portfolio.delete({ where: { id } });

    return res.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
