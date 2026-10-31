import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap,
  CheckCircle2,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loginDemoAdmin, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Google Sign-In failed or popup was closed. You can also use the Instant Admin Access below.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleDemoAdmin = () => {
    loginDemoAdmin();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-cyan-500 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/10 to-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 p-0.5 shadow-xl shadow-cyan-500/20 mb-4 items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Layers className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-white tracking-tight">BRIGHTLOOP</h1>
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Smart Subscription Management & Recurring Billing Platform
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3.5">
            {/* Primary Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={signingIn || loading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{signingIn ? 'Connecting with Google...' : 'Sign In with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="w-full border-t border-slate-800"></div>
              <span className="absolute bg-[#0f172a] px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Or Instant Access
              </span>
            </div>

            {/* Quick Demo Admin Button */}
            <button
              onClick={handleDemoAdmin}
              className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span>Launch as Admin (Dharshan)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Capabilities bullet points */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Full Firestore Database Persistence</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Gemini 3.8 Flash Real-Time Copilot</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Automated Renewals & Duplicate Invoicing Guard</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-slate-600" />
          <span>Secured with Firebase Authentication & Firestore RBAC</span>
        </div>
      </div>
    </div>
  );
};
