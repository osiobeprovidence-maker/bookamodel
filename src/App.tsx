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
import { ModelDashboard } from './pages/ModelDashboard';
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
import { useEffect } from 'react';
import { UserProvider } from './contexts/UserContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.includes('dashboard');

  return (
    <UserProvider>
      <div className="font-sans antialiased text-[#111111]">
        <ScrollToTop />
        {!isDashboard && <Navbar />}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ModelWall />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/models" element={<ModelWall />} />
          <Route path="/profile/:id" element={<ModelProfile />} />
          <Route path="/business-dashboard" element={<BusinessDashboard />} />
          <Route path="/model-dashboard" element={<ModelDashboard />} />
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
    </UserProvider>
  );
}
