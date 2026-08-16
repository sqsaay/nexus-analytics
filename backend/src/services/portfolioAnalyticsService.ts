import { coinGeckoService } from './coinGeckoService';

export interface HoldingsSummary {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  avgBuyPrice: number;
  totalCostBasis: number;
  currentPrice: number;
  currentValue: number;
  priceChange24h: number;
  unrealizedProfitLoss: number;
  unrealizedProfitLossPercent: number;
  allocationPercent: number;
}

export interface PortfolioSummaryResult {
  portfolioId: string;
  portfolioName: string;
  currency: string;
  totalValue: number;
  totalCostBasis: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  totalFees: number;
  holdings: HoldingsSummary[];
  assetCount: number;
  transactionCount: number;
}

export class PortfolioAnalyticsService {
  async calculatePortfolioSummary(portfolio: any): Promise<PortfolioSummaryResult> {
    const transactions = portfolio.transactions || [];
    const coinMap: Record<
      string,
      {
        coinSymbol: string;
        coinName: string;
        totalAmount: number;
        totalCostSpent: number;
        totalFees: number;
      }
    > = {};

    let grandTotalFees = 0;

    for (const tx of transactions) {
      grandTotalFees += tx.fee || 0;
      if (!coinMap[tx.coinId]) {
        coinMap[tx.coinId] = {
          coinSymbol: tx.coinSymbol,
          coinName: tx.coinName,
          totalAmount: 0,
          totalCostSpent: 0,
          totalFees: 0,
        };
      }

      const item = coinMap[tx.coinId];
      if (tx.type === 'BUY') {
        item.totalAmount += tx.amount;
        item.totalCostSpent += tx.totalSpent;
      } else if (tx.type === 'SELL') {
        item.totalAmount -= tx.amount;
        item.totalCostSpent -= tx.totalSpent;
      }
    }

    const coinIds = Object.keys(coinMap);
    const livePrices = await coinGeckoService.getCoinPrices(coinIds, portfolio.currency.toLowerCase());

    let grandTotalValue = 0;
    let grandTotalCostBasis = 0;
    const holdingsTemp: HoldingsSummary[] = [];

    for (const coinId of coinIds) {
      const data = coinMap[coinId];
      if (data.totalAmount <= 0.000001) continue; // skip zero balance

      const priceInfo = livePrices[coinId] || { price: 0, change24h: 0 };
      const currentPrice = priceInfo.price;
      const currentValue = data.totalAmount * currentPrice;
      const avgBuyPrice = data.totalAmount > 0 ? data.totalCostSpent / data.totalAmount : 0;
      const pnl = currentValue - data.totalCostSpent;
      const pnlPercent = data.totalCostSpent > 0 ? (pnl / data.totalCostSpent) * 100 : 0;

      grandTotalValue += currentValue;
      grandTotalCostBasis += data.totalCostSpent;

      holdingsTemp.push({
        coinId,
        coinSymbol: data.coinSymbol,
        coinName: data.coinName,
        amount: Number(data.totalAmount.toFixed(6)),
        avgBuyPrice: Number(avgBuyPrice.toFixed(2)),
        totalCostBasis: Number(data.totalCostSpent.toFixed(2)),
        currentPrice: Number(currentPrice.toFixed(2)),
        currentValue: Number(currentValue.toFixed(2)),
        priceChange24h: Number(priceInfo.change24h.toFixed(2)),
        unrealizedProfitLoss: Number(pnl.toFixed(2)),
        unrealizedProfitLossPercent: Number(pnlPercent.toFixed(2)),
        allocationPercent: 0, // filled below
      });
    }

    // Calculate allocation percentage
    const holdings = holdingsTemp.map((h) => ({
      ...h,
      allocationPercent: grandTotalValue > 0 ? Number(((h.currentValue / grandTotalValue) * 100).toFixed(2)) : 0,
    }));

    const totalProfitLoss = grandTotalValue - grandTotalCostBasis;
    const totalProfitLossPercent = grandTotalCostBasis > 0 ? (totalProfitLoss / grandTotalCostBasis) * 100 : 0;

    return {
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      currency: portfolio.currency,
      totalValue: Number(grandTotalValue.toFixed(2)),
      totalCostBasis: Number(grandTotalCostBasis.toFixed(2)),
      totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
      totalProfitLossPercent: Number(totalProfitLossPercent.toFixed(2)),
      totalFees: Number(grandTotalFees.toFixed(2)),
      holdings,
      assetCount: holdings.length,
      transactionCount: transactions.length,
    };
  }
}

export const portfolioAnalyticsService = new PortfolioAnalyticsService();
