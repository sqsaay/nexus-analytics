import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { portfolioAnalyticsService } from '../services/portfolioAnalyticsService';
import { geminiAiService } from '../services/geminiAiService';

export const getAiPortfolioInsights = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { portfolioId } = req.params;

    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
      include: { transactions: true },
    });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const summary = await portfolioAnalyticsService.calculatePortfolioSummary(portfolio);

    const assetInputs = summary.holdings.map((h) => ({
      symbol: h.coinSymbol,
      coinName: h.coinName,
      amount: h.amount,
      currentPrice: h.currentPrice,
      currentValue: h.currentValue,
      allocationPercent: h.allocationPercent,
      profitLoss: h.unrealizedProfitLoss,
    }));

    const aiInsights = await geminiAiService.analyzePortfolio(
      portfolio.name,
      summary.totalValue,
      summary.totalProfitLoss,
      assetInputs
    );

    return res.json({
      success: true,
      data: {
        portfolioId: portfolio.id,
        portfolioName: portfolio.name,
        totalValue: summary.totalValue,
        totalProfitLoss: summary.totalProfitLoss,
        aiInsights,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
