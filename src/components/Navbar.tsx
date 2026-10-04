import React, { useState } from 'react';
import { Phone, MessageCircle, Menu, X, ArrowUpRight, Edit3, Building } from 'lucide-react';
import { CompanyInfo } from '../data/companyData';

interface NavbarProps {
  company: CompanyInfo;
  onOpenNameEditor: () => void;
  onOpenQuoteModal: (preset?: string) => void;
  onOpenAdmin: () => void;
  onOpenFirebaseConfig: () => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  company,
  onOpenNameEditor,
  onOpenQuoteModal,
  onOpenAdmin,
  onOpenFirebaseConfig,
  isAdminLoggedIn
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Properties', href: '#properties' },
    { label: 'Services', href: '#services' },
    { label: 'Recent Deals', href: '#deals' },
    { label: 'Area Calculator', href: '#calculator' },
    { label: 'About Us', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cleanWhatsapp = company.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Assalam-o-Alaikum ${company.name}, I am looking for property (Plot/House/Commercial/Agricultural) in Nawabshah.`
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      {/* Top Bar Contract: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single element wordmark */}
        <div className="flex items-center gap-2 min-w-0">
          <a 
            href="#home" 
            className="flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-tight text-slate-900 group shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black shadow-sm">
              <Building className="w-5 h-5" />
            </div>
            <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
              {company.name}
            </span>
          </a>

          <button
            onClick={onOpenNameEditor}
            title="Edit agency name or contact details"
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors hidden sm:inline-flex"
            aria-label="Edit business name"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="hover:text-emerald-700 transition-colors py-1 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
              isAdminLoggedIn
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title="Admin Dashboard Portal"
          >
            <span>{isAdminLoggedIn ? 'Admin Portal' : 'Admin Login'}</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={() => onOpenQuoteModal('Submit / Inquire Property')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer"
          >
            <span>Submit Property</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={`tel:${company.phone}`}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg sm:hidden"
            aria-label="Call business"
          >
            <Phone className="w-5 h-5 text-emerald-700" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs text-slate-500">
            <span>Nawabshah Property Navigation</span>
            <button
              onClick={onOpenNameEditor}
              className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
            >
              <Edit3 className="w-3 h-3" /> Edit Details
            </button>
          </div>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-left px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 rounded-md transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              WhatsApp
            </a>

            <a
              href={`tel:${company.phone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg"
            >
              <Phone className="w-4 h-4 text-slate-700" />
              Call Now
            </a>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenQuoteModal('Submit Property for Sale');
            }}
            className="w-full py-3 px-4 text-center text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-sm cursor-pointer"
          >
            Inquire or List Your Property
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmin();
            }}
            className="w-full py-2 text-center text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{isAdminLoggedIn ? 'Open Admin Dashboard' : 'Administrator Login'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
