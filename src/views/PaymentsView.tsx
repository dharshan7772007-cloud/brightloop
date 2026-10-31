import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  CheckCircle2,
  Search,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useSubscriptionData } from '../context/SubscriptionDataContext';
import { PaymentMethod, Invoice } from '../types';

interface PaymentsViewProps {
  searchTerm: string;
  onOpenCheckout: (invoice: Invoice) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ searchTerm, onOpenCheckout }) => {
  const { payments, invoices } = useSubscriptionData();
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const totalCollected = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const avgTxn = payments.length > 0 ? totalCollected / payments.length : 0;

  const methodCounts = payments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const unpaidInvoices = invoices.filter(i => i.status !== 'paid');

  const filteredPayments = payments.filter(p => {
    const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
    const matchesSearch =
      p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'upi':
        return <QrCode className="w-4 h-4 text-emerald-600" />;
      case 'card':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'net_banking':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'cash':
        return <Banknote className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Payment Transactions & Reconciliation</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {payments.length} Settled
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconciliation ledger supporting UPI, Card, Net Banking, and Cash with sandbox checkout simulation.
          </p>
        </div>

        {unpaidInvoices.length > 0 && (
          <button
            onClick={() => onOpenCheckout(unpaidInvoices[0])}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Launch Simulated Checkout</span>
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Collected Volume</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {payments.filter(p => p.status === 'completed').length} Successful Settlements
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Average Ticket Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ${avgTxn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all payment channels</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Channel Mix</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mt-2">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Card: {methodCounts['card'] || 0}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              UPI: {methodCounts['upi'] || 0}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              Net: {methodCounts['net_banking'] || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Methods' },
          { id: 'card', label: 'Cards' },
          { id: 'upi', label: 'UPI / QR' },
          { id: 'net_banking', label: 'Net Banking' },
          { id: 'cash', label: 'Cash / Wire' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMethodFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              methodFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Receipt #</th>
                <th className="py-3.5 px-5">Customer & Invoice</th>
                <th className="py-3.5 px-5">Method</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Gateway Reference ID</th>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-slate-900">{p.paymentNumber}</div>
                      {p.isSimulated && (
                        <span className="inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          Simulated Sandbox
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{p.customerName}</div>
                      <div className="text-slate-400 text-[11px] font-mono">Invoice: {p.invoiceNumber}</div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 font-bold uppercase text-slate-800">
                        {getMethodIcon(p.method)}
                        <span>{p.method.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-sm">
                        ${p.amount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">{p.currency}</div>
                    </td>

                    <td className="py-4 px-5 font-mono text-[11px] text-slate-700">
                      {p.referenceId}
                    </td>

                    <td className="py-4 px-5 text-slate-600">
                      {new Date(p.paidAt).toLocaleString()}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
