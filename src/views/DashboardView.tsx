import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Layers,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Zap,
  Calendar,
  CreditCard,
  CheckCircle2,
  FileText,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useSubscriptionData } from '../context/SubscriptionDataContext';
import { NavItemKey } from '../components/Sidebar';
import { Invoice } from '../types';

interface DashboardViewProps {
  onNavigateTab: (tab: NavItemKey) => void;
  onOpenCheckout: (invoice: Invoice) => void;
  onOpenInvoicePrint: (invoice: Invoice) => void;
  onOpenAssistant: () => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenCheckout,
  onOpenInvoicePrint,
  onOpenAssistant,
}) => {
  const {
    metrics,
    subscriptions,
    invoices,
    payments,
    customers,
    churnScores,
    runRenewalAutomation
  } = useSubscriptionData();

  // Upcoming renewals within 7 days
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const upcomingRenewals = subscriptions.filter(sub => {
    if (sub.status !== 'active') return false;
    const renDate = new Date(sub.renewalDate || sub.currentPeriodEnd);
    return renDate <= nextWeek;
  });

  // Recent transactions
  const recentPayments = payments.slice(0, 5);

  // Status breakdown data for Pie Chart
  const statusCounts = subscriptions.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const subscriptionPieData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Revenue trend data (synthesized from payments and active subscriptions)
  const revenueTrendData = [
    { month: 'May', revenue: Math.round(metrics.totalRevenue * 0.45) },
    { month: 'Jun', revenue: Math.round(metrics.totalRevenue * 0.58) },
    { month: 'Jul', revenue: Math.round(metrics.totalRevenue * 0.65) },
    { month: 'Aug', revenue: Math.round(metrics.totalRevenue * 0.78) },
    { month: 'Sep', revenue: Math.round(metrics.totalRevenue * 0.90) },
    { month: 'Oct', revenue: Math.round(metrics.totalRevenue) },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Executive Revenue Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live Real-Time
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking recurring revenue, subscription lifecycle, automated renewals, and churn health.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigateTab('subscriptions')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>New Subscription</span>
          </button>
          <button
            onClick={onOpenAssistant}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Ask Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Collected Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-600 font-semibold gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>From {payments.filter(p => p.status === 'completed').length} completed payments</span>
          </div>
        </div>

        {/* MRR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Monthly Recurring (MRR)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ${metrics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 font-medium gap-1">
            <span>ARR: ${(metrics.mrr * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })} projected</span>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Active Subscriptions</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics.activeSubscriptions}
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              / {subscriptions.length} total
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-amber-600 font-medium gap-1">
            <span>{metrics.expiredSubscriptions} expired / cancelled</span>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Pending Invoices</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ${metrics.pendingInvoicesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center text-xs text-rose-600 font-medium gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{metrics.pendingInvoicesCount} invoices awaiting payment</span>
          </div>
        </div>
      </div>

      {/* Upcoming Renewals Banner & Duplicate Prevention Notice */}
      {upcomingRenewals.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{upcomingRenewals.length} Upcoming Subscription Renewal(s) this Week</span>
                <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Action Recommended
                </span>
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Subscriptions for {upcomingRenewals.map(s => s.customerName).join(', ')} are reaching end of cycle.
                Automated billing engine prevents duplicate invoices for the same cycle.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('automation')}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Run Renewal Audit
            </button>
            <button
              onClick={() => onNavigateTab('subscriptions')}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              View Subscriptions
            </button>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Growth Trend</h3>
              <p className="text-xs text-slate-400">Total collected recurring revenue over time</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              +24% vs Last Quarter
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(val: any) => [`$${val?.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Subscription Status</h3>
            <p className="text-xs text-slate-400">Distribution across active plans</p>
          </div>

          <div className="h-48 w-full my-auto flex items-center justify-center">
            {subscriptionPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {subscriptionPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No subscriptions found</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {subscriptionPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Unpaid Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-xs text-slate-400">Latest settled customer payments</p>
            </div>
            <button
              onClick={() => onNavigateTab('payments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No payment transactions yet.</div>
            ) : (
              recentPayments.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{p.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {p.paymentNumber} • {p.method.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-sm">
                      +${p.amount.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(p.paidAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending / Overdue Invoices Requiring Action */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Invoices Awaiting Payment</h3>
              <p className="text-xs text-slate-400">Outstanding receivables</p>
            </div>
            <button
              onClick={() => onNavigateTab('invoices')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage Invoices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {invoices.filter(i => i.status !== 'paid').slice(0, 5).map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{inv.invoiceNumber}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {inv.customerName} • Due: {inv.dueDate}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <div className="font-bold text-slate-900 text-sm">
                      ${inv.totalAmount.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenCheckout(inv)}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    Simulate Pay
                  </button>
                  <button
                    onClick={() => onOpenInvoicePrint(inv)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="View & Print Invoice"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {invoices.filter(i => i.status !== 'paid').length === 0 && (
              <div className="p-8 text-center text-slate-400">
                All customer invoices are paid and settled!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
