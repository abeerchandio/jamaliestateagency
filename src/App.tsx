/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { defaultCompanyInfo, CompanyInfo } from './data/companyData';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PropertiesSection } from './components/PropertiesSection';
import { ServicesSection } from './components/ServicesSection';
import { RecentDealsSection } from './components/RecentDealsSection';
import { PropertyCalculator } from './components/PropertyCalculator';
import { AboutSection } from './components/AboutSection';
import { ReviewsAndFaqSection } from './components/ReviewsAndFaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MobileQuickBar } from './components/MobileQuickBar';
import { QuoteModal } from './components/QuoteModal';
import { BusinessNameEditor } from './components/BusinessNameEditor';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { FirebaseConfigModal } from './components/admin/FirebaseConfigModal';
import { subscribeToAuthState, AdminAuthState } from './firebase/authService';

export default function App() {
  const [company, setCompany] = useState<CompanyInfo>(() => {
    try {
      localStorage.removeItem('voltix_company_info');
      const saved = localStorage.getItem('nawabshah_estate_agency_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name.includes('Nawabshah')) {
          // If stored phone was the placeholder, overwrite with new phone
          if (!parsed.phone || parsed.phone.includes('300555')) {
            parsed.phone = defaultCompanyInfo.phone;
            parsed.displayPhone = defaultCompanyInfo.displayPhone;
            parsed.whatsappNumber = defaultCompanyInfo.whatsappNumber;
            parsed.displayWhatsapp = defaultCompanyInfo.displayWhatsapp;
          }
          return { ...defaultCompanyInfo, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return defaultCompanyInfo;
  });

  // Admin and Auth state
  const [authState, setAuthState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    loading: true,
    error: null
  });

  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin';
  });

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [firebaseConfigModalOpen, setFirebaseConfigModalOpen] = useState(false);

  // Modals for public site
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quotePreset, setQuotePreset] = useState('');
  const [nameEditorOpen, setNameEditorOpen] = useState(false);
  const [contactInitialScope, setContactInitialScope] = useState('');
  const [contactInitialService, setContactInitialService] = useState('buy');

  // Search filter passed from Hero to Properties
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((state) => {
      setAuthState(state);
    });
    return () => unsubscribe();
  }, []);

  // Listen to browser path / hash changes for /admin
  useEffect(() => {
    const handlePopState = () => {
      const isPathAdmin = window.location.pathname === '/admin' || window.location.hash === '#admin';
      setIsAdminView(isPathAdmin);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Persist updated company details to localStorage
  const handleSaveCompany = (updated: CompanyInfo) => {
    setCompany(updated);
    try {
      localStorage.setItem('nawabshah_estate_agency_info', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleOpenQuoteModal = (preset?: string) => {
    setQuotePreset(preset || '');
    setQuoteModalOpen(true);
  };

  const handleSelectService = (serviceName: string) => {
    setQuotePreset(`Inquiry regarding real estate service: ${serviceName}`);
    setQuoteModalOpen(true);
  };

  const handleSelectProperty = (propertyTitle: string) => {
    setQuotePreset(`Inquiry for property listing: ${propertyTitle}`);
    setQuoteModalOpen(true);
  };

  const handleApplyCalculation = (calcSummary: string) => {
    setContactInitialScope(calcSummary);
    setContactInitialService('buy');
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroFilter = (type: string, location: string) => {
    setFilterType(type);
    setFilterLocation(location);
  };

  const handleOpenAdminTrigger = () => {
    if (authState.isAdmin) {
      setIsAdminView(true);
      window.location.hash = '#admin';
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminView(true);
    window.location.hash = '#admin';
  };

  const handleBackToPublic = () => {
    setIsAdminView(false);
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
  };

  // Sync document title
  useEffect(() => {
    if (isAdminView) {
      document.title = `Admin Portal – ${company.name}`;
    } else {
      document.title = `${company.name} – Verified Real Estate & Plots in Nawabshah`;
    }
  }, [company.name, isAdminView]);

  // If user requests admin view but is not an authorized admin, show login or redirect
  if (isAdminView) {
    if (authState.isAdmin) {
      return (
        <AdminDashboard
          onBackToPublicSite={handleBackToPublic}
          onOpenFirebaseConfig={() => setFirebaseConfigModalOpen(true)}
        />
      );
    } else {
      // Unauthorized user trying to access /admin -> Prompt Login
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center mx-auto text-emerald-400">
              🔒
            </div>
            <h2 className="text-xl font-extrabold text-white">Administrator Access Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Admin Dashboard is restricted to authorized personnel of {company.name}.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Log In as Administrator
              </button>
              <button
                onClick={handleBackToPublic}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Return to Public Website
              </button>
            </div>
          </div>

          <AdminLoginModal
            isOpen={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
            onSuccess={handleAdminLoginSuccess}
            onOpenConfigModal={() => setFirebaseConfigModalOpen(true)}
          />

          <FirebaseConfigModal
            isOpen={firebaseConfigModalOpen}
            onClose={() => setFirebaseConfigModalOpen(false)}
          />
        </div>
      );
    }
  }

  // Public Website Render
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation Bar with Admin & Firebase Triggers */}
      <Navbar
        company={company}
        onOpenNameEditor={() => setNameEditorOpen(true)}
        onOpenQuoteModal={handleOpenQuoteModal}
        onOpenAdmin={handleOpenAdminTrigger}
        onOpenFirebaseConfig={() => setFirebaseConfigModalOpen(true)}
        isAdminLoggedIn={authState.isAdmin}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with Real Estate Search Bar */}
        <Hero
          company={company}
          onOpenQuoteModal={handleOpenQuoteModal}
          onFilterProperties={handleHeroFilter}
        />

        {/* 2. Featured Properties & Plots in Nawabshah (Real-Time Firestore) */}
        <PropertiesSection
          company={company}
          onSelectProperty={handleSelectProperty}
          filterType={filterType}
          filterLocation={filterLocation}
        />

        {/* 3. Real Estate Brokerage Services */}
        <ServicesSection
          onSelectService={handleSelectService}
        />

        {/* 4. Recent Deals & Notable Case Studies */}
        <RecentDealsSection />

        {/* 5. Sindh Land Area Converter & Installment Estimator */}
        <PropertyCalculator
          onApplyCalculation={handleApplyCalculation}
        />

        {/* 6. About Nawabshah Estate Agency & Guarantees */}
        <AboutSection
          company={company}
          onOpenQuoteModal={handleOpenQuoteModal}
        />

        {/* 7. Client Reviews & Nawabshah Property FAQs */}
        <ReviewsAndFaqSection
          company={company}
        />

        {/* 8. Contact Us Section with VIP Road Google Map & WhatsApp */}
        <ContactSection
          company={company}
          initialMessage={contactInitialScope}
          initialService={contactInitialService}
        />
      </main>

      {/* Footer */}
      <Footer
        company={company}
        onOpenNameEditor={() => setNameEditorOpen(true)}
      />

      {/* Mobile Sticky Quick Bar (WhatsApp + Call) */}
      <MobileQuickBar
        company={company}
        onOpenQuoteModal={() => handleOpenQuoteModal('Mobile Quick Property Inquiry')}
      />

      {/* Property Inquiry / Listing Modal */}
      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        company={company}
        presetScope={quotePreset}
      />

      {/* Agency Identity & Contact Customizer Modal */}
      <BusinessNameEditor
        isOpen={nameEditorOpen}
        onClose={() => setNameEditorOpen(false)}
        company={company}
        onSave={handleSaveCompany}
      />

      {/* Administrator Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        onOpenConfigModal={() => setFirebaseConfigModalOpen(true)}
      />

      {/* Firebase Project Connection Modal */}
      <FirebaseConfigModal
        isOpen={firebaseConfigModalOpen}
        onClose={() => setFirebaseConfigModalOpen(false)}
      />
    </div>
  );
}
