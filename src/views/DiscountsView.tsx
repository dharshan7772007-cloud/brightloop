import React, { useState } from 'react';
import {
  BadgePercent,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  X,
  Search,
  Calculator
} from 'lucide-react';
import { useSubscriptionData } from '../context/SubscriptionDataContext';
import { Discount, DiscountType, DiscountStatus } from '../types';

interface DiscountsViewProps {
  searchTerm: string;
}

export const DiscountsView: React.FC<DiscountsViewProps> = ({ searchTerm }) => {
  const { discounts, addDiscount, updateDiscount, deleteDiscount, validateDiscount } = useSubscriptionData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<DiscountType>('percentage');
  const [value, setValue] = useState<number>(20);
  const [minInvoiceAmount, setMinInvoiceAmount] = useState<number>(50);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(100);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [status, setStatus] = useState<DiscountStatus>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live validator widget states
  const [testCode, setTestCode] = useState('LAUNCH20');
  const [testAmount, setTestAmount] = useState<number>(100);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingDiscount(null);
    setCode('');
    setName('');
    setType('percentage');
    setValue(20);
    setMinInvoiceAmount(50);
    setMaxDiscountAmount(100);
    setStartDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setExpiryDate(d.toISOString().split('T')[0]);
    setUsageLimit(100);
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (disc: Discount) => {
    setEditingDiscount(disc);
    setCode(disc.code);
    setName(disc.name);
    setType(disc.type);
    setValue(disc.value);
    setMinInvoiceAmount(disc.minInvoiceAmount || 0);
    setMaxDiscountAmount(disc.maxDiscountAmount || 0);
    setStartDate(disc.startDate);
    setExpiryDate(disc.expiryDate);
    setUsageLimit(disc.usageLimit || 100);
    setStatus(disc.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, {
          code: code.trim().toUpperCase(),
          name,
          type,
          value,
          minInvoiceAmount,
          maxDiscountAmount: type === 'percentage' ? maxDiscountAmount : undefined,
          startDate,
          expiryDate,
          usageLimit,
          status
        });
      } else {
        await addDiscount({
          code: code.trim().toUpperCase(),
          name,
          type,
          value,
          minInvoiceAmount,
          maxDiscountAmount: type === 'percentage' ? maxDiscountAmount : undefined,
          startDate,
          expiryDate,
          usageLimit,
          status
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestValidation = () => {
    const result = validateDiscount(testCode, testAmount);
    setValidationResult(result);
  };

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredDiscounts = discounts.filter(d => {
    const q = searchTerm.toLowerCase();
    return (
      d.code.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Discounts & Promotions Engine</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {discounts.length} Coupons
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage fixed and percentage discount promo campaigns with automated invoice eligibility checks.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Discount Code</span>
        </button>
      </div>

      {/* Live Sandbox Validator Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-2xl border border-blue-800 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm text-white">Live Discount Code Simulator</h3>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
            Interactive Test
          </span>
        </div>
        <p className="text-xs text-blue-200 mb-4">
          Test how any promotional coupon validates against minimum order limits and expiry windows before publishing.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value.toUpperCase())}
            placeholder="PROMO CODE"
            className="px-3.5 py-2 text-xs bg-slate-900/80 border border-blue-700/80 rounded-xl text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-blue-700/80 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-400">$</span>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
              placeholder="Order amount"
              className="w-24 bg-transparent text-white font-mono focus:outline-none"
            />
          </div>
          <button
            onClick={handleTestValidation}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            Run Validation
          </button>
        </div>

        {validationResult && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            validationResult.valid
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-200 border-rose-500/40'
          }`}>
            <div className="flex items-center gap-2">
              {validationResult.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{validationResult.message}</span>
            </div>
            {validationResult.valid && (
              <span className="font-mono font-bold text-white text-sm">
                Net Pay: ${(testAmount - validationResult.discountAmount).toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiscounts.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
            No discount promotions found matching your search.
          </div>
        ) : (
          filteredDiscounts.map(disc => {
            const isExpired = new Date().toISOString().split('T')[0] > disc.expiryDate;
            const effectiveStatus = isExpired ? 'expired' : disc.status;

            return (
              <div
                key={disc.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 tracking-wider">
                        {disc.code}
                      </span>
                      <button
                        onClick={() => handleCopy(disc.code)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copy promo code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {copiedCode === disc.code && (
                        <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(disc)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Promo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete coupon ${disc.code}?`)) {
                            deleteDiscount(disc.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Promo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800">{disc.name}</h4>

                  {/* Value Badge */}
                  <div className="py-3 my-2 border-y border-slate-100 flex items-center justify-between">
                    <span className="text-2xl font-black text-blue-600">
                      {disc.type === 'percentage' ? `${disc.value}% OFF` : `$${disc.value} FLAT OFF`}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Min: ${disc.minInvoiceAmount || 0}
                    </span>
                  </div>

                  {/* Limits and Validity */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Validity:</span>
                      <span className="font-medium text-slate-800">{disc.startDate} to {disc.expiryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Redemptions:</span>
                      <span className="font-medium text-slate-800">
                        {disc.usedCount} / {disc.usageLimit || '∞'} used
                      </span>
                    </div>
                    {disc.maxDiscountAmount && disc.type === 'percentage' && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Max Discount Cap:</span>
                        <span className="font-medium text-slate-800">${disc.maxDiscountAmount}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer status */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Campaign Status</span>
                  <span
                    className={`font-bold uppercase px-2 py-0.5 rounded-full text-[10px] ${
                      effectiveStatus === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : effectiveStatus === 'expired'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {effectiveStatus}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">
                  {editingDiscount ? 'Edit Discount Coupon' : 'Create Promotion Coupon'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Promo Code (Uppercase) *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    placeholder="e.g. FLASH30"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Q4 Growth Promo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DiscountType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {type === 'percentage' ? 'Percentage Off (%)' : 'Amount Off ($)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min. Order Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={minInvoiceAmount}
                    onChange={(e) => setMinInvoiceAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                {type === 'percentage' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Max Discount Cap ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Optional cap"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DiscountStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

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
                  disabled={isSubmitting || !code || !name}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingDiscount ? 'Update Coupon' : 'Create Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
