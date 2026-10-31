import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  RefreshCw,
  Zap,
  CheckCircle,
  Database,
  ExternalLink,
  X
} from 'lucide-react';
import { useSubscriptionData } from '../context/SubscriptionDataContext';
import { NavItemKey } from './Sidebar';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenAssistant: () => void;
  onNavigateTab: (tab: NavItemKey) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenAssistant,
  onNavigateTab,
  searchTerm,
  onSearchChange,
}) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    runRenewalAutomation,
    seedSampleData,
    isSeeding,
    firestoreConnected
  } = useSubscriptionData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditMessage(null);
    try {
      const res = await runRenewalAutomation();
      setAuditMessage(`Found ${res.renewalsDetected} upcoming renewals. Created ${res.invoicesGenerated} invoices.`);
      setTimeout(() => setAuditMessage(null), 5000);
    } catch (e: any) {
      setAuditMessage(`Audit error: ${e.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left Area: Mobile Menu + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search subscriptions, customers, invoices, products..."
            className="w-full pl-9 pr-4 py-1.5 text-xs lg:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Area: Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Real-time DB indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 border border-slate-200 text-slate-600">
          <Database className="w-3 h-3 text-emerald-500" />
          <span>Firestore Live</span>
        </div>

        {/* Renewal Automation Audit Button */}
        <button
          onClick={handleRunAudit}
          disabled={isAuditing}
          title="Run automated renewal check and duplicate prevention scan"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors disabled:opacity-50"
        >
          <Zap className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : 'text-amber-600'}`} />
          <span>{isAuditing ? 'Scanning...' : 'Audit Renewals'}</span>
        </button>

        {/* Reset / Seed Sample Data */}
        <button
          onClick={() => seedSampleData(true)}
          disabled={isSeeding}
          title="Reset database to initial enterprise demo dataset"
          className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-blue-600' : ''}`} />
          <span>Reset Demo</span>
        </button>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={onOpenAssistant}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span className="hidden sm:inline">Ask AI Copilot</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  <p className="text-[11px] text-slate-500">
                    {unreadNotifications.length} unread updates
                  </p>
                </div>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.link) {
                          onNavigateTab(notif.link as NavItemKey);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                          )}
                          <span>{notif.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Audit Toast Alert */}
      {auditMessage && (
        <div className="absolute top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{auditMessage}</span>
          <button onClick={() => setAuditMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
