import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Invoice, PaymentMethod } from '../types';
import { useSubscriptionData } from '../context/SubscriptionDataContext';

interface SimulatedCheckoutModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SimulatedCheckoutModal: React.FC<SimulatedCheckoutModalProps> = ({
  invoice,
  onClose,
  onSuccess,
}) => {
  const { recordPayment } = useSubscriptionData();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState(invoice.customerName);

  const [upiId, setUpiId] = useState(`${invoice.customerName.toLowerCase().replace(/\s+/g, '')}@upi`);
  const [selectedBank, setSelectedBank] = useState('Silicon Valley Bank');
  const [customRef, setCustomRef] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [generatedReceiptId, setGeneratedReceiptId] = useState<string>('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStep('processing');

    // Simulate network delay for realistic gateway behavior
    setTimeout(async () => {
      try {
        let referenceId = '';
        if (paymentMethod === 'upi') {
          referenceId = `UPI_SIM_${Math.floor(10000000 + Math.random() * 90000000)}`;
        } else if (paymentMethod === 'card') {
          referenceId = `CARD_SIM_${Math.floor(10000000 + Math.random() * 90000000)}`;
        } else if (paymentMethod === 'net_banking') {
          referenceId = `NETB_SIM_${Math.floor(10000000 + Math.random() * 90000000)}`;
        } else {
          referenceId = customRef || `CASH_REF_${Math.floor(100000 + Math.random() * 900000)}`;
        }

        const payId = await recordPayment({
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          method: paymentMethod,
          referenceId,
          isSimulated: true
        });

        setGeneratedReceiptId(payId);
        setStep('success');
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error('Simulated checkout failed:', err);
        setStep('form');
      } finally {
        setIsProcessing(false);
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Sandbox Notice Banner */}
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
            <span>SIMULATED CHECKOUT GATEWAY (TEST MODE - NO ACTUAL MONEY CHARGED)</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-950 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Authorizing Payment...</h3>
              <p className="text-xs text-slate-500 mt-1">
                Simulating banking gateway handshake and updating invoice status in Firestore...
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Payment Completed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Invoice <span className="font-semibold text-slate-800">{invoice.invoiceNumber}</span> is now marked as <strong>PAID</strong>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid:</span>
                <span className="font-bold text-slate-900">${invoice.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <span className="font-semibold text-slate-800">{invoice.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="font-semibold uppercase text-slate-800">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Transaction Status:</span>
                <span className="text-emerald-600 font-bold">Simulated Success</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Close & Return to Dashboard
            </button>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handlePay} className="p-6 space-y-5">
            {/* Invoice Header Details */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Paying Invoice
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">{invoice.invoiceNumber}</h3>
                <p className="text-xs text-slate-500">{invoice.customerName} • {invoice.customerEmail}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Due
                </span>
                <div className="text-2xl font-black text-blue-600">
                  ${invoice.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'upi', label: 'UPI / QR', icon: QrCode },
                  { id: 'net_banking', label: 'Net Banking', icon: Building2 },
                  { id: 'cash', label: 'Cash / Wire', icon: Banknote },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSel
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1.5" />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method Inputs */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card Number (Simulated)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      required
                      maxLength={4}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-white p-2 rounded-xl border border-slate-200 shrink-0 flex items-center justify-center shadow-xs">
                    <QrCode className="w-20 h-20 text-slate-800" />
                  </div>
                  <div className="text-xs text-slate-600">
                    <div className="font-bold text-slate-900 mb-1">Scan QR or enter UPI VPA</div>
                    <p className="text-[11px] text-slate-500 mb-2">Supported apps: Google Pay, PhonePe, Paytm, BHIM</p>
                    <div className="inline-block bg-white px-2 py-1 rounded text-[10px] font-mono border border-slate-200">
                      brightloop@mockupi
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Customer VPA / UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'net_banking' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="Silicon Valley Bank">Silicon Valley Bank (SVB)</option>
                    <option value="JPMorgan Chase">JPMorgan Chase</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="HSBC Commercial">HSBC Commercial</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-500">
                  You will be securely redirected to the simulated bank gateway authorization flow.
                </p>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Receipt / Cheque / Wire Reference ID
                  </label>
                  <input
                    type="text"
                    value={customRef}
                    onChange={(e) => setCustomRef(e.target.value)}
                    placeholder="e.g. CHQ-2026-9901 or WIRE-44810"
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Record an offline manual payment verified by your accounts receivable department.
                </p>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="text-xs text-slate-500 space-y-1.5 pt-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({invoice.discountCode || 'Applied'}):</span>
                  <span>-${invoice.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>${invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-100">
                <span>Total Charge:</span>
                <span className="text-blue-600">${invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-cyan-300" />
              <span>Simulate Payment of ${invoice.totalAmount.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
