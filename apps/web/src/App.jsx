import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { HomeProvider } from '@/contexts/HomeContext.jsx';
import { PasswordProtectionProvider } from '@/contexts/PasswordProtection.jsx';
import Layout from '@/components/Layout.jsx';
import { Toaster } from '@/components/ui/toaster.jsx';

import LandingPage from '@/pages/LandingPage.jsx';
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import PasswordResetPage from '@/pages/PasswordResetPage.jsx';
import PasswordConfirmPage from '@/pages/PasswordConfirmPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import ExpensesPage from '@/pages/ExpensesPage.jsx';
import MaintenanceSystemsPage from '@/pages/MaintenanceSystemsPage.jsx';
import MaintenanceManagementPage from '@/pages/MaintenanceManagementPage.jsx';
import PlantsPage from '@/pages/PlantsPage.jsx';
import UtilitiesPage from '@/pages/UtilitiesPage.jsx';
import DocumentsPage from '@/pages/DocumentsPage.jsx';
import RentalPropertiesPage from '@/pages/RentalPropertiesPage.jsx';
import BillsPage from '@/pages/BillsPage.jsx';
import ImageGalleryPage from '@/pages/ImageGalleryPage.jsx';
import PropertyManagementDashboard from '@/pages/PropertyManagementDashboard.jsx';
import BillPayPage from '@/pages/BillPayPage.jsx';
import HomeValuationPage from '@/pages/HomeValuationPage.jsx';
import RentalTaxGuidePage from '@/pages/RentalTaxGuidePage.jsx';
import InsuranceAnalyzerPage from '@/pages/InsuranceAnalyzerPage.jsx';
import HomeLearnPage from '@/pages/HomeLearnPage.jsx';
import PropertyTaxPage from '@/pages/PropertyTaxPage.jsx';
import WarrantyTrackerPage from '@/pages/WarrantyTrackerPage.jsx';

function App() {
  return (
    <Router>
      <PasswordProtectionProvider>
        <AuthProvider>
          <HomeProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/password-reset" element={<PasswordResetPage />} />
              <Route path="/password-confirm" element={<PasswordConfirmPage />} />
              <Route path="/gallery" element={<ImageGalleryPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/properties" element={<Layout><HomePage /></Layout>} />
              <Route path="/property-management" element={<Layout><PropertyManagementDashboard /></Layout>} />
              <Route path="/bill-pay" element={<Layout><BillPayPage /></Layout>} />
              <Route path="/maintenance-management" element={<Layout><MaintenanceManagementPage /></Layout>} />
              <Route path="/expenses" element={<Layout><ExpensesPage /></Layout>} />
              <Route path="/maintenance" element={<Layout><MaintenanceSystemsPage /></Layout>} />
              <Route path="/plants" element={<Layout><PlantsPage /></Layout>} />
              <Route path="/utilities" element={<Layout><UtilitiesPage /></Layout>} />
              <Route path="/documents" element={<Layout><DocumentsPage /></Layout>} />
              <Route path="/rental-properties" element={<Layout><RentalPropertiesPage /></Layout>} />
              <Route path="/bills" element={<Layout><BillsPage /></Layout>} />
              <Route path="/home-valuation" element={<Layout><HomeValuationPage /></Layout>} />
              <Route path="/rental-tax-guide" element={<Layout><RentalTaxGuidePage /></Layout>} />
              <Route path="/insurance" element={<Layout><InsuranceAnalyzerPage /></Layout>} />
              <Route path="/learn" element={<Layout><HomeLearnPage /></Layout>} />
              <Route path="/property-tax" element={<Layout><PropertyTaxPage /></Layout>} />
              <Route path="/warranty-tracker" element={<Layout><WarrantyTrackerPage /></Layout>} />
            </Routes>
            <Toaster />
          </HomeProvider>
        </AuthProvider>
      </PasswordProtectionProvider>
    </Router>
  );
}

export default App;
