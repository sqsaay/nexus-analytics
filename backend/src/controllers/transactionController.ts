import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { portfolioId } = req.params;

    const portfolio = await prisma.portfolio.findFirst({ where: { id: portfolioId, userId } });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    const transactions = await prisma.transaction.findMany({
      where: { portfolioId },
      orderBy: { transactionDate: 'desc' },
    });

    return res.json({ success: true, data: transactions });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { portfolioId } = req.params;
    const { coinId, coinSymbol, coinName, type, amount, pricePerUnit, fee, notes, transactionDate } = req.body;

    const portfolio = await prisma.portfolio.findFirst({ where: { id: portfolioId, userId } });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    const numAmount = Number(amount);
    const numPrice = Number(pricePerUnit);
    const numFee = Number(fee || 0);
    const totalSpent = numAmount * numPrice + numFee;

    const transaction = await prisma.transaction.create({
      data: {
        portfolioId,
        coinId: coinId.toLowerCase(),
        coinSymbol: coinSymbol.toUpperCase(),
        coinName,
        type: type || 'BUY',
        amount: numAmount,
        pricePerUnit: numPrice,
        totalSpent,
        fee: numFee,
        notes,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      },
    });

    return res.status(201).json({ success: true, message: 'Transaction logged successfully', data: transaction });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { coinId, coinSymbol, coinName, type, amount, pricePerUnit, fee, notes, transactionDate } = req.body;

    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { portfolio: true },
    });

    if (!existing || existing.portfolio.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const numAmount = Number(amount ?? existing.amount);
    const numPrice = Number(pricePerUnit ?? existing.pricePerUnit);
    const numFee = Number(fee ?? existing.fee);
    const totalSpent = numAmount * numPrice + numFee;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        coinId: coinId ? coinId.toLowerCase() : existing.coinId,
        coinSymbol: coinSymbol ? coinSymbol.toUpperCase() : existing.coinSymbol,
        coinName: coinName ?? existing.coinName,
        type: type ?? existing.type,
        amount: numAmount,
        pricePerUnit: numPrice,
        totalSpent,
        fee: numFee,
        notes: notes ?? existing.notes,
        transactionDate: transactionDate ? new Date(transactionDate) : existing.transactionDate,
      },
    });

    return res.json({ success: true, message: 'Transaction updated successfully', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { portfolio: true },
    });

    if (!existing || existing.portfolio.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await prisma.transaction.delete({ where: { id } });
    return res.json({ success: true, message: 'Transaction removed successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
