export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface Holding {
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

export interface PortfolioSummary {
  portfolioId: string;
  portfolioName: string;
  currency: string;
  totalValue: number;
  totalCostBasis: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  totalFees: number;
  holdings: Holding[];
  assetCount: number;
  transactionCount: number;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  amount: number;
  pricePerUnit: number;
  totalSpent: number;
  fee: number;
  notes?: string;
  transactionDate: string;
}

export interface WatchlistItem {
  id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  targetPrice?: number;
  currentPrice?: number;
  priceChange24h?: number;
  alertStatus?: 'ABOVE_TARGET' | 'BELOW_TARGET' | 'NORMAL';
  notes?: string;
}

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export interface AiInsightsData {
  portfolioId: string;
  portfolioName: string;
  totalValue: number;
  totalProfitLoss: number;
  aiInsights: {
    healthScore: number;
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Aggressive';
    summary: string;
    diversificationAnalysis: string;
    topRecommendations: string[];
    marketSentiment: 'Bullish' | 'Neutral' | 'Bearish';
  };
}
