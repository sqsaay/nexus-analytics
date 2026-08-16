import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { coinGeckoService } from '../services/coinGeckoService';

export const getWatchlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const items = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const coinIds = items.map((i) => i.coinId);
    const livePrices = await coinGeckoService.getCoinPrices(coinIds, 'usd');

    const enriched = items.map((item) => {
      const live = livePrices[item.coinId] || { price: 0, change24h: 0 };
      const currentPrice = live.price;
      let alertStatus: 'ABOVE_TARGET' | 'BELOW_TARGET' | 'NORMAL' = 'NORMAL';

      if (item.targetPrice && currentPrice > 0) {
        if (currentPrice >= item.targetPrice) alertStatus = 'ABOVE_TARGET';
        else alertStatus = 'BELOW_TARGET';
      }

      return {
        ...item,
        currentPrice,
        priceChange24h: live.change24h,
        alertStatus,
      };
    });

    return res.json({ success: true, data: enriched });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addToWatchlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { coinId, coinSymbol, coinName, targetPrice, notes } = req.body;

    const existing = await prisma.watchlist.findFirst({
      where: { userId, coinId: coinId.toLowerCase() },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Coin is already in your watchlist' });
    }

    const item = await prisma.watchlist.create({
      data: {
        userId,
        coinId: coinId.toLowerCase(),
        coinSymbol: coinSymbol.toUpperCase(),
        coinName,
        targetPrice: targetPrice ? Number(targetPrice) : null,
        notes,
      },
    });

    return res.status(201).json({ success: true, message: 'Added to watchlist', data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromWatchlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.watchlist.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Watchlist item not found' });

    await prisma.watchlist.delete({ where: { id } });
    return res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
