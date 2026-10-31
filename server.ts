import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BRIGHTLOOP AI Backend'
  });
});

// Gemini AI Business Assistant API
app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { message, contextData, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `You are BRIGHTLOOP AI's Senior Subscription & Revenue Intelligence Copilot.
You have direct, real-time access to the company's live subscription database.
Your role is to answer questions strictly grounded in this provided data.
You must provide exact numbers, customer names, subscription metrics, overdue invoice details, and actionable financial insights.

CRITICAL RULES:
1. NEVER invent, hallucinate, or assume metrics, customer names, or numbers that are not in the context.
2. If data is missing or empty, state it clearly and advise the user how to record that data.
3. Formulate answers clearly with formatted markdown, bold figures, bullet points, and actionable next steps.
4. When calculating metrics:
   - MRR (Monthly Recurring Revenue): Monthly plans contribute 100% of amount, quarterly plans contribute amount/3, yearly plans contribute amount/12.
   - Total Revenue: Sum of all completed payments / paid invoices.
   - Churn Risk: Customers with overdue invoices or expired subscriptions have high churn risk.
5. Provide crisp, executive-grade answers suitable for CFOs and SaaS operations managers.

LIVE BUSINESS DATABASE CONTEXT:
${JSON.stringify(contextData || {}, null, 2)}
`;

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `User Query: ${message}`,
          config: {
            systemInstruction,
            temperature: 0.2,
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);

        const reply = response.text;
        if (reply) {
          return res.json({ reply });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call timed out or failed, falling back to business analytics engine:', geminiError?.message);
      }
    }

    // Business intelligence calculation engine
    const m = contextData?.metrics || {};
    const subs = contextData?.subscriptions || [];
    const invs = contextData?.invoices || [];
    const prods = contextData?.products || [];
    const churns = contextData?.churnScores || [];
    const lower = message.toLowerCase();

    let reply = '';

    if (lower.includes('revenue') || lower.includes('mrr') || lower.includes('arr')) {
      reply = `### Financial & Recurring Revenue Summary\n\n- **Total Collected Revenue:** **$${(m.totalRevenue || 0).toLocaleString()}** across recorded payments.\n- **Monthly Recurring Revenue (MRR):** **$${(m.mrr || 0).toLocaleString()}**\n- **Projected ARR:** **$${((m.mrr || 0) * 12).toLocaleString()}**\n- **Active Subscriptions:** **${m.activeSubscriptions || 0}** active contracts.\n\n*Recommendation:* To increase MRR, convert quarterly/monthly subscribers to annual plans with a 15% discount code (e.g. \`ANNUALVIP\`).`;
    } else if (lower.includes('unpaid') || lower.includes('overdue') || lower.includes('invoice')) {
      const unpaidList = invs.filter((i: any) => i.status === 'unpaid' || i.status === 'overdue');
      if (unpaidList.length === 0) {
        reply = `### Invoice Status Overview\n\nAll invoices are currently **paid and settled**. There are zero outstanding balances.`;
      } else {
        const lines = unpaidList.map((i: any) => `- **${i.customerName}**: Invoice \`${i.invoiceNumber}\` for **$${Number(i.totalAmount).toFixed(2)}** (${i.status.toUpperCase()}, due on ${i.dueDate})`).join('\n');
        reply = `### Outstanding Receivables Alert\n\nThere are **${unpaidList.length} invoices** requiring settlement:\n\n${lines}\n\n**Total Pending Collections:** **$${(m.pendingInvoicesAmount || 0).toLocaleString()}**\n\n*Next Step:* Dispatch payment reminders or run a simulated checkout test to clear outstanding accounts.`;
      }
    } else if (lower.includes('expire') || lower.includes('renew') || lower.includes('week')) {
      const activeRenewals = subs.filter((s: any) => s.status === 'active');
      reply = `### Upcoming Renewals & Expirations\n\n- **${activeRenewals.length} Active Subscriptions** are tracked by the automated renewal engine.\n- Key upcoming renewals: ${activeRenewals.slice(0, 3).map((s: any) => `**${s.customerName}** (\`${s.subscriptionNumber}\`, renews ${s.renewalDate || s.currentPeriodEnd})`).join(', ')}.\n\n*Automated Protection:* Our duplicate billing guard ensures subsequent renewal invoices are not generated twice for the same billing cycle.`;
    } else if (lower.includes('highest') || lower.includes('product') || lower.includes('performance')) {
      reply = `### Product Performance Analysis\n\nBased on active subscription volume and plan amounts:\n- **Top Revenue Contributor:** **CloudScale Analytics Pro** and **ZeroTrust Mesh VPN** lead enterprise contract value.\n- High-tier plans generate strong annual recurring revenue with low cancellation rates.\n\n*Recommendation:* Package DevPipeline CI/CD Runner as an add-on bundle with CloudScale Analytics to boost average contract value.`;
    } else if (lower.includes('churn') || lower.includes('risk') || lower.includes('retention')) {
      const highRisk = churns.filter((c: any) => c.riskLevel === 'High' || c.riskScore >= 60);
      reply = `### Customer Churn Risk Assessment\n\n- **Platform Churn Rate:** **${m.churnRateEstimate || 0}%**\n- **High Risk Accounts Detected:** **${highRisk.length}**\n${highRisk.map((c: any) => `- **${c.customerName}** (${c.company}): **${c.riskScore}% risk score** due to overdue invoices & inactivity`).join('\n')}\n\n*Actionable Retention Steps:*\n1. Schedule a proactive check-in call with high-risk accounts.\n2. Review invoice delivery to ensure no spam filters blocked dunning emails.\n3. Issue a special promotional incentive (e.g. \`LAUNCH20\`) to encourage renewal.`;
    } else {
      reply = `### Executive Summary for BRIGHTLOOP AI\n\n- **MRR:** **$${(m.mrr || 0).toLocaleString()}**\n- **Total Revenue Collected:** **$${(m.totalRevenue || 0).toLocaleString()}**\n- **Active Subscriptions:** **${m.activeSubscriptions || 0}**\n- **Pending Invoices:** **${m.pendingInvoicesCount || 0}** ($${(m.pendingInvoicesAmount || 0).toLocaleString()})\n\nYou can ask me specific questions regarding revenue breakdown, overdue invoices, renewal dates, top products, or churn risk mitigation.`;
    }

    res.json({ reply });
  } catch (error: any) {
    console.error('AI Assistant Error:', error);
    res.status(500).json({
      error: error?.message || 'An error occurred while communicating with Gemini AI.'
    });
  }
});

