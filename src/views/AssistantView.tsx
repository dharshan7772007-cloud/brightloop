import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  User,
  Send,
  Loader2,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useSubscriptionData } from '../context/SubscriptionDataContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  {
    title: 'Revenue & MRR Breakdown',
    query: 'What is our total revenue, current monthly recurring revenue (MRR), and projected ARR?'
  },
  {
    title: 'Unpaid & Overdue Invoices',
    query: 'Which customers have unpaid or overdue invoices, and what are the outstanding balances?'
  },
  {
    title: 'Upcoming Expirations & Renewals',
    query: 'Which subscriptions expire this week, and what action is required?'
  },
  {
    title: 'Top Performing Product',
    query: 'Which product generates the highest revenue, and what are its subscriber metrics?'
  },
  {
    title: 'Customer Churn Risk & Retention',
    query: 'Identify the customers with the highest churn risk score and suggest tactical retention steps.'
  }
];

export const AssistantView: React.FC = () => {
  const { customers, products, plans, subscriptions, invoices, payments, discounts, metrics, churnScores } = useSubscriptionData();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial_welcome',
      sender: 'assistant',
      text: `### Welcome to BRIGHTLOOP AI Intelligence Copilot\n\nI am your strategic revenue and billing assistant powered by **Gemini 3.8 Flash**.\n\nI am actively grounded in your live database:\n- **${subscriptions.length} Total Subscriptions** (${metrics.activeSubscriptions} Active)\n- **$${metrics.mrr.toLocaleString()} MRR** ($${(metrics.mrr * 12).toLocaleString()} projected ARR)\n- **$${metrics.totalRevenue.toLocaleString()} Total Collected Revenue** across ${payments.length} settled payments\n- **${metrics.pendingInvoicesCount} Pending/Overdue Invoices** ($${metrics.pendingInvoicesAmount.toLocaleString()})\n\nSelect a starter analysis below or ask any custom financial question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const contextData = {
        metrics,
        summary: {
          totalRevenue: metrics.totalRevenue,
          mrr: metrics.mrr,
          activeSubscriptions: metrics.activeSubscriptions,
          expiredSubscriptions: metrics.expiredSubscriptions,
          pendingInvoicesCount: metrics.pendingInvoicesCount,
          pendingInvoicesAmount: metrics.pendingInvoicesAmount,
          churnRateEstimate: metrics.churnRateEstimate
        },
        customers: customers.map(c => ({
          id: c.id,
          name: c.name,
          company: c.company,
          status: c.status
        })),
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price
        })),
        subscriptions: subscriptions.map(s => ({
          subscriptionNumber: s.subscriptionNumber,
          customerName: s.customerName,
          productName: s.productName,
          frequency: s.frequency,
          amount: s.amount,
          status: s.status,
          renewalDate: s.renewalDate
        })),
        invoices: invoices.map(i => ({
          invoiceNumber: i.invoiceNumber,
          customerName: i.customerName,
          totalAmount: i.totalAmount,
          status: i.status,
          dueDate: i.dueDate
        })),
        payments: payments.map(p => ({
          paymentNumber: p.paymentNumber,
          customerName: p.customerName,
          amount: p.amount,
          method: p.method,
          status: p.status,
          paidAt: p.paidAt
        })),
        churnScores: churnScores.slice(0, 5)
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

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Error:** ${err.message || 'Unable to connect with Gemini AI.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>AI Business Assistant</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-500" />
              <span>Gemini 3.8 Flash</span>
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Grounded intelligence assistant capable of querying, calculating, and analyzing your live subscription database.
          </p>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome_reset',
                sender: 'assistant',
                text: 'Conversation history reset. How can I assist your subscription operations today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Thread</span>
        </button>
      </div>

      {/* Starter Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STARTER_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt.query)}
            disabled={isLoading}
            className="p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-xs text-left transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {prompt.title}
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
              {prompt.query}
            </p>
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[560px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shrink-0 shadow-md">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-300">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-50 border border-slate-200/90 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-1.5 font-normal">
                  {msg.text.split('\n').map((line, i) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={i} className="font-black text-sm text-slate-900 mt-2 mb-1">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <strong key={i} className="font-bold text-slate-900 block mt-1">{line.replace(/\*\*/g, '')}</strong>;
                    }
                    return <div key={i}>{line}</div>;
                  })}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/40 flex items-center justify-between text-[10px]">
                  <span className={msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}>
                    {msg.timestamp}
                  </span>

                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => copyMessage(msg.id, msg.text)}
                      className="text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shrink-0 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Gemini 3.8 Flash is analyzing live platform metrics and records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
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
              placeholder="Ask anything (e.g. Which product generates the highest revenue?)"
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs disabled:opacity-40 transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
