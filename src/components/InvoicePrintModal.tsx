import React from 'react';
import { X, Printer, Download, CheckCircle2, AlertCircle, Clock, CreditCard } from 'lucide-react';
import { Invoice } from '../types';

interface InvoicePrintModalProps {
  invoice: Invoice;
  onClose: () => void;
  onPay?: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  onClose,
  onPay,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
        {/* Modal Top Actions (Hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Invoice Preview</span>
            <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-cyan-300">
              {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status !== 'paid' && onPay && (
              <button
                onClick={onPay}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Simulate Pay</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white" id="printable-invoice">
          {/* Header Row */}
          <div className="flex justify-between items-start pb-8 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">BRIGHTLOOP</span>
                <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-500">Subscription Billing & Cloud Services Inc.</p>
              <p className="text-xs text-slate-500">100 Tech Enterprise Blvd, Suite 400</p>
              <p className="text-xs text-slate-500">San Francisco, CA 94105</p>
              <p className="text-xs text-slate-400 mt-1">Tax ID / GSTIN: US-99201-B2B</p>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">INVOICE</h2>
              <div className="text-sm font-mono font-bold text-slate-700 mt-1">{invoice.invoiceNumber}</div>
              <div className="mt-3">
                {invoice.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PAID</span>
                  </span>
                ) : invoice.status === 'overdue' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>OVERDUE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span>UNPAID</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dates & Billed To */}
          <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block mb-1">
                Billed To
              </span>
              <div className="font-bold text-slate-900 text-sm">{invoice.customerName}</div>
              <div className="text-slate-600 mt-0.5">{invoice.customerEmail}</div>
              <div className="text-slate-500 mt-1">ID: {invoice.customerId}</div>
            </div>

            <div className="space-y-1.5 text-right">
              <div>
                <span className="text-slate-500">Issue Date: </span>
                <span className="font-semibold text-slate-800">{invoice.issueDate}</span>
              </div>
              <div>
                <span className="text-slate-500">Due Date: </span>
                <span className="font-semibold text-slate-800">{invoice.dueDate}</span>
              </div>
              <div>
                <span className="text-slate-500">Billing Period: </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {invoice.billingPeriodStart} to {invoice.billingPeriodEnd}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Item & Description</th>
                  <th className="py-2.5 text-center">Qty / Period</th>
                  <th className="py-2.5 text-right">Rate</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3">
                    <div className="font-bold text-slate-900">
                      Subscription Recurring Billing
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {invoice.notes || `Subscription service for period ${invoice.billingPeriodStart} - ${invoice.billingPeriodEnd}`}
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-600">1 Cycle</td>
                  <td className="py-3 text-right font-mono text-slate-700">${invoice.subtotal.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">
                    ${invoice.subtotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="border-t border-slate-200 pt-4 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">${invoice.subtotal.toFixed(2)}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount ({invoice.discountCode || 'Promo'}):</span>
                  <span className="font-mono">-${invoice.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Tax ({invoice.taxRate}% standard):</span>
                <span className="font-mono">${invoice.taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Due:</span>
                <span className="font-mono text-blue-600 text-base">
                  ${invoice.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment receipt confirmation block */}
          {invoice.status === 'paid' && (
            <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Payment Verified & Settled</div>
                <div className="text-emerald-700 mt-0.5">
                  Method: <span className="uppercase font-semibold">{invoice.paymentMethod || 'Online'}</span> • Ref ID: <span className="font-mono font-semibold">{invoice.paymentReferenceId || 'N/A'}</span>
                </div>
                {invoice.paidAt && (
                  <div className="text-[11px] text-emerald-600 mt-0.5">
                    Settled on: {new Date(invoice.paidAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Terms */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Thank you for partnering with BRIGHTLOOP AI. Invoices are automatically generated and linked to your subscription contract terms.
          </div>
        </div>
      </div>
    </div>
  );
};
