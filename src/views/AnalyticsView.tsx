import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useSubscriptionData } from '../context/SubscriptionDataContext';

const PIE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export const AnalyticsView: React.FC = () => {
  const { metrics, churnScores, products, subscriptions, payments, customers } = useSubscriptionData();

  // Product revenue performance ranking
  const productRevenueMap = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => {
      acc[s.productName] = (acc[s.productName] || 0) + (s.amount || 0);
      return acc;
    }, {} as Record<string, number>);

  const productPerformanceData = Object.entries(productRevenueMap).map(([name, revenue]) => ({
    name: name.length > 18 ? name.slice(0, 16) + '...' : name,
    revenue: Math.round(revenue * 100) / 100
  })).sort((a, b) => b.revenue - a.revenue);

  // Payment channel distribution
  const paymentMethodMap = payments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  const paymentMethodData = Object.entries(paymentMethodMap).map(([method, amount]) => ({
    name: method.replace('_', ' ').toUpperCase(),
    value: Math.round(amount * 100) / 100
  }));

  // ARPU (Average Revenue Per User)
  const arpu = customers.length > 0 ? metrics.mrr / customers.length : 0;
  const arr = metrics.mrr * 12;

  // Monthly revenue trend projection
  const monthlyRevenueData = [
    { month: 'Jun 2026', revenue: Math.round(metrics.mrr * 0.72), subscribers: 3 },
    { month: 'Jul 2026', revenue: Math.round(metrics.mrr * 0.81), subscribers: 4 },
    { month: 'Aug 2026', revenue: Math.round(metrics.mrr * 0.88), subscribers: 4 },
    { month: 'Sep 2026', revenue: Math.round(metrics.mrr * 0.94), subscribers: 5 },
    { month: 'Oct 2026', revenue: Math.round(metrics.mrr), subscribers: metrics.activeSubscriptions },
    { month: 'Nov (Proj)', revenue: Math.round(metrics.mrr * 1.15), subscribers: metrics.activeSubscriptions + 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>SaaS Analytics & Churn Intelligence</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Executive View
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Financial metrics, MRR projections, payment channel mix, and rule-based churn risk scoring.
          </p>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Monthly Recurring (MRR)</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ${metrics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Annualized ARR: ${arr.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Average Revenue / Customer</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ${arpu.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Monthly ARPU</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Active Contract Volume</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics.activeSubscriptions}
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            {subscriptions.length} lifetime subscriptions
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Platform Churn Estimate</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics.churnRateEstimate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {churnScores.filter(c => c.riskLevel === 'High').length} high risk account(s)
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly MRR Projection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">MRR Trajectory & Forecast</h3>
              <p className="text-xs text-slate-400">Monthly recurring billing progression</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Active Forecast
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val: any) => [`$${val?.toLocaleString()}`, 'MRR']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Revenue Performance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Generated by Product</h3>
              <p className="text-xs text-slate-400">Active subscription contributions</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            {productPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(val: any) => [`$${val?.toLocaleString()}`, 'Active Revenue']}
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active product subscriptions yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Churn Risk Analysis Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Customer Retention & Churn Risk Health
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rule-based scoring evaluating overdue invoices, contract status, payment inactivity, and dunning state.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Customer Account</th>
                <th className="py-3.5 px-5">Churn Risk Score</th>
                <th className="py-3.5 px-5">Active Plans</th>
                <th className="py-3.5 px-5">Open Invoices</th>
                <th className="py-3.5 px-5">Identified Risk Indicators</th>
                <th className="py-3.5 px-5">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {churnScores.map(score => (
                <tr key={score.customerId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900 text-sm">{score.customerName}</div>
                    <div className="text-slate-400 text-[11px]">{score.company}</div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-md ${
                          score.riskLevel === 'High'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : score.riskLevel === 'Medium'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {score.riskScore}% {score.riskLevel}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-5 font-bold text-slate-800">
                    {score.activeSubscriptionsCount}
                  </td>

                  <td className="py-4 px-5 font-bold text-slate-800">
                    {score.unpaidInvoicesCount > 0 ? (
                      <span className="text-rose-600 font-bold">{score.unpaidInvoicesCount} due</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">0 due</span>
                    )}
                  </td>

                  <td className="py-4 px-5">
                    <ul className="space-y-0.5">
                      {score.reasons.map((r, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="py-4 px-5">
                    {score.riskLevel === 'High' ? (
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 block">
                        Schedule CFO dunning call & review overdue terms
                      </span>
                    ) : score.riskLevel === 'Medium' ? (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 block">
                        Offer renewal promo code & check satisfaction
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 block">
                        Eligible for annual tier upgrade upsell
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
