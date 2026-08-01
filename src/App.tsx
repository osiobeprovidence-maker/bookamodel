/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, lazy, Suspense, useEffect, type ReactNode } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { UserProvider, useUser } from './contexts/UserContext';
import { ToastProvider } from './components/ui/Toast';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineBanner } from './components/OfflineBanner';
import { UpdateBanner } from './components/UpdateBanner';

const lazyNamed =
  (name: string) => (loader: () => Promise<Record<string, any>>) =>
    lazy(() => loader().then((m) => ({ default: m[name] })));

const ModelWall = lazyNamed('ModelWall')(() => import('./pages/ModelWall'));
const ModelProfile = lazyNamed('ModelProfile')(() => import('./pages/ModelProfile'));
const CreateProfile = lazyNamed('CreateProfile')(() => import('./pages/CreateProfile'));
const CreateInvitation = lazyNamed('CreateInvitation')(() => import('./pages/CreateInvitation'));
const Pricing = lazyNamed('Pricing')(() => import('./pages/Pricing'));
const LoginPage = lazyNamed('LoginPage')(() => import('./pages/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const CategoriesPage = lazyNamed('CategoriesPage')(() => import('./pages/CategoriesPage'));
const AboutPage = lazyNamed('AboutPage')(() => import('./pages/About'));
const ContactPage = lazyNamed('ContactPage')(() => import('./pages/Contact'));
const TermsPage = lazyNamed('TermsPage')(() => import('./pages/Terms'));
const PrivacyPage = lazyNamed('PrivacyPage')(() => import('./pages/Privacy'));
const HelpPage = lazyNamed('HelpPage')(() => import('./pages/Help'));

const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const ModelDashboardHome = lazyNamed('ModelDashboardHome')(() => import('./pages/dashboard/ModelDashboardHome'));
const MyProfile = lazy(() => import('./pages/dashboard/MyProfile'));
const Portfolio = lazy(() => import('./pages/dashboard/Portfolio'));
const Applications = lazy(() => import('./pages/dashboard/Applications'));
const Invitations = lazy(() => import('./pages/dashboard/Invitations'));
const Notifications = lazy(() => import('./pages/dashboard/Notifications'));
const Jobs = lazy(() => import('./pages/dashboard/Jobs'));
const GoPro = lazy(() => import('./pages/dashboard/GoPro'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const Wallet = lazy(() => import('./pages/dashboard/Wallet'));

const BusinessLayout = lazy(() => import('./pages/business/BusinessLayout'));
const BusinessApplications = lazy(() => import('./pages/business/Applications'));
const BusinessDashboardHome = lazyNamed('BusinessDashboardHome')(() => import('./pages/business/BusinessDashboardHome'));
const SearchModels = lazy(() => import('./pages/business/SearchModels'));
const BusinessInvitations = lazy(() => import('./pages/business/BusinessInvitations'));
const SavedModels = lazy(() => import('./pages/business/SavedModels'));
const JobRequests = lazy(() => import('./pages/business/JobRequests'));
const Messages = lazy(() => import('./pages/business/Messages'));
const BusinessSettings = lazy(() => import('./pages/business/BusinessSettings'));

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminModels = lazy(() => import('./pages/admin/AdminModels'));
const AdminBusinesses = lazy(() => import('./pages/admin/AdminBusinesses'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminFeatured = lazy(() => import('./pages/admin/AdminFeatured'));
const AdminVerification = lazy(() => import('./pages/admin/AdminVerification'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminCMS = lazy(() => import('./pages/admin/AdminCMS'));
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport'));
const AdminTeam = lazy(() => import('./pages/admin/AdminTeam'));
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAccessDenied = lazyNamed('AdminAccessDenied')(() => import('./pages/AdminAccessDenied'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
  </div>
);

class ChunkErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8F8F8] px-6">
          <p className="text-sm font-bold text-gray-500">Something went wrong loading this page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#111111] text-sm font-bold"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

const ModelJobsDashboard = () => (
  <DashboardLayout>
    <Jobs />
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

const ModelWalletDashboard = () => (
  <DashboardLayout>
    <Wallet />
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

const BizApplications = () => (
  <BusinessLayout>
    <BusinessApplications />
  </BusinessLayout>
);

const BizMessages = () => (
  <BusinessLayout>
    <Messages />
  </BusinessLayout>
);

const BizWallet = () => (
  <BusinessLayout>
    <Wallet />
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
    return <PageLoader />;
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
  if (!convexUser || convexUser.role !== 'admin') {
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
    <ToastProvider>
      <UserProvider>
        <ChunkErrorBoundary>
        <div className="font-sans antialiased text-[#111111] overflow-x-hidden">
        <ScrollToTop />
        <OfflineBanner />
        <UpdateBanner />
        <InstallPrompt />
        {!isDashboard && !isAdmin && <Navbar />}
        <Suspense fallback={<PageLoader />}>
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
          <Route path="/business-dashboard/applications" element={<ProtectedRoute><BizApplications /></ProtectedRoute>} />
          <Route path="/business-dashboard/messages" element={<ProtectedRoute><BizMessages /></ProtectedRoute>} />
          <Route path="/business-dashboard/wallet" element={<ProtectedRoute><BizWallet /></ProtectedRoute>} />
          <Route path="/business-dashboard/settings" element={<ProtectedRoute><BizSettings /></ProtectedRoute>} />
          <Route path="/model-dashboard" element={<ProtectedRoute><ModelDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/profile" element={<ProtectedRoute><ModelProfileDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/portfolio" element={<ProtectedRoute><ModelPortfolioDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/applications" element={<ProtectedRoute><ModelApplicationsDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/invitations" element={<ProtectedRoute><ModelInvitationsDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/jobs" element={<ProtectedRoute><ModelJobsDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/notifications" element={<ProtectedRoute><ModelNotificationsDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/go-pro" element={<ProtectedRoute><ModelGoProDashboard /></ProtectedRoute>} />
          <Route path="/model-dashboard/wallet" element={<ProtectedRoute><ModelWalletDashboard /></ProtectedRoute>} />
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
        </Suspense>
        {!isDashboard && !isAdmin && <Footer />}
        </div>
        </ChunkErrorBoundary>
      </UserProvider>
    </ToastProvider>
  );
}
