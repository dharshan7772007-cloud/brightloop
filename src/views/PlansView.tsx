import React, { useState } from 'react';
import {
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  X,
  Package,
  Calendar
} from 'lucide-react';
import { useSubscriptionData } from '../context/SubscriptionDataContext';
import { Plan, FrequencyType } from '../types';

interface PlansViewProps {
  searchTerm: string;
}

export const PlansView: React.FC<PlansViewProps> = ({ searchTerm }) => {
  const { plans, products, addPlan, updatePlan, deletePlan, subscriptions } = useSubscriptionData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('monthly');
  const [price, setPrice] = useState<number>(99);
  const [trialDays, setTrialDays] = useState<number>(14);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingPlan(null);
    setName('');
    setDescription('');
    setProductId(products[0]?.id || '');
    setFrequency('monthly');
    setPrice(99);
    setTrialDays(14);
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description);
    setProductId(plan.productId);
    setFrequency(plan.frequency);
    setPrice(plan.price);
    setTrialDays(plan.trialDays);
    setStatus(plan.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !productId) return;

    setIsSubmitting(true);
    try {
      const prod = products.find(p => p.id === productId);
      const productName = prod ? prod.name : 'Platform Product';

      if (editingPlan) {
        await updatePlan(editingPlan.id, {
          name,
          description,
          productId,
          productName,
          frequency,
          price,
          currency: 'USD',
          trialDays,
          status
        });
      } else {
        await addPlan({
          name,
          description,
          productId,
          productName,
          frequency,
          price,
          currency: 'USD',
          trialDays,
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

  const filteredPlans = plans.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.productName.toLowerCase().includes(q) ||
      p.frequency.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Subscription Billing Plans</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {plans.length} Configured
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure recurring cadences (monthly, quarterly, yearly), trial windows, and automated invoicing rates.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
            No plans found matching search.
          </div>
        ) : (
          filteredPlans.map(plan => {
            const activeSubs = subscriptions.filter(s => s.planId === plan.id && s.status === 'active').length;

            return (
              <div
                key={plan.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Frequency Badge Pill */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {plan.frequency}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-2">{plan.name}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>{plan.productName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete plan ${plan.name}?`)) {
                          deletePlan(plan.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4">{plan.description}</p>

                {/* Price Display */}
                <div className="py-4 border-y border-slate-100 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900">${plan.price}</span>
                  <span className="text-xs text-slate-400 font-medium">/ {plan.frequency}</span>
                </div>

                {/* Trial & Subscribers Count */}
                <div className="py-3 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{plan.trialDays > 0 ? `${plan.trialDays}-day free trial` : 'No trial'}</span>
                  </span>
                  <span className="font-semibold text-slate-900">
                    {activeSubs} subscribers
                  </span>
                </div>

                {/* Status Toggle Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Status</span>
                  <span
                    className={`font-bold uppercase px-2 py-0.5 rounded-full text-[10px] ${
                      plan.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {plan.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">
                  {editingPlan ? 'Edit Plan' : 'Create Subscription Plan'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Association *</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="">Select Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plan Display Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Enterprise Annual (20% Off)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Frequency *</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly (3 Months)</option>
                    <option value="yearly">Yearly (Annual)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price per Cadence ($) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trial Period (Days)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={trialDays}
                    onChange={(e) => setTrialDays(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plan Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Highlights for customer invoice and marketing cards..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
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
                  disabled={isSubmitting || !name || !productId}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
