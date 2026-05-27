import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { HomeProvider } from '@/contexts/HomeContext.jsx';
import { PasswordProtectionProvider, usePasswordAuth } from '@/contexts/PasswordProtection.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import Layout from '@/components/Layout.jsx';
import { Toaster } from '@/components/ui/toaster.jsx';

// ── Infrastructure ──────────────────────────────────────────────────
import UnderConstructionPage from '@/pages/UnderConstructionPage.jsx';
import LandingPage from '@/pages/LandingPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import PasswordResetPage from '@/pages/PasswordResetPage.jsx';
import PasswordConfirmPage from '@/pages/PasswordConfirmPage.jsx';
import ImageGalleryPage from '@/pages/ImageGalleryPage.jsx';

// ── Core App ────────────────────────────────────────────────────────
import DashboardPage from '@/pages/DashboardPage.jsx';
import HomeProfilePage from '@/pages/HomeProfilePage.jsx';
import NotificationsCenterPage from '@/pages/NotificationsCenterPage.jsx';
import VendorDirectoryPage from '@/pages/VendorDirectoryPage.jsx';
import ReportsPage from '@/pages/ReportsPage.jsx';

// ── Portfolio & Properties ──────────────────────────────────────────
import PortfolioOverviewPage from '@/pages/PortfolioOverviewPage.jsx';
import HomePage from '@/pages/HomePage.jsx';
import PropertyManagementDashboard from '@/pages/PropertyManagementDashboard.jsx';
import RentalPropertiesPage from '@/pages/RentalPropertiesPage.jsx';
import RentalTaxGuidePage from '@/pages/RentalTaxGuidePage.jsx';

// ── Financial ───────────────────────────────────────────────────────
import BillPayPage from '@/pages/BillPayPage.jsx';
import BillsPage from '@/pages/BillsPage.jsx';
import ExpensesPage from '@/pages/ExpensesPage.jsx';
import HomeValuationPage from '@/pages/HomeValuationPage.jsx';
import PropertyTaxPage from '@/pages/PropertyTaxPage.jsx';
import ValuationEquityPage from '@/pages/ValuationEquityPage.jsx';

// ── Maintenance & Home ──────────────────────────────────────────────
import MaintenanceManagementPage from '@/pages/MaintenanceManagementPage.jsx';
import MaintenanceSchedulerPage from '@/pages/MaintenanceSchedulerPage.jsx';
import MaintenanceSystemsPage from '@/pages/MaintenanceSystemsPage.jsx';
import PlantsPage from '@/pages/PlantsPage.jsx';
import UtilitiesPage from '@/pages/UtilitiesPage.jsx';
import WarrantyTrackerPage from '@/pages/WarrantyTrackerPage.jsx';
import HomeTimelinePage from '@/pages/HomeTimelinePage.jsx';

// ── Insurance & Documents ───────────────────────────────────────────
import InsuranceAnalyzerPage from '@/pages/InsuranceAnalyzerPage.jsx';
import DocumentsPage from '@/pages/DocumentsPage.jsx';

// ── Learn & Resources ───────────────────────────────────────────────
import HomeLearnPage from '@/pages/HomeLearnPage.jsx';
import ReadyToSellPage from '@/pages/ReadyToSellPage.jsx';

// ── Marketing / Narrative (public, no auth) ─────────────────────────
import HomeOSOverviewPage from '@/pages/HomeOSOverviewPage.jsx';
import WhyHomeOSPage from '@/pages/WhyHomeOSPage.jsx';
import AgentValuePage from '@/pages/AgentValuePage.jsx';
import BrokerageValuePage from '@/pages/BrokerageValuePage.jsx';
import HomeownerJourneyPage from '@/pages/HomeownerJourneyPage.jsx';
import CompassHomeOSPreviewPage from '@/pages/CompassHomeOSPreviewPage.jsx';

// ── Tier-4 Info Pages (public, no auth) ─────────────────────────────
import PricingPage from '@/pages/PricingPage.jsx';
import SecurityPrivacyPage from '@/pages/SecurityPrivacyPage.jsx';
import AboutPage from '@/pages/AboutPage.jsx';
import ContactPage from '@/pages/ContactPage.jsx';

// ═══════════════════════════════════════════════════════════════════════

