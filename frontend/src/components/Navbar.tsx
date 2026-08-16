import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { TrendingUp, TrendingDown, User as UserIcon, LogOut, Cpu } from 'lucide-react';
import { CoinMarketData } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [topTickerCoins, setTopTickerCoins] = useState<CoinMarketData[]>([]);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await api.get('/market/coins?limit=4');
        setTopTickerCoins(res.data.data);
      } catch (err) {
        // silent fallback
      }
    };
    fetchTicker();
    const interval = setInterval(fetchTicker, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/80 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Live Market Ticker */}
      <div className="hidden md:flex items-center gap-6 text-xs font-mono">
        <span className="text-slate-400 font-sans font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Market:
        </span>
        {topTickerCoins.map((coin) => {
          const isGain = coin.price_change_percentage_24h >= 0;
          return (
            <div key={coin.id} className="flex items-center gap-2 bg-slate-900/60 px-3 py-1 rounded-full border border-white/5">
              <span className="font-semibold text-white">{coin.symbol.toUpperCase()}</span>
              <span className="text-slate-300">${coin.current_price.toLocaleString()}</span>
              <span className={`flex items-center text-[11px] font-bold ${isGain ? 'text-emerald-400' : 'text-red-400'}`}>
                {isGain ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isGain ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Right Controls / Profile */}
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-medium">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gemini AI Connected</span>
        </div>

        {user && (
          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white">{user.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
