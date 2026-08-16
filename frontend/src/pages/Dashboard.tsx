import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { PortfolioSummary, AiInsightsData } from '../types';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  Sparkles,
  RefreshCw,
  Plus,
  BarChart2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';
import { AiInsightsModal } from '../components/AiInsightsModal';
import { TransactionModal } from '../components/TransactionModal';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const Dashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [aiInsightsData, setAiInsightsData] = useState<AiInsightsData | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/portfolios');
      const data: PortfolioSummary[] = res.data.data;
      setPortfolios(data);
      if (data.length > 0) {
        setSelectedPortfolio(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch portfolios', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleRunAiAudit = async () => {
    if (!selectedPortfolio) return;
    try {
      setIsAiLoading(true);
      const res = await api.get(`/analytics/portfolio/${selectedPortfolio.portfolioId}/ai-insights`);
      setAiInsightsData(res.data.data);
      setIsAiModalOpen(true);
    } catch (err) {
      console.error('AI analysis error', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading Portfolio Intelligence...</p>
        </div>
      </div>
    );
  }

  const pnlIsPositive = (selectedPortfolio?.totalProfitLoss || 0) >= 0;

  // Synthetic Historical Curve Data for chart demo
  const mockHistoricalData = [
    { name: 'Day 1', value: (selectedPortfolio?.totalValue || 10000) * 0.88 },
    { name: 'Day 2', value: (selectedPortfolio?.totalValue || 10000) * 0.92 },
    { name: 'Day 3', value: (selectedPortfolio?.totalValue || 10000) * 0.89 },
    { name: 'Day 4', value: (selectedPortfolio?.totalValue || 10000) * 0.95 },
    { name: 'Day 5', value: (selectedPortfolio?.totalValue || 10000) * 0.94 },
    { name: 'Day 6', value: (selectedPortfolio?.totalValue || 10000) * 0.98 },
    { name: 'Today', value: selectedPortfolio?.totalValue || 10000 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Portfolio Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Executive Financial Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time asset valuation, P&L analytics, and AI risk scoring</p>
        </div>

        <div className="flex items-center gap-3">
          {portfolios.length > 0 && (
            <select
              value={selectedPortfolio?.portfolioId}
              onChange={(e) => {
                const found = portfolios.find((p) => p.portfolioId === e.target.value);
                if (found) setSelectedPortfolio(found);
              }}
              className="glass-input text-xs font-semibold text-white bg-slate-900/80"
            >
              {portfolios.map((p) => (
                <option key={p.portfolioId} value={p.portfolioId} className="bg-slate-900">
                  {p.portfolioName} (${p.totalValue.toLocaleString()})
                </option>
              ))}
            </select>
          )}

          <button onClick={() => setIsTxModalOpen(true)} className="btn-secondary text-xs">
            <Plus className="w-3.5 h-3.5" />
            Add Transaction
          </button>

          <button onClick={handleRunAiAudit} disabled={isAiLoading} className="btn-primary text-xs shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            {isAiLoading ? 'Analyzing...' : 'Gemini AI Insights'}
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Portfolio Value */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Net Value</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-3">
            ${(selectedPortfolio?.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {selectedPortfolio?.assetCount || 0} active crypto assets
          </div>
        </div>

        {/* Total Net P&L */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Profit / Loss</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                pnlIsPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}
            >
              {pnlIsPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className={`text-2xl font-extrabold font-mono mt-3 ${pnlIsPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {pnlIsPositive ? '+' : ''}
            ${(selectedPortfolio?.totalProfitLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className={`text-[11px] font-bold mt-1 ${pnlIsPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {pnlIsPositive ? '+' : ''}
            {(selectedPortfolio?.totalProfitLossPercent || 0).toFixed(2)}% ROI
          </div>
        </div>

        {/* Total Cost Basis */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invested Capital</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-3">
            ${(selectedPortfolio?.totalCostBasis || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total invested capital</div>
        </div>

        {/* Total Fees */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tx Fees</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-3">
            ${(selectedPortfolio?.totalFees || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cumulative network fees</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Valuation Chart */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Portfolio Performance History</h2>
              <p className="text-xs text-slate-400">Valuation curve based on historical execution</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              7D Trailing
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockHistoricalData}>
                <defs>
                  <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Valuation']}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValuation)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts Asset Allocation Pie Chart */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Asset Allocation</h2>
            <PieIcon className="w-4 h-4 text-purple-400" />
          </div>

          {selectedPortfolio && selectedPortfolio.holdings.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={selectedPortfolio.holdings}
                    dataKey="currentValue"
                    nameKey="coinName"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {selectedPortfolio.holdings.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Value']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">No holdings logged yet</div>
          )}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Current Asset Holdings</h2>
          <span className="text-xs text-slate-400">{selectedPortfolio?.holdings.length || 0} Assets Total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                <th className="pb-3">Asset</th>
                <th className="pb-3">Balance</th>
                <th className="pb-3">Avg Buy Price</th>
                <th className="pb-3">Current Price</th>
                <th className="pb-3">Total Value</th>
                <th className="pb-3">Unrealized P&L</th>
                <th className="pb-3 text-right">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {selectedPortfolio?.holdings.map((h) => {
                const isProfit = h.unrealizedProfitLoss >= 0;
                return (
                  <tr key={h.coinId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono border border-white/10 text-indigo-300 font-bold">
                        {h.coinSymbol}
                      </div>
                      <div>
                        <div>{h.coinName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{h.coinSymbol}</div>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-slate-200">{h.amount}</td>
                    <td className="py-3.5 font-mono text-slate-300">${h.avgBuyPrice.toLocaleString()}</td>
                    <td className="py-3.5 font-mono text-white font-semibold">${h.currentPrice.toLocaleString()}</td>
                    <td className="py-3.5 font-mono text-white font-bold">${h.currentValue.toLocaleString()}</td>
                    <td className={`py-3.5 font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isProfit ? '+' : ''}${h.unrealizedProfitLoss.toLocaleString()} ({h.unrealizedProfitLossPercent.toFixed(2)}%)
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-indigo-400">{h.allocationPercent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AiInsightsModal data={aiInsightsData} isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
      {selectedPortfolio && (
        <TransactionModal
          portfolioId={selectedPortfolio.portfolioId}
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          onSuccess={fetchPortfolios}
        />
      )}
    </div>
  );
};
