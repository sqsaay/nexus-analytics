import React from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react';
import { AiInsightsData } from '../types';

interface Props {
  data: AiInsightsData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AiInsightsModal: React.FC<Props> = ({ data, isOpen, onClose }) => {
  if (!isOpen || !data) return null;

  const { aiInsights } = data;
  const isHighRisk = aiInsights.riskLevel === 'High' || aiInsights.riskLevel === 'Aggressive';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl overflow-hidden border border-indigo-500/30 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Gemini AI Financial Copilot
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                  Real-Time Audit
                </span>
              </h2>
              <p className="text-xs text-slate-300">Intelligent Portfolio Analysis for "{data.portfolioName}"</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Health & Risk Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-slate-400 font-medium">Health Score</div>
              <div className="text-3xl font-extrabold text-indigo-400 font-mono mt-1">
                {aiInsights.healthScore}<span className="text-sm font-sans text-slate-400">/100</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-slate-400 font-medium">Risk Level</div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {isHighRisk ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span className={`text-base font-bold ${isHighRisk ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {aiInsights.riskLevel}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-slate-400 font-medium">Market Outlook</div>
              <div className="flex items-center justify-center gap-1.5 mt-1 font-bold text-purple-300">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>{aiInsights.marketSentiment}</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-xl">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1 font-mono">Executive Summary</h3>
            <p className="text-sm text-slate-200 leading-relaxed">{aiInsights.summary}</p>
          </div>

          {/* Diversification */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Diversification Assessment</h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
              {aiInsights.diversificationAnalysis}
            </p>
          </div>

          {/* Actionable Advice */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">Key Rebalancing Recommendations</h3>
            <div className="space-y-2">
              {aiInsights.topRecommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-white/5 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/80 p-4 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="btn-primary">
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
