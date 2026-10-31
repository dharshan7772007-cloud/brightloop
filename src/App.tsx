/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionDataProvider, useSubscriptionData } from './context/SubscriptionDataContext';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { SimulatedCheckoutModal } from './components/SimulatedCheckoutModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { Invoice } from './types';

// Views
import { DashboardView } from './views/DashboardView';
import { SubscriptionsView } from './views/SubscriptionsView';
import { InvoicesView } from './views/InvoicesView';
import { PaymentsView } from './views/PaymentsView';
import { CustomersView } from './views/CustomersView';
import { ProductsView } from './views/ProductsView';
import { PlansView } from './views/PlansView';
import { DiscountsView } from './views/DiscountsView';
import { AnalyticsView } from './views/AnalyticsView';
import { AutomationView } from './views/AutomationView';
import { AssistantView } from './views/AssistantView';

const MainAppContent: React.FC = () => {
  const { isAdmin, loading } = useAuth();
  const { isLoading: isDataLoading } = useSubscriptionData();

  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [checkoutInvoice, setCheckoutInvoice] = useState<Invoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // If loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 animate-spin flex items-center justify-center p-1 mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[12px]" />
        </div>
        <p className="text-xs text-slate-400 font-semibold tracking-wide">
          Authenticating BRIGHTLOOP Platform...
        </p>
      </div>
    );
  }

  // Protected route check: If unauthenticated, show SaaS Login screen
  if (!isAdmin) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Dark Navy Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header Bar */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onNavigateTab={setCurrentTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setCurrentTab}
              onOpenCheckout={(inv) => setCheckoutInvoice(inv)}
              onOpenInvoicePrint={(inv) => setPrintInvoice(inv)}
              onOpenAssistant={() => setIsAssistantOpen(true)}
            />
          )}

          {currentTab === 'subscriptions' && (
            <SubscriptionsView searchTerm={searchTerm} />
          )}

          {currentTab === 'invoices' && (
            <InvoicesView
              searchTerm={searchTerm}
              onOpenInvoicePrint={(inv) => setPrintInvoice(inv)}
              onOpenCheckout={(inv) => setCheckoutInvoice(inv)}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsView
              searchTerm={searchTerm}
              onOpenCheckout={(inv) => setCheckoutInvoice(inv)}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView searchTerm={searchTerm} />
          )}

          {currentTab === 'products' && (
            <ProductsView searchTerm={searchTerm} />
          )}

          {currentTab === 'plans' && (
            <PlansView searchTerm={searchTerm} />
          )}

          {currentTab === 'discounts' && (
            <DiscountsView searchTerm={searchTerm} />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView />
          )}

          {currentTab === 'automation' && (
            <AutomationView />
          )}

          {currentTab === 'assistant' && (
            <AssistantView />
          )}
        </main>
      </div>

      {/* Central Modals */}
      {checkoutInvoice && (
        <SimulatedCheckoutModal
          invoice={checkoutInvoice}
          onClose={() => setCheckoutInvoice(null)}
          onSuccess={() => setCheckoutInvoice(null)}
        />
      )}

      {printInvoice && (
        <InvoicePrintModal
          invoice={printInvoice}
          onClose={() => setPrintInvoice(null)}
          onPay={() => {
            const inv = printInvoice;
            setPrintInvoice(null);
            setCheckoutInvoice(inv);
          }}
        />
      )}

      <AiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionDataProvider>
        <MainAppContent />
      </SubscriptionDataProvider>
    </AuthProvider>
  );
}
