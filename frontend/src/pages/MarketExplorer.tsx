import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { CoinMarketData } from '../types';
import { Search, TrendingUp, TrendingDown, RefreshCw, BarChart2, X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const MarketExplorer: React.FC = () => {
  const [coins, setCoins] = useState<CoinMarketData[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Historical Chart Modal State
  const [selectedCoin, setSelectedCoin] = useState<CoinMarketData | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  const fetchCoins = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/market/coins?limit=30');
      setCoins(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  const handleOpenChart = async (coin: CoinMarketData) => {
    setSelectedCoin(coin);
    try {
      setIsChartLoading(true);
      const res = await api.get(`/market/coins/${coin.id}/history?days=7`);
      setHistoryData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChartLoading(false);
    }
  };

  const filteredCoins = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Live Cryptocurrency Market Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time CoinGecko REST API market feed, pricing & historical trends</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search coin or symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-9"
          />
        </div>
      </div>

      {/* Market Table */}
      <div className="glass-panel p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <th className="pb-3"># Asset</th>
                  <th className="pb-3">Current Price</th>
                  <th className="pb-3">24h Change</th>
                  <th className="pb-3">Market Cap</th>
                  <th className="pb-3">24h Volume</th>
                  <th className="pb-3 text-right">Historical Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoins.map((coin, index) => {
                  const isGain = coin.price_change_percentage_24h >= 0;
                  return (
                    <tr key={coin.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-bold text-white flex items-center gap-3">
                        <span className="text-slate-500 font-mono text-[11px] w-4">{index + 1}</span>
                        {coin.image ? (
                          <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px]">
                            {coin.symbol.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div>{coin.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{coin.symbol.toUpperCase()}</div>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-white">${coin.current_price.toLocaleString()}</td>
                      <td className="py-3.5 font-mono font-bold">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${
                            isGain ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {isGain ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isGain ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">${coin.market_cap.toLocaleString()}</td>
                      <td className="py-3.5 font-mono text-slate-400">${coin.total_volume.toLocaleString()}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleOpenChart(coin)}
                          className="btn-secondary text-[11px] py-1 px-2.5"
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                          View Chart
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Chart Modal */}
      {selectedCoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl overflow-hidden border border-white/10">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedCoin.image && <img src={selectedCoin.image} alt={selectedCoin.name} className="w-7 h-7 rounded-full" />}
                <div>
                  <h3 className="text-base font-bold text-white">{selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})</h3>
                  <p className="text-xs text-slate-400 font-mono">7-Day Historical Price Curve</p>
                </div>
              </div>
              <button onClick={() => setSelectedCoin(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {isChartLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                        formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Price']}
                      />
                      <Area type="monotone" dataKey="price" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
