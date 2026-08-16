import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { PortfolioSummary, Transaction } from '../types';
import { Wallet, Plus, Trash2, Edit3, ArrowUpRight, ArrowDownRight, RefreshCw, FolderPlus } from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';

export const Portfolios: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Portfolio Form
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDesc, setNewPortfolioDesc] = useState('');

  // Transaction Modal
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/portfolios');
      const data: PortfolioSummary[] = res.data.data;
      setPortfolios(data);
      if (data.length > 0 && !selectedPortfolioId) {
        setSelectedPortfolioId(data[0].portfolioId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (pId: string) => {
    if (!pId) return;
    try {
      const res = await api.get(`/transactions/portfolio/${pId}`);
      setTransactions(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolioId) {
      fetchTransactions(selectedPortfolioId);
    }
  }, [selectedPortfolioId]);

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioName) return;
    try {
      await api.post('/portfolios', { name: newPortfolioName, description: newPortfolioDesc });
      setNewPortfolioName('');
      setNewPortfolioDesc('');
      setIsCreatingPortfolio(false);
      fetchPortfolios();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this portfolio and all its transactions?')) return;
    try {
      await api.delete(`/portfolios/${id}`);
      setSelectedPortfolioId('');
      fetchPortfolios();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions(selectedPortfolioId);
      fetchPortfolios();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const currentPortfolio = portfolios.find((p) => p.portfolioId === selectedPortfolioId);

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Portfolio & Transaction CRUD Management</h1>
          <p className="text-xs text-slate-400 mt-1">Full control over portfolio entities and trade execution logs</p>
        </div>

        <button onClick={() => setIsCreatingPortfolio(!isCreatingPortfolio)} className="btn-primary text-xs">
          <FolderPlus className="w-4 h-4" />
          Create New Portfolio
        </button>
      </div>

      {/* New Portfolio Inline Form */}
      {isCreatingPortfolio && (
        <form onSubmit={handleCreatePortfolio} className="glass-panel p-5 space-y-4 border border-indigo-500/40">
          <h3 className="text-sm font-bold text-white">Create New Financial Portfolio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Portfolio Name (e.g. DeFi Yield Fund)"
              value={newPortfolioName}
              onChange={(e) => setNewPortfolioName(e.target.value)}
              className="glass-input"
              required
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={newPortfolioDesc}
              onChange={(e) => setNewPortfolioDesc(e.target.value)}
              className="glass-input"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsCreatingPortfolio(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              Save Portfolio
            </button>
          </div>
        </form>
      )}

      {/* Portfolio Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {portfolios.map((p) => (
          <button
            key={p.portfolioId}
            onClick={() => setSelectedPortfolioId(p.portfolioId)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-bold transition-all shrink-0 ${
              selectedPortfolioId === p.portfolioId
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wallet className="w-4 h-4 text-indigo-400" />
            <div className="text-left">
              <div>{p.portfolioName}</div>
              <div className="text-[10px] text-slate-400 font-mono">${p.totalValue.toLocaleString()}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Portfolio Detail & Transactions Ledger */}
      {currentPortfolio && (
        <div className="glass-panel p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {currentPortfolio.portfolioName}
                <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  {currentPortfolio.currency}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Transaction History & Ledger</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setIsTxModalOpen(true)} className="btn-primary text-xs">
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
              {portfolios.length > 1 && (
                <button
                  onClick={() => handleDeletePortfolio(currentPortfolio.portfolioId)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Portfolio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Asset</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Exec Price</th>
                  <th className="pb-3">Total Value</th>
                  <th className="pb-3">Fee</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No transactions recorded in this portfolio yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isBuy = tx.type === 'BUY';
                    return (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full ${
                              isBuy ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-white">
                          {tx.coinName} <span className="text-slate-400 font-mono font-normal">({tx.coinSymbol})</span>
                        </td>
                        <td className="py-3.5 font-mono text-slate-200">{tx.amount}</td>
                        <td className="py-3.5 font-mono text-slate-300">${tx.pricePerUnit.toLocaleString()}</td>
                        <td className="py-3.5 font-mono font-bold text-white">${tx.totalSpent.toLocaleString()}</td>
                        <td className="py-3.5 font-mono text-slate-400">${tx.fee}</td>
                        <td className="py-3.5 font-mono text-slate-400">
                          {new Date(tx.transactionDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {selectedPortfolioId && (
        <TransactionModal
          portfolioId={selectedPortfolioId}
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          onSuccess={() => {
            fetchTransactions(selectedPortfolioId);
            fetchPortfolios();
          }}
        />
      )}
    </div>
  );
};
