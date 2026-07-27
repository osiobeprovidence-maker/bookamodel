/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ModelWall } from './pages/ModelWall';
import { ModelProfile } from './pages/ModelProfile';
import { BusinessDashboard } from './pages/BusinessDashboard';
import { CreateProfile } from './pages/CreateProfile';
import { CreateInvitation } from './pages/CreateInvitation';
import { Pricing } from './pages/Pricing';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AboutPage } from './pages/About';
import { ContactPage } from './pages/Contact';
import { TermsPage } from './pages/Terms';
import { PrivacyPage } from './pages/Privacy';
import { HelpPage } from './pages/Help';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { ModelDashboardHome } from './pages/dashboard/ModelDashboardHome';
import MyProfile from './pages/dashboard/MyProfile';
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
import { useEffect } from 'react';
import { UserProvider } from './contexts/UserContext';
import { ToastProvider } from './components/ui/Toast';

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

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.includes('dashboard');

  return (
    <UserProvider>
      <ToastProvider>
        <div className="font-sans antialiased text-[#111111] overflow-x-hidden">
        <ScrollToTop />
        {!isDashboard && <Navbar />}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ModelWall />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/models" element={<ModelWall />} />
          <Route path="/profile/:id" element={<ModelProfile />} />
          <Route path="/business-dashboard" element={<BizDashboard />} />
          <Route path="/business-dashboard/search" element={<BizSearch />} />
          <Route path="/business-dashboard/invitations" element={<BizInvitations />} />
          <Route path="/business-dashboard/saved" element={<BizSaved />} />
          <Route path="/business-dashboard/jobs" element={<BizJobs />} />
          <Route path="/business-dashboard/messages" element={<BizMessages />} />
          <Route path="/business-dashboard/settings" element={<BizSettings />} />
          <Route path="/model-dashboard" element={<ModelDashboard />} />
          <Route path="/model-dashboard/profile" element={<ModelProfileDashboard />} />
          <Route path="/model-dashboard/portfolio" element={<ModelPortfolioDashboard />} />
          <Route path="/model-dashboard/applications" element={<ModelApplicationsDashboard />} />
          <Route path="/model-dashboard/invitations" element={<ModelInvitationsDashboard />} />
          <Route path="/model-dashboard/notifications" element={<ModelNotificationsDashboard />} />
          <Route path="/model-dashboard/go-pro" element={<ModelGoProDashboard />} />
          <Route path="/model-dashboard/settings" element={<ModelSettingsDashboard />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/invite/:id" element={<CreateInvitation />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
        {!isDashboard && <Footer />}
        </div>
      </ToastProvider>
    </UserProvider>
  );
}
