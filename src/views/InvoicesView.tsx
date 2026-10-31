import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Printer,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  DollarSign,
  ShieldCheck,
  X,
  Search
} from 'lucide-react';
import { useSubscriptionData } from '../context/SubscriptionDataContext';
import { Invoice, InvoiceStatus } from '../types';

interface InvoicesViewProps {
  searchTerm: string;
  onOpenInvoicePrint: (invoice: Invoice) => void;
  onOpenCheckout: (invoice: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  searchTerm,
  onOpenInvoicePrint,
  onOpenCheckout,
}) => {
  const { invoices, customers, subscriptions, addInvoice, validateDiscount } = useSubscriptionData();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manual Invoice Form
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  const [subtotal, setSubtotal] = useState<number>(99);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const discountAmount = appliedDiscount?.amount || 0;
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxable * (taxRate / 100) * 100) / 100;
  const totalAmount = Math.round((taxable + taxAmount) * 100) / 100;

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) return;
    const res = validateDiscount(discountCode, subtotal);
    if (res.valid) {
      setAppliedDiscount({ code: discountCode.trim().toUpperCase(), amount: res.discountAmount });
    } else {
      setAppliedDiscount(null);
      alert(res.message);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || subtotal <= 0) return;

    setIsSubmitting(true);
    try {
      const cust = customers.find(c => c.id === selectedCustomerId)!;
      const sub = subscriptions.find(s => s.id === selectedSubId);

      const periodStart = sub ? sub.currentPeriodStart : issueDate;
      const periodEnd = sub ? sub.currentPeriodEnd : dueDate;

      await addInvoice({
        subscriptionId: sub?.id,
        customerId: cust.id,
        customerName: cust.name,
        customerEmail: cust.email,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        issueDate,
        dueDate,
        subtotal,
        discountAmount,
        discountCode: appliedDiscount?.code,
        taxRate,
        taxAmount,
        totalAmount,
        status: 'unpaid',
        notes: notes || `Direct invoice issued for ${cust.name}`
      });

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setSelectedSubId('');
    setSubtotal(99);
    setDiscountCode('');
    setAppliedDiscount(null);
    setNotes('');
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Invoice & Billing Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {invoices.length} Invoices
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated subscription generation, tax calculations, print previews, and duplicate billing protection.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Invoices', count: invoices.length },
          { id: 'paid', label: 'Paid & Settled', count: invoices.filter(i => i.status === 'paid').length },
          { id: 'unpaid', label: 'Unpaid', count: invoices.filter(i => i.status === 'unpaid').length },
          { id: 'overdue', label: 'Overdue', count: invoices.filter(i => i.status === 'overdue').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Invoice #</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Billing Period</th>
                <th className="py-3.5 px-5">Amount & Tax</th>
                <th className="py-3.5 px-5">Due Date</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No invoices matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-slate-400 text-[10px]">Issue: {inv.issueDate}</div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{inv.customerName}</div>
                      <div className="text-slate-400 text-[11px]">{inv.customerEmail}</div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-mono text-slate-700">
                        {inv.billingPeriodStart} to {inv.billingPeriodEnd}
                      </div>
                      {inv.subscriptionId && (
                        <div className="text-[10px] text-indigo-600 font-medium">Linked Subscription</div>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-sm">
                        ${inv.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Sub: ${inv.subtotal.toFixed(2)} • Tax: ${inv.taxAmount.toFixed(2)}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-medium text-slate-700">{inv.dueDate}</div>
                      {inv.paidAt && (
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Paid: {new Date(inv.paidAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : inv.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {inv.status === 'paid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {inv.status === 'overdue' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                        {inv.status === 'unpaid' && <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{inv.status}</span>
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => onOpenCheckout(inv)}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Simulate Pay</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenInvoicePrint(inv)}
                          title="View & Print Invoice"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Generate Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">Generate Custom Invoice</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 text-xs">
              {/* Customer */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    setSelectedSubId('');
                  }}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="">Select Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                  ))}
                </select>
              </div>

              {/* Link to Subscription (Optional) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Link Subscription (Optional)</label>
                <select
                  value={selectedSubId}
                  onChange={(e) => {
                    const subId = e.target.value;
                    setSelectedSubId(subId);
                    const sub = subscriptions.find(s => s.id === subId);
                    if (sub) setSubtotal(sub.amount);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="">None / One-time Invoice</option>
                  {subscriptions
                    .filter(s => !selectedCustomerId || s.customerId === selectedCustomerId)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.subscriptionNumber} - {s.productName} (${s.amount})
                      </option>
                    ))}
                </select>
              </div>

              {/* Subtotal & Tax */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subtotal Amount ($) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={subtotal}
                    onChange={(e) => setSubtotal(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>
              </div>

              {/* Discount Code */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Apply Discount Coupon</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="e.g. LAUNCH20"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg"
                  >
                    Apply
                  </button>
                </div>
                {appliedDiscount && (
                  <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
                    Saved ${appliedDiscount.amount.toFixed(2)} with {appliedDiscount.code}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Consulting and setup fee"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({taxRate}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Calculated:</span>
                  <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedCustomerId}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Generating...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
