import React, { useState } from 'react';
import {
  Zap,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useSubscriptionData } from '../context/SubscriptionDataContext';

export const AutomationView: React.FC = () => {
  const { subscriptions, invoices, runRenewalAutomation, generateInvoiceFromSubscription } = useSubscriptionData();

  const [isRunning, setIsRunning] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    renewalsDetected: number;
    invoicesGenerated: number;
  } | null>(null);

  const [testSubId, setTestSubId] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const now = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(now.getDate() + 7);

  // Subscriptions eligible for renewal within 7 days
  const upcomingRenewals = subscriptions.filter(sub => {
    if (sub.status !== 'active') return false;
    const renDate = new Date(sub.renewalDate || sub.currentPeriodEnd);
    return renDate <= sevenDaysLater;
  });

  const handleRunRenewalAudit = async () => {
    setIsRunning(true);
    setAuditResult(null);
    try {
      const res = await runRenewalAutomation();
      setAuditResult(res);
    } catch (err: any) {
      alert(`Error during renewal audit: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleTestGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSubId) return;

    try {
      const res = await generateInvoiceFromSubscription(testSubId);
      const sub = subscriptions.find(s => s.id === testSubId);
      setTestResult(`Successfully processed ${sub?.subscriptionNumber}. Invoice ID: ${res}`);
    } catch (err: any) {
      setTestResult(`Notice: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Automated Renewal & Invoicing Engine</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Daemon Active</span>
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated renewal detection, in-app notifications, and strict duplicate billing prevention.
          </p>
        </div>

        <button
          onClick={handleRunRenewalAudit}
          disabled={isRunning}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 self-start sm:self-auto"
        >
          <RotateCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Auditing Platform...' : 'Execute Renewal Audit Now'}</span>
        </button>
      </div>

      {/* Engine Status & Safeguards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Duplicate Guard</span>
          </div>
          <div className="text-lg font-black text-slate-900">Enforced Active</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Matches subscription ID + billing period timestamp to prevent duplicate invoices for the same cycle.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs mb-1">
            <Clock className="w-4 h-4" />
            <span>Renewal Window</span>
          </div>
          <div className="text-lg font-black text-slate-900">7-Day Lookahead</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Scans active subscriptions expiring within 7 days and prepares draft recurring invoices.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>In-App Notifications</span>
          </div>
          <div className="text-lg font-black text-slate-900">Real-Time Sync</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Dispatches automated alerts to dashboard header and audit ledger upon every cycle run.
          </p>
        </div>
      </div>

      {/* Audit Result Alert Banner */}
      {auditResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Automated Renewal Scan Finished Successfully</div>
            <p className="text-emerald-700 mt-0.5">
              Identified <strong>{auditResult.renewalsDetected}</strong> upcoming renewals.
              Generated <strong>{auditResult.invoicesGenerated}</strong> new invoice(s).
              Duplicate prevention checked against {invoices.length} existing billing documents.
            </p>
          </div>
        </div>
      )}

      {/* Upcoming Renewals Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Subscriptions Due for Renewal (7-Day Horizon)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeted recurring accounts analyzed by the automation daemon.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {upcomingRenewals.length} Candidate(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Subscription</th>
                <th className="py-3.5 px-5">Customer Account</th>
                <th className="py-3.5 px-5">Plan Cadence</th>
                <th className="py-3.5 px-5">Cycle Amount</th>
                <th className="py-3.5 px-5">Renewal Date</th>
                <th className="py-3.5 px-5">Duplicate Guard Status</th>
                <th className="py-3.5 px-5 text-right">Manual Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingRenewals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No active subscriptions are due for renewal in the next 7 days.
                  </td>
                </tr>
              ) : (
                upcomingRenewals.map(sub => {
                  const hasExistingInvoice = invoices.some(
                    inv => inv.subscriptionId === sub.id &&
                           inv.billingPeriodStart?.slice(0, 10) === sub.currentPeriodStart?.slice(0, 10)
                  );

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
                        <span className="font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {sub.frequency}
                        </span>
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-900 text-sm">
                        ${sub.amount.toFixed(2)}
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-700">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{sub.renewalDate || sub.currentPeriodEnd}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        {hasExistingInvoice ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 text-blue-500" />
                            <span>Invoice Already Issued (Duplicate Protected)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>Invoice Generation Due</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => generateInvoiceFromSubscription(sub.id)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Generate Test Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Test Invoicing Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Test Subscription Renewal Engine
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Select any active subscription to test invoice creation and verify that the duplicate-prevention mechanism triggers appropriately.
        </p>

        <form onSubmit={handleTestGenerateInvoice} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={testSubId}
            onChange={(e) => setTestSubId(e.target.value)}
            required
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="">Select an Active Subscription to Test...</option>
            {subscriptions.filter(s => s.status === 'active').map(s => (
              <option key={s.id} value={s.id}>
                {s.subscriptionNumber} - {s.customerName} ({s.productName} - ${s.amount})
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
          >
            Run Test Generation
          </button>
        </form>

        {testResult && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{testResult}</span>
          </div>
        )}
      </div>
    </div>
  );
};
