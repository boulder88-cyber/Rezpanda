import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { HomeProvider } from '@/contexts/HomeContext.jsx';
import { PasswordProtectionProvider, usePasswordAuth } from '@/contexts/PasswordProtection.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import Layout from '@/components/Layout.jsx';
import { Toaster } from '@/components/ui/toaster.jsx';

import UnderConstructionPage from '@/pages/UnderConstructionPage.jsx';
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

// Inner component to handle conditional rendering based on password protection
const AppContent = () => {
  // Check password protection state
  const { isPasswordProtected, isAuthenticated } = usePasswordAuth();

  // GATEKEEPER: If password protection is active and user is not authenticated,
  // render ONLY the UnderConstructionPage. This blocks all other routes.
  if (isPasswordProtected && !isAuthenticated) {
    return <UnderConstructionPage />;
  }

  // If authenticated (or if protection is disabled in preview mode),
  // render the normal application routes.
  return (
    <AuthProvider>
      <HomeProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />
          <Route path="/password-confirm" element={<PasswordConfirmPage />} />
          <Route path="/gallery" element={<ImageGalleryPage />} />

          {/* Main Dashboard Route - Rebuilt */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Legacy Properties List (formerly Dashboard) */}
          <Route 
            path="/properties" 
            element={
              <ProtectedRoute>
                <Layout>
                  <HomePage />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Comprehensive Property Management Dashboard */}
          <Route 
            path="/property-management" 
            element={
              <ProtectedRoute>
                <Layout>
                  <PropertyManagementDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Centralized Bill Pay Dashboard */}
          <Route 
            path="/bill-pay" 
            element={
              <ProtectedRoute>
                <Layout>
                  <BillPayPage />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* New Maintenance Management System */}
          <Route 
            path="/maintenance-management" 
            element={
              <ProtectedRoute>
                <Layout>
                  <MaintenanceManagementPage />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Other Protected Routes wrapped in Layout */}
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Layout>
                  <ExpensesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <Layout>
                  <MaintenanceSystemsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/plants"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlantsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/utilities"
            element={
              <ProtectedRoute>
                <Layout>
                  <UtilitiesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Layout>
                  <DocumentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rental-properties"
            element={
              <ProtectedRoute>
                <Layout>
                  <RentalPropertiesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <ProtectedRoute>
                <Layout>
                  <BillsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </HomeProvider>
    </AuthProvider>
  );
};

function App() {
  return (
    <Router>
      {/* PasswordProtectionProvider wraps the entire app at the highest level */}
      <PasswordProtectionProvider>
        <AppContent />
      </PasswordProtectionProvider>
    </Router>
  );
}

export default App;