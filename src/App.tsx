/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ModelWall } from './pages/ModelWall';
import { ModelProfile } from './pages/ModelProfile';
import { CreateProfile } from './pages/CreateProfile';
import { CreateInvitation } from './pages/CreateInvitation';
import { Pricing } from './pages/Pricing';
import { LoginPage } from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AboutPage } from './pages/About';
import { ContactPage } from './pages/Contact';
import { TermsPage } from './pages/Terms';
import { PrivacyPage } from './pages/Privacy';
import { HelpPage } from './pages/Help';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { ModelDashboardHome } from './pages/dashboard/ModelDashboardHome';
import MyProfile from './pages/dashboard/MyProfile';
import MyPortfolio from './pages/dashboard/MyPortfolio';
import Portfolio from './pages/dashboard/Portfolio';
import Applications from './pages/dashboard/Applications';
import Invitations from './pages/dashboard/Invitations';
import Notifications from './pages/dashboard/Notifications';
import GoPro from './pages/dashboard/GoPro';
import Settings from './pages/dashboard/Settings';
import { BusinessLayout } from './pages/business/BusinessLayout';
import { BusinessDashboardHome } from './pages/business/BusinessDashboardHome';
import SearchModels from './pages/business/SearchModels';
import BusinessInvitations from './pages/business/BusinessInvitations';
import SavedModels from './pages/business/SavedModels';
import JobRequests from './pages/business/JobRequests';
import Messages from './pages/business/Messages';
import BusinessSettings from './pages/business/BusinessSettings';
import { useEffect, type ReactNode } from 'react';

import { UserProvider, useUser } from './contexts/UserContext';
import { ToastProvider } from './components/ui/Toast';

import { AdminLayout } from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminModels from './pages/admin/AdminModels';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCategories from './pages/admin/AdminCategories';
import AdminFeatured from './pages/admin/AdminFeatured';
import AdminVerification from './pages/admin/AdminVerification';
import AdminReviews from './pages/admin/AdminReviews';
import AdminPayments from './pages/admin/AdminPayments';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminReports from './pages/admin/AdminReports';
import AdminCMS from './pages/admin/AdminCMS';
import AdminSupport from './pages/admin/AdminSupport';
import AdminTeam from './pages/admin/AdminTeam';
import AdminAudit from './pages/admin/AdminAudit';
import AdminSettings from './pages/admin/AdminSettings';
import { AdminAccessDenied } from './pages/AdminAccessDenied';

const SUPER_ADMIN_EMAIL = 'osiobeprovidence@gmail.com';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ModelDashboard = () => (
  <DashboardLayout>
    <ModelDashboardHome />
  </DashboardLayout>
);

const ModelProfileDashboard = () => (
  <DashboardLayout>
    <MyProfile />
  </DashboardLayout>
);

const ModelMyPortfolioDashboard = () => (
  <DashboardLayout>
    <MyPortfolio />
  </DashboardLayout>
);

const ModelPortfolioDashboard = () => (
  <DashboardLayout>
    <Portfolio />
  </DashboardLayout>
);

const ModelApplicationsDashboard = () => (
  <DashboardLayout>
    <Applications />
  </DashboardLayout>
);

const ModelInvitationsDashboard = () => (
  <DashboardLayout>
    <Invitations />
  </DashboardLayout>
);

const ModelNotificationsDashboard = () => (
  <DashboardLayout>
    <Notifications />
  </DashboardLayout>
);

const ModelGoProDashboard = () => (
  <DashboardLayout>
    <GoPro />
  </DashboardLayout>
);

const ModelSettingsDashboard = () => (
  <DashboardLayout>
    <Settings />
  </DashboardLayout>
);

const BizDashboard = () => (
  <BusinessLayout>
    <BusinessDashboardHome />
  </BusinessLayout>
);

const BizSearch = () => (
  <BusinessLayout>
    <SearchModels />
  </BusinessLayout>
);

const BizInvitations = () => (
  <BusinessLayout>
    <BusinessInvitations />
  </BusinessLayout>
);

const BizSaved = () => (
  <BusinessLayout>
    <SavedModels />
  </BusinessLayout>
);

const BizJobs = () => (
  <BusinessLayout>
    <JobRequests />
  </BusinessLayout>
);

