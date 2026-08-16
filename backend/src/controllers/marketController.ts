import { Request, Response } from 'express';
import { coinGeckoService } from '../services/coinGeckoService';

export const getTopCoins = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit || 20);
    const currency = (req.query.currency as string) || 'usd';

    const coins = await coinGeckoService.getTopCoins(currency, limit);
    return res.json({ success: true, count: coins.length, data: coins });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCoinHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const days = Number(req.query.days || 7);

    const history = await coinGeckoService.getCoinHistory(id, days);
    return res.json({ success: true, coinId: id, days, data: history });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
