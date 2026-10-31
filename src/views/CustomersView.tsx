import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Layers,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useSubscriptionData } from '../context/SubscriptionDataContext';
import { Customer, ChurnScoreData } from '../types';

interface CustomersViewProps {
  searchTerm: string;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ searchTerm }) => {
  const {
    customers,
    subscriptions,
    invoices,
    payments,
    churnScores,
    addCustomer,
    updateCustomer,
    deleteCustomer
  } = useSubscriptionData();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setAddress('');
    setStatus('active');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setPhone(cust.phone || '');
    setCompany(cust.company || '');
    setAddress(cust.address || '');
    setStatus(cust.status);
    setNotes(cust.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, {
          name,
          email,
          phone,
          company,
          address,
          status,
          notes
        });
      } else {
        await addCustomer({
          name,
          email,
          phone,
          company,
          address,
          status,
          notes
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q)
    );
  });

  // Selected customer details
  const customerSubs = selectedCustomer
    ? subscriptions.filter(s => s.customerId === selectedCustomer.id)
    : [];
  const customerInvoices = selectedCustomer
    ? invoices.filter(i => i.customerId === selectedCustomer.id)
    : [];
  const customerPayments = selectedCustomer
    ? payments.filter(p => p.customerId === selectedCustomer.id)
    : [];
  const customerChurn = selectedCustomer
    ? churnScores.find(cs => cs.customerId === selectedCustomer.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Customer Directory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {customers.length} Accounts
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Accounts contact profiles, subscription history, payment records, and churn risk scoring.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Customer & Company</th>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">Subscriptions</th>
                <th className="py-3.5 px-5">Churn Risk Score</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => {
                  const custSubs = subscriptions.filter(s => s.customerId === cust.id);
                  const churn = churnScores.find(cs => cs.customerId === cust.id);

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomer(cust)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{cust.name}</div>
                        <div className="text-slate-500 font-medium text-[11px] flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{cust.company || 'Individual Account'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="text-slate-800 font-medium flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{cust.email}</span>
                        </div>
                        {cust.phone && (
                          <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{cust.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">
                          {custSubs.filter(s => s.status === 'active').length} Active
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {custSubs.length} total registered
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        {churn ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                churn.riskLevel === 'High'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : churn.riskLevel === 'Medium'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {churn.riskScore}% {churn.riskLevel}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Calculating...</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            cust.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {cust.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${cust.name}?`)) {
                                deleteCustomer(cust.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400">{selectedCustomer.company || 'Customer Account'}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              {/* Churn Risk Gauge Box */}
              {customerChurn && (
                <div className={`p-4 rounded-2xl border ${
                  customerChurn.riskLevel === 'High'
                    ? 'bg-rose-50/70 border-rose-200'
                    : customerChurn.riskLevel === 'Medium'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-emerald-50/70 border-emerald-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className={`w-4 h-4 ${
                        customerChurn.riskLevel === 'High'
                          ? 'text-rose-600'
                          : customerChurn.riskLevel === 'Medium'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`} />
                      <span>Customer Churn Risk Assessment: {customerChurn.riskLevel}</span>
                    </span>
                    <span className="font-mono font-black text-sm">
                      {customerChurn.riskScore}/100
                    </span>
                  </div>
                  <div className="space-y-1">
                    {customerChurn.reasons.map((r, i) => (
                      <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Contact Information</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                    <span className="font-medium text-slate-800">{selectedCustomer.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                    <span className="font-medium text-slate-800">{selectedCustomer.phone || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Billing Address</span>
                    <span className="font-medium text-slate-800">{selectedCustomer.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Subscriptions History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">Subscriptions ({customerSubs.length})</h4>
                </div>

                {customerSubs.length === 0 ? (
                  <p className="text-slate-400">No subscriptions created for this customer.</p>
                ) : (
                  customerSubs.map(sub => (
                    <div key={sub.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{sub.productName}</span>
                        <span className="font-mono font-bold text-slate-900">${sub.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>{sub.planName} • {sub.frequency}</span>
                        <span className="font-medium text-slate-700">Renew: {sub.renewalDate}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Records */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Settled Payments ({customerPayments.length})</h4>
                {customerPayments.length === 0 ? (
                  <p className="text-slate-400">No payment receipts on record.</p>
                ) : (
                  customerPayments.map(p => (
                    <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">${p.amount.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {p.method.toUpperCase()} • Ref: {p.referenceId}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(p.paidAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">
                  {editingCustomer ? 'Edit Customer Account' : 'Add New Customer'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="alex@company.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Cloud Corp."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State, ZIP"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes / Preferences</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Annual consolidated billing"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
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
                  disabled={isSubmitting || !name || !email}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingCustomer ? 'Update Account' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
