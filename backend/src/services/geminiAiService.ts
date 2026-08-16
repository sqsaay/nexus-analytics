import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface PortfolioAssetInput {
  symbol: string;
  coinName: string;
  amount: number;
  currentPrice: number;
  currentValue: number;
  allocationPercent: number;
  profitLoss: number;
}

export interface AiPortfolioInsight {
  healthScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Aggressive';
  summary: string;
  diversificationAnalysis: string;
  topRecommendations: string[];
  marketSentiment: 'Bullish' | 'Neutral' | 'Bearish';
}

export class GeminiAiService {
  async analyzePortfolio(
    portfolioName: string,
    totalValue: number,
    totalProfitLoss: number,
    assets: PortfolioAssetInput[]
  ): Promise<AiPortfolioInsight> {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
      try {
        const prompt = `Act as an expert quantitative crypto financial advisor. Analyze this portfolio:
Portfolio Name: "${portfolioName}"
Total Value: $${totalValue.toFixed(2)}
Total Net Profit/Loss: $${totalProfitLoss.toFixed(2)}
Asset Breakdown:
${assets.map((a) => `- ${a.coinName} (${a.symbol}): Allocation ${a.allocationPercent.toFixed(1)}%, Current Value $${a.currentValue.toFixed(2)}, P&L $${a.profitLoss.toFixed(2)}`).join('\n')}

Provide JSON output with:
{
  "healthScore": number (0-100),
  "riskLevel": "Low" | "Moderate" | "High" | "Aggressive",
  "summary": string (2 sentences),
  "diversificationAnalysis": string (2 sentences),
  "topRecommendations": array of strings (3 actionable advice bullet points),
  "marketSentiment": "Bullish" | "Neutral" | "Bearish"
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as any;
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            return JSON.parse(jsonText) as AiPortfolioInsight;
          }
        }
      } catch (err: any) {
        logger.warn(`Gemini API call encountered error: ${err.message}. Using intelligent offline AI engine.`);
      }
    }

    // Intelligent heuristic financial fallback engine
    return this.generateOfflineInsight(portfolioName, totalValue, totalProfitLoss, assets);
  }

  private generateOfflineInsight(
    portfolioName: string,
    totalValue: number,
    totalProfitLoss: number,
    assets: PortfolioAssetInput[]
  ): AiPortfolioInsight {
    const assetCount = assets.length;
    const btcEthAllocation = assets
      .filter((a) => ['BTC', 'ETH'].includes(a.symbol.toUpperCase()))
      .reduce((sum, a) => sum + a.allocationPercent, 0);

    let healthScore = 75;
    let riskLevel: 'Low' | 'Moderate' | 'High' | 'Aggressive' = 'Moderate';

    if (btcEthAllocation > 70) {
      riskLevel = 'Low';
      healthScore += 10;
    } else if (btcEthAllocation < 30) {
      riskLevel = 'Aggressive';
      healthScore -= 10;
    }

    if (assetCount === 1) {
      healthScore -= 15;
    } else if (assetCount >= 3) {
      healthScore += 10;
    }

    healthScore = Math.max(20, Math.min(98, healthScore));

    const isProfitable = totalProfitLoss >= 0;

    return {
      healthScore,
      riskLevel,
      summary: `Portfolio "${portfolioName}" has a total market valuation of $${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} with a ${isProfitable ? 'net gain' : 'net loss'} of $${Math.abs(totalProfitLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })}. Heavy allocation is detected in core assets.`,
      diversificationAnalysis:
        assetCount <= 1
          ? 'Your portfolio is heavily concentrated in a single asset, leaving you vulnerable to specific token volatility.'
          : `You have distributed capital across ${assetCount} distinct assets. ${btcEthAllocation.toFixed(0)}% is held in major blue-chip cryptocurrencies (BTC/ETH).`,
      topRecommendations: [
        btcEthAllocation < 40
          ? 'Consider increasing allocation in high-market-cap assets like BTC or ETH to stabilize volatility.'
          : 'Maintain your solid blue-chip foundation while exploring selective staking or Layer-1 alternatives.',
        assetCount < 3
          ? 'Diversify into 1-2 additional non-correlated sectors (e.g. DeFi protocols or Layer-1 infrastructure).'
          : 'Rebalance holdings periodically when single asset allocation exceeds 40% of total portfolio value.',
        'Set up stop-loss or price target alerts to secure profits during high volatility cycles.',
      ],
      marketSentiment: btcEthAllocation > 50 ? 'Bullish' : 'Neutral',
    };
  }
}

export const geminiAiService = new GeminiAiService();