const AppContent = () => {
  const { isAuthenticated } = usePasswordAuth();

  if (!isAuthenticated) {
    return (
      <AuthProvider>
        <Routes>
          <Route path="/password-reset" element={<PasswordResetPage />} />
          <Route path="/password-confirm" element={<PasswordConfirmPage />} />
          <Route path="*" element={<UnderConstructionPage />} />
        </Routes>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <HomeProvider>
        <Routes>

          {/* ── Auth & Public ─────────────────────────────────────── */}
          <Route path="/password-reset" element={<PasswordResetPage />} />
          <Route path="/password-confirm" element={<PasswordConfirmPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/gallery" element={<ImageGalleryPage />} />

          {/* ── Marketing / Narrative (public, no Layout) ─────────── */}
          <Route path="/homeos" element={<HomeOSOverviewPage />} />
          <Route path="/why-homeos" element={<WhyHomeOSPage />} />
          <Route path="/agent-value" element={<AgentValuePage />} />
          <Route path="/brokerage-value" element={<BrokerageValuePage />} />
          <Route path="/homeowner-journey" element={<HomeownerJourneyPage />} />
          <Route path="/compass-preview" element={<CompassHomeOSPreviewPage />} />

          {/* ── Tier-4 Info Pages (public, no Layout) ─────────────── */}
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/security" element={<SecurityPrivacyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* ── Core (protected, no Layout wrapper) ───────────────── */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/home-profile" element={<ProtectedRoute><HomeProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsCenterPage /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><VendorDirectoryPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

          {/* ── Portfolio & Properties ─────────────────────────────── */}
          <Route path="/portfolio" element={<ProtectedRoute><Layout><PortfolioOverviewPage /></Layout></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>} />
          <Route path="/property-management" element={<ProtectedRoute><Layout><PropertyManagementDashboard /></Layout></ProtectedRoute>} />
          <Route path="/rental-properties" element={<ProtectedRoute><Layout><RentalPropertiesPage /></Layout></ProtectedRoute>} />
          <Route path="/rental-tax-guide" element={<ProtectedRoute><Layout><RentalTaxGuidePage /></Layout></ProtectedRoute>} />

          {/* ── Financial ──────────────────────────────────────────── */}
          <Route path="/bill-pay" element={<ProtectedRoute><Layout><BillPayPage /></Layout></ProtectedRoute>} />
          <Route path="/bills" element={<ProtectedRoute><Layout><BillsPage /></Layout></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Layout><ExpensesPage /></Layout></ProtectedRoute>} />
          <Route path="/home-valuation" element={<ProtectedRoute><Layout><HomeValuationPage /></Layout></ProtectedRoute>} />
          <Route path="/property-tax" element={<ProtectedRoute><Layout><PropertyTaxPage /></Layout></ProtectedRoute>} />
          <Route path="/valuation-equity" element={<ProtectedRoute><Layout><ValuationEquityPage /></Layout></ProtectedRoute>} />

          {/* ── Maintenance & Home ─────────────────────────────────── */}
          <Route path="/maintenance-management" element={<ProtectedRoute><Layout><MaintenanceManagementPage /></Layout></ProtectedRoute>} />
          <Route path="/maintenance-scheduler" element={<ProtectedRoute><Layout><MaintenanceSchedulerPage /></Layout></ProtectedRoute>} />
          <Route path="/maintenance" element={<ProtectedRoute><Layout><MaintenanceSystemsPage /></Layout></ProtectedRoute>} />
          <Route path="/plants" element={<ProtectedRoute><Layout><PlantsPage /></Layout></ProtectedRoute>} />
          <Route path="/utilities" element={<ProtectedRoute><Layout><UtilitiesPage /></Layout></ProtectedRoute>} />
          <Route path="/warranty-tracker" element={<ProtectedRoute><Layout><WarrantyTrackerPage /></Layout></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><Layout><HomeTimelinePage /></Layout></ProtectedRoute>} />

          {/* ── Insurance & Documents ──────────────────────────────── */}
          <Route path="/insurance" element={<ProtectedRoute><Layout><InsuranceAnalyzerPage /></Layout></ProtectedRoute>} />
          <Route path="/insurance-analyzer" element={<ProtectedRoute><Layout><InsuranceAnalyzerPage /></Layout></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Layout><DocumentsPage /></Layout></ProtectedRoute>} />

          {/* ── Learn & Resources ──────────────────────────────────── */}
          <Route path="/learn" element={<ProtectedRoute><Layout><HomeLearnPage /></Layout></ProtectedRoute>} />
          <Route path="/home-learn" element={<ProtectedRoute><Layout><HomeLearnPage /></Layout></ProtectedRoute>} />
          <Route path="/ready-to-sell" element={<ProtectedRoute><Layout><ReadyToSellPage /></Layout></ProtectedRoute>} />

        </Routes>
        <Toaster />
      </HomeProvider>
    </AuthProvider>
  );
};

function App() {
  return (
    <Router>
      <PasswordProtectionProvider>
        <AppContent />
      </PasswordProtectionProvider>
    </Router>
  );
}

export default App;
