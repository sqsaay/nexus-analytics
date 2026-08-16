import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Globe, Eye, Sparkles } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portfolios', label: 'Portfolios & CRUD', icon: Wallet },
    { to: '/market', label: 'Market Explorer', icon: Globe },
    { to: '/watchlist', label: 'Watchlist & Alerts', icon: Eye },
  ];

  return (
    <aside className="w-64 bg-[#0c111e]/90 border-r border-white/10 flex flex-col justify-between py-6 px-4 shrink-0 min-h-[calc(100vh-57px)]">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white">NexusAnalytics</h1>
            <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider font-semibold">Crypto Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Tech Stack Badge */}
      <div className="glass-panel p-3 text-center">
        <div className="text-[11px] font-bold text-slate-300">Stack Showcase</div>
        <div className="text-[10px] text-slate-400 mt-1 flex justify-center gap-1.5 flex-wrap">
          <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">React</span>
          <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Node.js</span>
          <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">PostgreSQL</span>
        </div>
      </div>
    </aside>
  );
};