const BizMessages = () => (
  <BusinessLayout>
    <Messages />
  </BusinessLayout>
);

const BizSettings = () => (
  <BusinessLayout>
    <BusinessSettings />
  </BusinessLayout>
);

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { firebaseUser, convexUser, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (convexUser && !convexUser.role) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { convexUser } = useUser();
  if (!convexUser || convexUser.email !== SUPER_ADMIN_EMAIL) {
    return <AdminAccessDenied />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

const AdminPage = ({ children }: { children: ReactNode }) => (
  <AdminGuard>{children}</AdminGuard>
);

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.includes('dashboard');
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <UserProvider>
      <ToastProvider>
        <div className="font-sans antialiased text-[#111111] overflow-x-hidden">
        <ScrollToTop />
        {!isDashboard && !isAdmin && <Navbar />}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ModelWall />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/models" element={<ModelWall />} />
          <Route path="/profile/:id" element={<ModelProfile />} />
          <Route path="/business-dashboard" element={<ProtectedRoute><BizDashboard /></ProtectedRoute>} />
          <Route path="/business-dashboard/search" element={<ProtectedRoute><BizSearch /></ProtectedRoute>} />
          <Route path="/business-dashboard/invitations" element={<ProtectedRoute><BizInvitations /></ProtectedRoute>} />
          <Route path="/business-dashboard/saved" element={<ProtectedRoute><BizSaved /></ProtectedRoute>} />
          <Route path="/business-dashboard/jobs" element={<ProtectedRoute><BizJobs /></ProtectedRoute>} />
          <Route path="/business-dashboard/messages" element={<ProtectedRoute><BizMessages /></ProtectedRoute>} />
          <Route path="/business-dashboard/settings" element={<ProtectedRoute><BizSettings /></ProtectedRoute>} />
          <Route path="/model-dashboard" element={<ProtectedRoute><ModelDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/profile" element={<ProtectedRoute><ModelProfileDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/my-portfolio" element={<ProtectedRoute><ModelMyPortfolioDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/portfolio" element={<ProtectedRoute><ModelPortfolioDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/applications" element={<ProtectedRoute><ModelApplicationsDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/invitations" element={<ProtectedRoute><ModelInvitationsDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/notifications" element={<ProtectedRoute><ModelNotificationsDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/go-pro" element={<ProtectedRoute><ModelGoProDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/settings" element={<ProtectedRoute><ModelSettingsDashboard /></ProtectedRoute>} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/invite/:id" element={<CreateInvitation />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<OnboardingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/admin" element={<AdminPage><AdminDashboard /></AdminPage>} />
          <Route path="/admin/models" element={<AdminPage><AdminModels /></AdminPage>} />
          <Route path="/admin/businesses" element={<AdminPage><AdminBusinesses /></AdminPage>} />
          <Route path="/admin/bookings" element={<AdminPage><AdminBookings /></AdminPage>} />
          <Route path="/admin/categories" element={<AdminPage><AdminCategories /></AdminPage>} />
          <Route path="/admin/featured" element={<AdminPage><AdminFeatured /></AdminPage>} />
          <Route path="/admin/verification" element={<AdminPage><AdminVerification /></AdminPage>} />
          <Route path="/admin/reviews" element={<AdminPage><AdminReviews /></AdminPage>} />
          <Route path="/admin/payments" element={<AdminPage><AdminPayments /></AdminPage>} />
          <Route path="/admin/notifications" element={<AdminPage><AdminNotifications /></AdminPage>} />
          <Route path="/admin/reports" element={<AdminPage><AdminReports /></AdminPage>} />
          <Route path="/admin/cms" element={<AdminPage><AdminCMS /></AdminPage>} />
          <Route path="/admin/support" element={<AdminPage><AdminSupport /></AdminPage>} />
          <Route path="/admin/admins" element={<AdminPage><AdminTeam /></AdminPage>} />
          <Route path="/admin/audit" element={<AdminPage><AdminAudit /></AdminPage>} />
          <Route path="/admin/settings" element={<AdminPage><AdminSettings /></AdminPage>} />
        </Routes>
        {!isDashboard && !isAdmin && <Footer />}
        </div>
      </ToastProvider>
    </UserProvider>
  );
}
