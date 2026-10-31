import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, testConnection } from '../lib/firebase';
import {
  Customer,
  Product,
  Plan,
  Subscription,
  Invoice,
  Payment,
  Discount,
  NotificationItem,
  DashboardMetrics,
  ChurnScoreData,
  PaymentMethod
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_DISCOUNTS,
  INITIAL_NOTIFICATIONS
} from '../lib/sampleData';

interface SubscriptionContextType {
  // Collections
  customers: Customer[];
  products: Product[];
  plans: Plan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  discounts: Discount[];
  notifications: NotificationItem[];
  isLoading: boolean;
  isSeeding: boolean;
  firestoreConnected: boolean;

  // Metrics & Intelligence
  metrics: DashboardMetrics;
  churnScores: ChurnScoreData[];

  // Customer actions
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Product actions
  addProduct: (prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Plan actions
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePlan: (id: string, updates: Partial<Plan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;

  // Subscription actions
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'subscriptionNumber'>) => Promise<string>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  pauseSubscription: (id: string) => Promise<void>;
  resumeSubscription: (id: string) => Promise<void>;
  cancelSubscription: (id: string) => Promise<void>;
  renewSubscription: (id: string) => Promise<void>;

  // Invoice actions
  addInvoice: (inv: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>) => Promise<string>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  generateInvoiceFromSubscription: (subscriptionId: string) => Promise<string | null>;

  // Payment actions
  recordPayment: (params: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    referenceId?: string;
    isSimulated?: boolean;
  }) => Promise<string>;

  // Discount actions
  addDiscount: (disc: Omit<Discount, 'id' | 'createdAt' | 'usedCount'>) => Promise<string>;
  updateDiscount: (id: string, updates: Partial<Discount>) => Promise<void>;
  deleteDiscount: (id: string) => Promise<void>;
  validateDiscount: (code: string, subtotal: number) => { valid: boolean; discountAmount: number; message: string; discount?: Discount };

  // Automation actions
  runRenewalAutomation: () => Promise<{ renewalsDetected: number; invoicesGenerated: number }>;

  // Notification actions
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Utility
  seedSampleData: (force?: boolean) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(true);

  // Initialize and check Firestore connection
  useEffect(() => {
    testConnection().then(connected => {
      setFirestoreConnected(connected);
    });
  }, []);

  // Listen to Firestore real-time collections
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    try {
      const unsubCustomers = onSnapshot(
        collection(db, 'customers'),
        (snap) => {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Customer));
          setCustomers(list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'customers')
      );
      unsubs.push(unsubCustomers);

      const unsubProducts = onSnapshot(
        collection(db, 'products'),
        (snap) => {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
          setProducts(list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'products')
      );
      unsubs.push(unsubProducts);

      const unsubPlans = onSnapshot(
        collection(db, 'plans'),
        (snap) => {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Plan));
          setPlans(list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'plans')
      );
      unsubs.push(unsubPlans);

