import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  RotateCw,
  XCircle,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  BadgePercent,
  X,
  CreditCard
} from 'lucide-react';
import { useSubscriptionData } from '../context/SubscriptionDataContext';
import { Subscription, SubscriptionStatus, FrequencyType } from '../types';

interface SubscriptionsViewProps {
  searchTerm: string;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({ searchTerm }) => {
  const {
    subscriptions,
    customers,
    products,
    plans,
    addSubscription,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    renewSubscription,
    validateDiscount
  } = useSubscriptionData();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for creating a subscription
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoRenew, setAutoRenew] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter plans based on selected product
  const availablePlans = plans.filter(p => !selectedProductId || p.productId === selectedProductId);

  // Selected plan details
  const activePlan = plans.find(p => p.id === selectedPlanId);
  const basePrice = activePlan ? activePlan.price : 0;
  const finalPrice = Math.max(0, basePrice - (appliedDiscount?.amount || 0));

  const handleApplyDiscount = () => {
    setDiscountError(null);
    if (!discountCode.trim()) return;
    const res = validateDiscount(discountCode, basePrice);
    if (!res.valid) {
      setDiscountError(res.message);
      setAppliedDiscount(null);
    } else {
      setAppliedDiscount({ code: discountCode.trim().toUpperCase(), amount: res.discountAmount });
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProductId || !selectedPlanId) return;

    setIsSubmitting(true);
    try {
      const customer = customers.find(c => c.id === selectedCustomerId)!;
      const product = products.find(p => p.id === selectedProductId)!;
      const plan = plans.find(p => p.id === selectedPlanId)!;

      // Calculate period end based on frequency
      const start = new Date(startDate);
      const end = new Date(start);
      if (plan.frequency === 'yearly') {
        end.setFullYear(end.getFullYear() + 1);
      } else if (plan.frequency === 'quarterly') {
        end.setMonth(end.getMonth() + 3);
      } else {
        end.setMonth(end.getMonth() + 1);
      }

      const periodEndStr = end.toISOString().split('T')[0];

      await addSubscription({
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        productId: product.id,
        productName: product.name,
        planId: plan.id,
        planName: plan.name,
        frequency: plan.frequency,
        amount: finalPrice,
        status: 'active',
        startDate,
        currentPeriodStart: startDate,
        currentPeriodEnd: periodEndStr,
        renewalDate: periodEndStr,
        discountCode: appliedDiscount?.code,
        discountAmount: appliedDiscount?.amount,
        autoRenew
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
    setSelectedProductId('');
    setSelectedPlanId('');
    setDiscountCode('');
    setAppliedDiscount(null);
    setDiscountError(null);
    setStartDate(new Date().toISOString().split('T')[0]);
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSearch =
      sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Subscription Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {subscriptions.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, renew, pause, and lifecycle track customer recurring contracts.
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
          <span>New Subscription</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Subscriptions', count: subscriptions.length },
          { id: 'active', label: 'Active', count: subscriptions.filter(s => s.status === 'active').length },
          { id: 'pending', label: 'Pending', count: subscriptions.filter(s => s.status === 'pending').length },
          { id: 'paused', label: 'Paused', count: subscriptions.filter(s => s.status === 'paused').length },
          { id: 'expired', label: 'Expired', count: subscriptions.filter(s => s.status === 'expired').length },
          { id: 'cancelled', label: 'Cancelled', count: subscriptions.filter(s => s.status === 'cancelled').length },
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

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Subscription ID & Product</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Billing Plan</th>
                <th className="py-3.5 px-5">Recurring Price</th>
                <th className="py-3.5 px-5">Renewal Date</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No subscriptions matching the filter.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map(sub => {
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-mono font-bold text-slate-900">{sub.subscriptionNumber}</div>
                        <div className="text-slate-500 font-medium">{sub.productName}</div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{sub.customerName}</div>
                        <div className="text-slate-400 text-[11px]">{sub.customerEmail}</div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-medium text-slate-800">{sub.planName}</div>
                        <span className="inline-block mt-0.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {sub.frequency}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">
                          ${sub.amount.toFixed(2)}
                        </div>
                        {sub.discountAmount ? (
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Discount: -${sub.discountAmount.toFixed(2)}
                          </div>
                        ) : null}
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sub.renewalDate || sub.currentPeriodEnd}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {sub.autoRenew ? 'Auto-renew enabled' : 'Manual renewal'}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            sub.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : sub.status === 'paused'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : sub.status === 'expired'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {sub.status === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {sub.status === 'paused' && <Pause className="w-3 h-3 text-amber-600" />}
                          {sub.status === 'expired' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          <span>{sub.status}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.status === 'active' && (
                            <button
                              onClick={() => pauseSubscription(sub.id)}
                              title="Pause Subscription"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}

                          {sub.status === 'paused' && (
                            <button
                              onClick={() => resumeSubscription(sub.id)}
                              title="Resume Subscription"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => renewSubscription(sub.id)}
                            title="Renew & Generate Next Invoice"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>

                          {sub.status !== 'cancelled' && (
                            <button
                              onClick={() => cancelSubscription(sub.id)}
                              title="Cancel Subscription"
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">Create New Subscription</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="p-6 space-y-4 text-xs">
              {/* Customer */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="">Select a Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company || c.email})</option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setSelectedPlanId('');
                  }}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="">Select a Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price} base)</option>
                  ))}
                </select>
              </div>

              {/* Plan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plan Frequency & Pricing *</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  required
                  disabled={!selectedProductId}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium disabled:opacity-50"
                >
                  <option value="">Select Plan...</option>
                  {availablePlans.map(pl => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} - ${pl.price} ({pl.frequency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Discount Code */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discount Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="e.g. LAUNCH20, WELCOME50"
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
                  <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Coupon {appliedDiscount.code} applied! Saved ${appliedDiscount.amount.toFixed(2)}
                  </p>
                )}
                {discountError && (
                  <p className="text-[11px] text-rose-500 mt-1">{discountError}</p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                </input>
              </div>

              {/* Cost Preview Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Base Plan Price:</span>
                  <span className="font-semibold">${basePrice.toFixed(2)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-${appliedDiscount.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Recurring Billing Amount:</span>
                  <span className="text-blue-600">${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Auto Renew checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoRenew" className="text-slate-700 font-medium select-none">
                  Enable automated recurring renewal invoices
                </label>
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
                  disabled={isSubmitting || !selectedPlanId || !selectedCustomerId}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Activate Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
