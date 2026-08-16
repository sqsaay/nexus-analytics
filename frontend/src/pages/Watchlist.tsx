import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { WatchlistItem } from '../types';
import { Eye, Plus, Trash2, Bell, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const PRESET_COINS = [
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
];

export const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCoinId, setSelectedCoinId] = useState('cardano');
  const [targetPrice, setTargetPrice] = useState('');
  const [notes, setNotes] = useState('');

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/watchlists');
      setWatchlist(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAddWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const coin = PRESET_COINS.find((c) => c.id === selectedCoinId) || PRESET_COINS[0];
    try {
      await api.post('/watchlists', {
        coinId: coin.id,
        coinSymbol: coin.symbol,
        coinName: coin.name,
        targetPrice: targetPrice ? Number(targetPrice) : null,
        notes,
      });
      setTargetPrice('');
      setNotes('');
      setIsAdding(false);
      fetchWatchlist();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add to watchlist');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/watchlists/${id}`);
      fetchWatchlist();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Watchlist & Target Price Alerts</h1>
          <p className="text-xs text-slate-400 mt-1">Track target execution levels and trigger smart notification badges</p>
        </div>

        <button onClick={() => setIsAdding(!isAdding)} className="btn-primary text-xs">
          <Plus className="w-4 h-4" />
          Add Tracked Coin
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddWatchlist} className="glass-panel p-5 space-y-4 border border-indigo-500/40">
          <h3 className="text-sm font-bold text-white">Add Cryptocurrency Alert</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Coin</label>
              <select
                value={selectedCoinId}
                onChange={(e) => setSelectedCoinId(e.target.value)}
                className="glass-input w-full"
              >
                {PRESET_COINS.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900">
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Target Alert Price ($)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 15.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="glass-input w-full font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Notes</label>
              <input
                type="text"
                placeholder="e.g. Breakout buy trigger"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="glass-input w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              Save Alert Target
            </button>
          </div>
        </form>
      )}

      {/* Watchlist Cards Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      ) : watchlist.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 text-xs">No coins added to your watchlist yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {watchlist.map((item) => {
            const isAlert = item.alertStatus === 'ABOVE_TARGET';
            return (
              <div key={item.id} className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-300 border border-white/10">
                      {item.coinSymbol}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{item.coinName}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{item.coinSymbol}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-white/5 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Price</span>
                    <span className="font-bold text-white">${item.currentPrice?.toLocaleString() || '---'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Target Price</span>
                    <span className="font-bold text-indigo-300">${item.targetPrice?.toLocaleString() || 'None'}</span>
                  </div>
                </div>

                {item.targetPrice && (
                  <div className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border ${
                    isAlert ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900/40 border-white/5 text-slate-400'
                  }`}>
                    {isAlert ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    <span>{isAlert ? 'Target Price Trigger Reached!' : 'Tracking Target Level...'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
