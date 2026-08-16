import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, PlayCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async () => {
    try {
      setIsSubmitting(true);
      await loginAsDemo();
      navigate('/');
    } catch (err: any) {
      setError('Demo login error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090d16] relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="glass-panel w-full max-w-md p-8 space-y-6 relative border border-white/10 shadow-2xl">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">NexusAnalytics</h1>
          <p className="text-xs text-slate-400">Sign in to your financial intelligence suite</p>
        </div>

        {/* Instant Demo Login Button */}
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-4 rounded-xl space-y-2 text-center">
          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono">1-Click Technical Evaluation</div>
          <p className="text-[11px] text-slate-300">Evaluate pre-populated holdings, live CoinGecko pricing & Gemini AI Insights.</p>
          <button
            onClick={handleDemoClick}
            disabled={isSubmitting}
            className="w-full btn-primary py-2.5 justify-center text-xs shadow-lg shadow-indigo-500/25 mt-1"
          >
            <PlayCircle className="w-4 h-4" />
            Launch Instant Demo Account
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-mono">Or Login with Credentials</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full pl-10"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full btn-secondary py-2.5 justify-center text-xs font-bold">
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};