      const unsubSubs = onSnapshot(
        collection(db, 'subscriptions'),
        (snap) => {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Subscription));
          setSubscriptions(list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'subscriptions')
      );
      unsubs.push(unsubSubs);

      const unsubInvoices = onSnapshot(
        collection(db, 'invoices'),
        (snap) => {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Invoice));
          setInvoices(list.sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || '')));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'invoices')
      );
      unsubs.push(unsubInvoices);

      const unsubPayments = onSnapshot(
        collection(db, 'payments'),
        (snap) => {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Payment));
          setPayments(list.sort((a, b) => (b.paidAt || '').localeCompare(a.paidAt || '')));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'payments')
      );
      unsubs.push(unsubPayments);

      const unsubDiscounts = onSnapshot(
        collection(db, 'discounts'),
        (snap) => {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Discount));
          setDiscounts(list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'discounts')
      );
      unsubs.push(unsubDiscounts);

      const unsubNotifs = onSnapshot(
        collection(db, 'notifications'),
        (snap) => {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as NotificationItem));
          setNotifications(list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
      );
      unsubs.push(unsubNotifs);

    } catch (err) {
      console.error('Error attaching Firestore listeners:', err);
    } finally {
      setIsLoading(false);
    }

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  // Check if initial seeding is needed once connected
  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const custSnap = await getDocs(collection(db, 'customers'));
        if (custSnap.empty) {
          console.log('Database empty, performing initial seed...');
          await seedSampleData(false);
        }
      } catch (e) {
        console.warn('Initial seeding check skipped (may be unauthenticated or offline):', e);
      }
    };
    checkAndSeed();
  }, []);

  // Seed sample database
  const seedSampleData = useCallback(async (force = false) => {
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);

      // Seed Customers
      INITIAL_CUSTOMERS.forEach(cust => {
        batch.set(doc(db, 'customers', cust.id), cust);
      });

      // Seed Products
      INITIAL_PRODUCTS.forEach(prod => {
        batch.set(doc(db, 'products', prod.id), prod);
      });

      // Seed Plans
      INITIAL_PLANS.forEach(plan => {
        batch.set(doc(db, 'plans', plan.id), plan);
      });

      // Seed Subscriptions
      INITIAL_SUBSCRIPTIONS.forEach(sub => {
        batch.set(doc(db, 'subscriptions', sub.id), sub);
      });

      // Seed Invoices
      INITIAL_INVOICES.forEach(inv => {
        batch.set(doc(db, 'invoices', inv.id), inv);
      });

      // Seed Payments
      INITIAL_PAYMENTS.forEach(pay => {
        batch.set(doc(db, 'payments', pay.id), pay);
      });

      // Seed Discounts
      INITIAL_DISCOUNTS.forEach(disc => {
        batch.set(doc(db, 'discounts', disc.id), disc);
      });

      // Seed Notifications
      INITIAL_NOTIFICATIONS.forEach(notif => {
        batch.set(doc(db, 'notifications', notif.id), notif);
      });

      await batch.commit();
      console.log('Sample database successfully seeded!');
    } catch (err) {
      console.error('Failed to seed sample data:', err);
    } finally {
      setIsSeeding(false);
    }
  }, []);

  // Compute calculated Dashboard Metrics
  const metrics = useMemo<DashboardMetrics>(() => {
    // Total Revenue from completed payments
    const totalRev = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Monthly Recurring Revenue (MRR) from active subscriptions
    const mrrTotal = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const amt = s.amount || 0;
        if (s.frequency === 'yearly') return sum + amt / 12;
        if (s.frequency === 'quarterly') return sum + amt / 3;
        return sum + amt;
      }, 0);

    const activeSubs = subscriptions.filter(s => s.status === 'active').length;
    const expiredSubs = subscriptions.filter(s => s.status === 'expired' || s.status === 'cancelled').length;

    const pendingInvs = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
    const pendingInvoicesCount = pendingInvs.length;
    const pendingInvoicesAmount = pendingInvs.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

    const totalCusts = customers.length;
    const churnRate = totalCusts > 0 ? (expiredSubs / (activeSubs + expiredSubs || 1)) * 100 : 0;

    return {
      totalRevenue: Math.round(totalRev * 100) / 100,
      mrr: Math.round(mrrTotal * 100) / 100,
      totalCustomers: totalCusts,
      activeSubscriptions: activeSubs,
      expiredSubscriptions: expiredSubs,
      pendingInvoicesCount,
      pendingInvoicesAmount: Math.round(pendingInvoicesAmount * 100) / 100,
      churnRateEstimate: Math.round(churnRate * 10) / 10
    };
  }, [customers, subscriptions, invoices, payments]);

  // Compute Rule-Based Customer Churn Risk Scores
  const churnScores = useMemo<ChurnScoreData[]>(() => {
    return customers.map(cust => {
      const custSubs = subscriptions.filter(s => s.customerId === cust.id);
      const custInvoices = invoices.filter(i => i.customerId === cust.id);
      const custPayments = payments.filter(p => p.customerId === cust.id && p.status === 'completed');

      const activeSubsCount = custSubs.filter(s => s.status === 'active').length;
      const overdueCount = custInvoices.filter(i => i.status === 'overdue').length;
      const unpaidCount = custInvoices.filter(i => i.status === 'unpaid').length;
      const cancelledOrExpiredCount = custSubs.filter(s => s.status === 'cancelled' || s.status === 'expired').length;

      let score = 10; // baseline low risk
      const reasons: string[] = [];

      if (cust.status === 'inactive') {
        score += 35;
        reasons.push('Customer profile marked inactive');
      }

      if (overdueCount > 0) {
        score += 35 * overdueCount;
        reasons.push(`${overdueCount} overdue invoice(s) pending payment`);
      }

      if (unpaidCount > 1) {
        score += 15;
        reasons.push('Multiple unpaid invoices currently open');
      }

      if (activeSubsCount === 0 && custSubs.length > 0) {
        score += 30;
        reasons.push('No active subscriptions remaining');
      }

      if (cancelledOrExpiredCount > 0) {
        score += 15;
        reasons.push('Has previous cancelled or expired plans');
      }

      // Check last payment recency
      const lastPayment = custPayments.sort((a, b) => b.paidAt.localeCompare(a.paidAt))[0];
      if (lastPayment) {
        const lastPayDate = new Date(lastPayment.paidAt);
        const daysSinceLastPay = (Date.now() - lastPayDate.getTime()) / (1000 * 3600 * 24);
        if (daysSinceLastPay > 60 && activeSubsCount > 0) {
          score += 15;
          reasons.push('No payments recorded in last 60 days');
        }
      } else if (custSubs.length > 0) {
        score += 20;
        reasons.push('Zero completed payments on record');
      }

      score = Math.min(Math.max(score, 5), 98);
      const riskLevel: 'Low' | 'Medium' | 'High' = score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low';

      return {
        customerId: cust.id,
        customerName: cust.name,
        company: cust.company,
        riskScore: score,
        riskLevel,
        activeSubscriptionsCount: activeSubsCount,
        unpaidInvoicesCount: overdueCount + unpaidCount,
        lastPaymentDate: lastPayment?.paidAt,
        reasons: reasons.length ? reasons : ['Account in good standing with on-time payments']
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [customers, subscriptions, invoices, payments]);

  // CRUD for Customers
  const addCustomer = async (custData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `cust_${Date.now()}`;
    const now = new Date().toISOString();
    const newCust: Customer = {
      ...custData,
      id,
      createdAt: now,
      updatedAt: now
    };
    try {
      await setDoc(doc(db, 'customers', id), newCust);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `customers/${id}`);
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      await updateDoc(doc(db, 'customers', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `customers/${id}`);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `customers/${id}`);
    }
  };

  // CRUD for Products
  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `prod_${Date.now()}`;
    const now = new Date().toISOString();
    const newProd: Product = {
      ...prodData,
      id,
      createdAt: now,
      updatedAt: now
    };
    try {
      await setDoc(doc(db, 'products', id), newProd);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${id}`);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  // CRUD for Plans
  const addPlan = async (planData: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `plan_${Date.now()}`;
    const now = new Date().toISOString();
    const newPlan: Plan = {
      ...planData,
      id,
      createdAt: now,
      updatedAt: now
    };
    try {
      await setDoc(doc(db, 'plans', id), newPlan);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `plans/${id}`);
    }
  };

  const updatePlan = async (id: string, updates: Partial<Plan>) => {
    try {
      await updateDoc(doc(db, 'plans', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `plans/${id}`);
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'plans', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `plans/${id}`);
    }
  };

  // CRUD for Subscriptions
  const addSubscription = async (subData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'subscriptionNumber'>) => {
    const id = `sub_${Date.now()}`;
    const count = subscriptions.length + 1;
    const subscriptionNumber = `SUB-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newSub: Subscription = {
      ...subData,
      id,
      subscriptionNumber,
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'subscriptions', id), newSub);

      // Automatically generate initial invoice for this subscription!
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
      const subtotal = subData.amount;
      const discountAmt = subData.discountAmount || 0;
      const taxable = Math.max(0, subtotal - discountAmt);
      const taxRate = 18;
      const taxAmount = Math.round(taxable * 0.18 * 100) / 100;
      const totalAmount = Math.round((taxable + taxAmount) * 100) / 100;

      const newInv: Invoice = {
        id: `inv_${Date.now()}`,
        invoiceNumber,
        subscriptionId: id,
        customerId: subData.customerId,
        customerName: subData.customerName,
        customerEmail: subData.customerEmail,
        billingPeriodStart: subData.currentPeriodStart,
        billingPeriodEnd: subData.currentPeriodEnd,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: subData.currentPeriodStart,
        subtotal,
        discountAmount: discountAmt,
        discountCode: subData.discountCode,
        taxRate,
        taxAmount,
        totalAmount,
        status: 'unpaid',
        notes: `Initial invoice for subscription ${subscriptionNumber} (${subData.planName})`,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(doc(db, 'invoices', newInv.id), newInv);

      // Add Notification
      const notifId = `notif_${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        title: 'New Subscription Activated',
        message: `${subData.customerName} subscribed to ${subData.productName} (${subscriptionNumber}).`,
        type: 'renewal',
        read: false,
        link: 'subscriptions',
        createdAt: now
      });

      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `subscriptions/${id}`);
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      await updateDoc(doc(db, 'subscriptions', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `subscriptions/${id}`);
    }
  };

  const pauseSubscription = async (id: string) => {
    await updateSubscription(id, { status: 'paused', autoRenew: false });
  };

  const resumeSubscription = async (id: string) => {
    await updateSubscription(id, { status: 'active', autoRenew: true });
  };

  const cancelSubscription = async (id: string) => {
    await updateSubscription(id, { status: 'cancelled', autoRenew: false });
  };

  const renewSubscription = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;

    const currentEnd = new Date(sub.currentPeriodEnd);
    const newEnd = new Date(currentEnd);
    if (sub.frequency === 'yearly') {
      newEnd.setFullYear(newEnd.getFullYear() + 1);
    } else if (sub.frequency === 'quarterly') {
      newEnd.setMonth(newEnd.getMonth() + 3);
    } else {
      newEnd.setMonth(newEnd.getMonth() + 1);
    }

    const nextEndStr = newEnd.toISOString().split('T')[0];

    await updateSubscription(id, {
      status: 'active',
      currentPeriodStart: sub.currentPeriodEnd,
      currentPeriodEnd: nextEndStr,
      renewalDate: nextEndStr,
      autoRenew: true
    });

    // Generate renewed invoice
    await generateInvoiceFromSubscription(id);
  };

  // CRUD for Invoices
  const addInvoice = async (invData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>) => {
    const id = `inv_${Date.now()}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newInv: Invoice = {
      ...invData,
      id,
      invoiceNumber,
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'invoices', id), newInv);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `invoices/${id}`);
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      await updateDoc(doc(db, 'invoices', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `invoices/${id}`);
    }
  };

  // Prevent duplicate billing for same subscription period
  const generateInvoiceFromSubscription = async (subscriptionId: string): Promise<string | null> => {
    const sub = subscriptions.find(s => s.id === subscriptionId);
    if (!sub) throw new Error('Subscription not found');

    // Duplicate check: verify if an invoice already exists for this subscription and billing period
    const existing = invoices.find(
      inv => inv.subscriptionId === sub.id &&
             inv.billingPeriodStart?.slice(0, 10) === sub.currentPeriodStart?.slice(0, 10)
    );

    if (existing) {
      console.warn(`Duplicate invoice prevention: Invoice ${existing.invoiceNumber} already covers period start ${sub.currentPeriodStart}`);
      return existing.id;
    }

    const subtotal = sub.amount;
    const discountAmt = sub.discountAmount || 0;
    const taxable = Math.max(0, subtotal - discountAmt);
    const taxRate = 18;
    const taxAmount = Math.round(taxable * 0.18 * 100) / 100;
    const totalAmount = Math.round((taxable + taxAmount) * 100) / 100;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    const id = `inv_${Date.now()}`;
    const now = new Date().toISOString();

    const invoice: Invoice = {
      id,
      invoiceNumber,
      subscriptionId: sub.id,
      customerId: sub.customerId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      billingPeriodStart: sub.currentPeriodStart,
      billingPeriodEnd: sub.currentPeriodEnd,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: sub.renewalDate || sub.currentPeriodEnd,
      subtotal,
      discountAmount: discountAmt,
      discountCode: sub.discountCode,
      taxRate,
      taxAmount,
      totalAmount,
      status: 'unpaid',
      notes: `Automated recurring invoice for ${sub.productName} (${sub.planName})`,
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'invoices', id), invoice);

      // In-app alert
      const notifId = `notif_${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        title: 'New Invoice Issued',
        message: `${invoiceNumber} generated for ${sub.customerName} ($${totalAmount.toFixed(2)}).`,
        type: 'invoice',
        read: false,
        link: 'invoices',
        createdAt: now
      });

      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `invoices/${id}`);
    }
  };

  // Payment Recording & Simulated Checkout
  const recordPayment = async (params: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    referenceId?: string;
    isSimulated?: boolean;
  }) => {
    const inv = invoices.find(i => i.id === params.invoiceId);
    if (!inv) throw new Error('Invoice not found');

    const payId = `pay_${Date.now()}`;
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payments.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const referenceId = params.referenceId || `${params.method.toUpperCase()}_TXN_${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayment: Payment = {
      id: payId,
      paymentNumber,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amount: params.amount,
      currency: 'USD',
      method: params.method,
      referenceId,
      status: 'completed',
      isSimulated: !!params.isSimulated,
      paidAt: now,
      createdAt: now
    };

    try {
      // 1. Create Payment Record
      await setDoc(doc(db, 'payments', payId), newPayment);

      // 2. Update Invoice to Paid
      await updateDoc(doc(db, 'invoices', inv.id), {
        status: 'paid',
        paidAt: now,
        paymentMethod: params.method,
        paymentReferenceId: referenceId,
        updatedAt: now
      });

      // 3. If tied to a subscription, ensure subscription is marked active
      if (inv.subscriptionId) {
        const sub = subscriptions.find(s => s.id === inv.subscriptionId);
        if (sub && (sub.status === 'pending' || sub.status === 'expired')) {
          await updateDoc(doc(db, 'subscriptions', sub.id), {
            status: 'active',
            updatedAt: now
          });
        }
      }

      // 4. Add Notification
      const notifId = `notif_${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        title: params.isSimulated ? 'Simulated Payment Successful' : 'Payment Received',
        message: `Received $${params.amount.toFixed(2)} via ${params.method.toUpperCase()} from ${inv.customerName} for ${inv.invoiceNumber}.`,
        type: 'payment',
        read: false,
        link: 'payments',
        createdAt: now
      });

      return payId;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `payments/${payId}`);
    }
  };

  // CRUD for Discounts & Validation
  const addDiscount = async (discData: Omit<Discount, 'id' | 'createdAt' | 'usedCount'>) => {
    const id = `disc_${Date.now()}`;
    const newDisc: Discount = {
      ...discData,
      id,
      code: discData.code.trim().toUpperCase(),
      usedCount: 0,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'discounts', id), newDisc);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `discounts/${id}`);
    }
  };

  const updateDiscount = async (id: string, updates: Partial<Discount>) => {
    try {
      await updateDoc(doc(db, 'discounts', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `discounts/${id}`);
    }
  };

  const deleteDiscount = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'discounts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `discounts/${id}`);
    }
  };

  const validateDiscount = (code: string, subtotal: number) => {
    const cleaned = code.trim().toUpperCase();
    const disc = discounts.find(d => d.code === cleaned);
    if (!disc) {
      return { valid: false, discountAmount: 0, message: 'Invalid promo code.' };
    }
    if (disc.status !== 'active') {
      return { valid: false, discountAmount: 0, message: `Coupon is ${disc.status}.` };
    }
    const today = new Date().toISOString().split('T')[0];
    if (disc.startDate && today < disc.startDate) {
      return { valid: false, discountAmount: 0, message: 'Coupon offer has not started yet.' };
    }
    if (disc.expiryDate && today > disc.expiryDate) {
      return { valid: false, discountAmount: 0, message: 'Coupon code has expired.' };
    }
    if (disc.usageLimit && disc.usedCount >= disc.usageLimit) {
      return { valid: false, discountAmount: 0, message: 'Coupon usage limit reached.' };
    }
    if (disc.minInvoiceAmount && subtotal < disc.minInvoiceAmount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum order amount of $${disc.minInvoiceAmount} required.`
      };
    }

    let calculated = 0;
    if (disc.type === 'percentage') {
      calculated = Math.round((subtotal * (disc.value / 100)) * 100) / 100;
      if (disc.maxDiscountAmount && calculated > disc.maxDiscountAmount) {
        calculated = disc.maxDiscountAmount;
      }
    } else {
      calculated = Math.min(disc.value, subtotal);
    }

    return {
      valid: true,
      discountAmount: calculated,
      message: `Promo code applied! Saved $${calculated.toFixed(2)}`,
      discount: disc
    };
  };

  // Run Renewal Automation Engine
  const runRenewalAutomation = async () => {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    let renewalsDetected = 0;
    let invoicesGenerated = 0;

    for (const sub of subscriptions) {
      if (sub.status !== 'active' || !sub.autoRenew) continue;

      const renewalDate = new Date(sub.renewalDate || sub.currentPeriodEnd);
      if (renewalDate <= sevenDaysLater) {
        renewalsDetected++;

        // Duplicate billing protection: Check if an invoice for this upcoming cycle already exists
        const alreadyInvoiced = invoices.some(
          inv => inv.subscriptionId === sub.id &&
                 inv.billingPeriodStart?.slice(0, 10) === sub.currentPeriodStart?.slice(0, 10)
        );

        if (!alreadyInvoiced) {
          await generateInvoiceFromSubscription(sub.id);
          invoicesGenerated++;
        }
      }
    }

    // Add summary notification
    const notifId = `notif_${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      title: 'Automated Renewal Audit Finished',
      message: `Audited ${subscriptions.length} subscriptions. Detected ${renewalsDetected} upcoming renewals. Generated ${invoicesGenerated} new invoices (duplicate billing prevented).`,
      type: 'renewal',
      read: false,
      link: 'invoices',
      createdAt: new Date().toISOString()
    });

    return { renewalsDetected, invoicesGenerated };
  };

  // Notification actions
  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const value = {
    customers,
    products,
    plans,
    subscriptions,
    invoices,
    payments,
    discounts,
    notifications,
    isLoading,
    isSeeding,
    firestoreConnected,
    metrics,
    churnScores,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addProduct,
    updateProduct,
    deleteProduct,
    addPlan,
    updatePlan,
    deletePlan,
    addSubscription,
    updateSubscription,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    renewSubscription,
    addInvoice,
    updateInvoice,
    generateInvoiceFromSubscription,
    recordPayment,
    addDiscount,
    updateDiscount,
    deleteDiscount,
    validateDiscount,
    runRenewalAutomation,
    markNotificationRead,
    markAllNotificationsRead,
    seedSampleData
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionData = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionData must be used within a SubscriptionDataProvider');
  }
  return context;
};
