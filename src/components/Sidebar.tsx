import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  CreditCard,
  FileText,
  BadgePercent,
  TrendingUp,
  Bot,
  Zap,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscriptionData } from '../context/SubscriptionDataContext';

export type NavItemKey =
  | 'dashboard'
  | 'subscriptions'
  | 'invoices'
  | 'payments'
  | 'customers'
  | 'products'
  | 'plans'
  | 'discounts'
  | 'analytics'
  | 'assistant'
  | 'automation';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { adminProfile, logout } = useAuth();
  const { metrics, notifications } = useSubscriptionData();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      key: 'subscriptions',
      label: 'Subscriptions',
      icon: Layers,
      badge: metrics.activeSubscriptions ? `${metrics.activeSubscriptions} active` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300'
    },
    {
      key: 'invoices',
      label: 'Invoices',
      icon: FileText,
      badge: metrics.pendingInvoicesCount > 0 ? `${metrics.pendingInvoicesCount} due` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300'
    },
    { key: 'payments', label: 'Payments', icon: CreditCard },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'plans', label: 'Plans', icon: CheckCircle2 },
    { key: 'discounts', label: 'Discounts', icon: BadgePercent },
    { key: 'analytics', label: 'Analytics', icon: TrendingUp },
    {
      key: 'automation',
      label: 'Renewals & Auto',
      icon: Zap,
    },
    {
      key: 'assistant',
      label: 'AI Copilot',
      icon: Bot,
      highlight: true
    },
  ];

  const handleNavClick = (key: NavItemKey) => {
    onSelectTab(key);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B132B] text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">BRIGHTLOOP</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Billing Hub</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Core Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key as NavItemKey)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                    : item.highlight
                    ? 'text-cyan-300 hover:bg-cyan-950/30 hover:text-cyan-200 border border-cyan-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-cyan-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* MRR Quick Summary Banner */}
        <div className="px-4 py-3 mx-4 mb-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Platform MRR</span>
            <span className="text-emerald-400 font-semibold">+18.4%</span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            ${metrics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{metrics.activeSubscriptions} live subscriptions</span>
          </div>
        </div>

        {/* User Account / Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070c1d] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-700 shrink-0">
              {adminProfile?.displayName?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                <span>{adminProfile?.displayName || 'Administrator'}</span>
                <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {adminProfile?.email || 'admin@brightloop.ai'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
