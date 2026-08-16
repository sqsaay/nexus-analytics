import React, { useState } from 'react';
import { X, PlusCircle, DollarSign, Calendar, FileText } from 'lucide-react';
import api from '../api/client';

interface Props {
  portfolioId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
];

export const TransactionModal: React.FC<Props> = ({ portfolioId, isOpen, onClose, onSuccess }) => {
  const [selectedCoinId, setSelectedCoinId] = useState('bitcoin');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [fee, setFee] = useState('0');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) <= 0) return setError('Please enter a valid positive amount.');
    if (!pricePerUnit || Number(pricePerUnit) <= 0) return setError('Please enter a valid price per unit.');

    const coin = PRESET_COINS.find((c) => c.id === selectedCoinId) || PRESET_COINS[0];

    try {
      setIsSubmitting(true);
      await api.post(`/transactions/portfolio/${portfolioId}`, {
        coinId: coin.id,
        coinSymbol: coin.symbol,
        coinName: coin.name,
        type,
        amount: Number(amount),
        pricePerUnit: Number(pricePerUnit),
        fee: Number(fee || 0),
        notes,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            <span>Log Portfolio Transaction</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}

          {/* Buy / Sell Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                type === 'BUY' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Buy Asset
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                type === 'SELL' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sell Asset
            </button>
          </div>

          {/* Asset Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cryptocurrency Asset</label>
            <select
              value={selectedCoinId}
              onChange={(e) => setSelectedCoinId(e.target.value)}
              className="glass-input w-full"
            >
              {PRESET_COINS.map((coin) => (
                <option key={coin.id} value={coin.id} className="bg-slate-900 text-white">
                  {coin.name} ({coin.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quantity / Amount</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 0.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="glass-input w-full font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price Per Unit ($)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 64250.00"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className="glass-input w-full font-mono"
              />
            </div>
          </div>

          {/* Fee & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tx Fee ($)</label>
              <input
                type="number"
                step="any"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="glass-input w-full font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Memo / Notes</label>
              <input
                type="text"
                placeholder="e.g. Monthly DCA"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="glass-input w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Recording...' : 'Submit Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