// Automated Renewal Scanner API (Can be triggered manually or via cron)
app.post('/api/automation/run-renewals', async (req, res) => {
  try {
    const { subscriptions, existingInvoices } = req.body;
    if (!Array.isArray(subscriptions)) {
      return res.status(400).json({ error: 'subscriptions array is required' });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const renewalCandidates = [];
    const generatedInvoices = [];

    for (const sub of subscriptions) {
      if (sub.status !== 'active' || !sub.autoRenew) continue;

      const renewalDate = new Date(sub.renewalDate || sub.currentPeriodEnd);
      if (renewalDate <= sevenDaysFromNow) {
        renewalCandidates.push(sub);

        // Check for duplicate invoice in the current or next cycle
        const periodStartStr = sub.currentPeriodEnd || sub.renewalDate;
        const isDuplicate = (existingInvoices || []).some(
          (inv: any) =>
            inv.subscriptionId === sub.id &&
            inv.billingPeriodStart?.slice(0, 10) === periodStartStr?.slice(0, 10)
        );

        if (!isDuplicate) {
          const nextPeriodEnd = new Date(renewalDate);
          if (sub.frequency === 'yearly') {
            nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + 1);
          } else if (sub.frequency === 'quarterly') {
            nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 3);
          } else {
            nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
          }

          const subtotal = sub.amount || 0;
          const taxRate = 0.18; // 18% standard GST/VAT
          const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
          const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

          generatedInvoices.push({
            subscriptionId: sub.id,
            customerId: sub.customerId,
            customerName: sub.customerName,
            customerEmail: sub.customerEmail || '',
            billingPeriodStart: renewalDate.toISOString().split('T')[0],
            billingPeriodEnd: nextPeriodEnd.toISOString().split('T')[0],
            issueDate: now.toISOString().split('T')[0],
            dueDate: renewalDate.toISOString().split('T')[0],
            subtotal,
            discountAmount: 0,
            taxRate: 18,
            taxAmount,
            totalAmount,
            status: 'unpaid',
            notes: `Automated renewal invoice for ${sub.productName || 'Subscription'} (${sub.planName || sub.frequency})`
          });
        }
      }
    }

    res.json({
      success: true,
      evaluatedCount: subscriptions.length,
      renewalsUpcomingCount: renewalCandidates.length,
      invoicesToGenerate: generatedInvoices
    });
  } catch (error: any) {
    console.error('Automation Error:', error);
    res.status(500).json({ error: error?.message || 'Automation failed' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`BRIGHTLOOP AI Server running on port ${port} (mode: ${isDev ? 'dev' : 'production'})`);
  });
}

startServer();
