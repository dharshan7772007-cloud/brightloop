import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useSubscriptionData } from '../context/SubscriptionDataContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_QUERIES = [
  'What is our total revenue & monthly recurring revenue (MRR)?',
  'Which customers have unpaid or overdue invoices?',
  'Which subscriptions expire this week or need renewal?',
  'Which product generates the highest revenue?',
  'What is our customer churn risk analysis & recommendations?'
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const { customers, products, plans, subscriptions, invoices, payments, discounts, metrics, churnScores } = useSubscriptionData();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **BRIGHTLOOP AI Intelligence Copilot** powered by **Gemini 3.8 Flash**.\n\nI have direct access to your live database:\n- **${subscriptions.length} Subscriptions** ($${metrics.mrr.toLocaleString()} MRR)\n- **${customers.length} Customers**\n- **${invoices.length} Invoices** (${metrics.pendingInvoicesCount} pending)\n- **${payments.length} Recorded Payments** ($${metrics.totalRevenue.toLocaleString()} Total Revenue)\n\nAsk me any question about your revenue, upcoming renewals, highest earning products, or churn risks!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build lightweight, high-fidelity context for Gemini
      const contextData = {
        metrics,
        summary: {
          totalRevenue: metrics.totalRevenue,
          mrr: metrics.mrr,
          activeSubscriptions: metrics.activeSubscriptions,
          expiredSubscriptions: metrics.expiredSubscriptions,
          pendingInvoicesCount: metrics.pendingInvoicesCount,
          pendingInvoicesAmount: metrics.pendingInvoicesAmount,
        },
        customers: customers.map((c) => ({
          id: c.id,
          name: c.name,
          company: c.company,
          status: c.status
        })),
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price
        })),
        subscriptions: subscriptions.map((s) => ({
          subscriptionNumber: s.subscriptionNumber,
          customerName: s.customerName,
          productName: s.productName,
          frequency: s.frequency,
          amount: s.amount,
          status: s.status,
          renewalDate: s.renewalDate,
          currentPeriodEnd: s.currentPeriodEnd
        })),
        invoices: invoices.map((i) => ({
          invoiceNumber: i.invoiceNumber,
          customerName: i.customerName,
          totalAmount: i.totalAmount,
          status: i.status,
          dueDate: i.dueDate
        })),
        payments: payments.map((p) => ({
          paymentNumber: p.paymentNumber,
          customerName: p.customerName,
          amount: p.amount,
          method: p.method,
          status: p.status,
          paidAt: p.paidAt
        })),
        churnRiskAlerts: churnScores.slice(0, 5)
      };

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          contextData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to receive response from Gemini AI.');
      }

      const assistantMsg: Message = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI Assistant Error:', err);
      const errMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Error:** ${err.message || 'Unable to communicate with Gemini AI. Please check server logs.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      {/* Slide-over panel */}
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">BRIGHTLOOP Intelligence</h3>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Grounded in Live Platform Data</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Quick Prompts:
          </span>
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full border border-slate-200 shrink-0 shadow-2xs transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                {/* Format markdown simple bullets and boldings */}
                <div className="whitespace-pre-wrap space-y-1">
                  {msg.text.split('\n').map((line, i) => {
                    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
                    return (
                      <div key={i} className={isBullet ? 'pl-2 text-slate-700' : ''}>
                        {line}
                      </div>
                    );
                  })}
                </div>
                <div
                  className={`text-[9px] mt-2 font-mono ${
                    msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400 text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Gemini is analyzing your subscription database...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about revenue, subscriptions, churn..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-center text-slate-400 mt-2">
            Answers are calculated directly from your real Firestore collection records.
          </div>
        </div>
      </div>
    </div>
  );
};
