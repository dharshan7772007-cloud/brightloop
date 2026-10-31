export type FrequencyType = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'pending' | 'paused' | 'cancelled' | 'expired';
export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue';
export type PaymentMethod = 'upi' | 'card' | 'net_banking' | 'cash';
export type PaymentStatus = 'completed' | 'pending' | 'failed';
export type DiscountType = 'percentage' | 'fixed';
export type DiscountStatus = 'active' | 'inactive' | 'expired';
export type NotificationType = 'renewal' | 'invoice' | 'payment' | 'system';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'finance_manager' | 'viewer';
  avatarUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceDelta: number; // e.g. +$20 for Pro tier or 5 team seats
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  status: 'active' | 'archived';
  features: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  productId: string;
  productName: string;
  frequency: FrequencyType;
  price: number;
  currency: string;
  trialDays: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  planId: string;
  planName: string;
  frequency: FrequencyType;
  amount: number;
  status: SubscriptionStatus;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  renewalDate: string;
  discountCode?: string;
  discountAmount?: number;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  taxRate: number; // e.g. 18 for 18%
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  paymentReferenceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  referenceId: string;
  status: PaymentStatus;
  isSimulated: boolean;
  paidAt: string;
  createdAt: string;
}

export interface Discount {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number; // e.g. 15 for 15% or 50 for $50
  minInvoiceAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  status: DiscountStatus;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  mrr: number;
  totalCustomers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  pendingInvoicesCount: number;
  pendingInvoicesAmount: number;
  churnRateEstimate: number;
}

export interface ChurnScoreData {
  customerId: string;
  customerName: string;
  company: string;
  riskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Medium' | 'High';
  activeSubscriptionsCount: number;
  unpaidInvoicesCount: number;
  lastPaymentDate?: string;
  reasons: string[];
}
