import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Menu, 
  X, 
  ArrowUpRight, 
  Edit3, 
  Building, 
  ChevronDown, 
  History, 
  Calculator 
} from 'lucide-react';
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
  isAdminLoggedIn
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Properties', href: '#properties' },
    { label: 'About Us', href: '#about' },
    { label: 'CEO Profile', href: '#ceo' },
    { label: 'Services', href: '#services' },
    { label: 'Recent Deals', href: '#deals' },
    { label: 'Area Calculator', href: '#calculator' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3 xl:gap-4">
        
        {/* Zone 1: Brand Wordmark (shrink-0 so it NEVER squishes or overlaps) */}
        <div className="flex items-center gap-2 shrink-0">
          <a 
            href="#home" 
            className="flex items-center gap-2 sm:gap-2.5 text-base sm:text-lg xl:text-xl font-bold tracking-tight text-slate-900 group shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black shadow-sm shrink-0">
              <Building className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="whitespace-nowrap text-slate-900 group-hover:text-emerald-700 transition-colors">
              {company.name}
            </span>
          </a>

          <button
            onClick={onOpenNameEditor}
            title="Edit agency name or contact details"
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors hidden sm:inline-flex shrink-0"
            aria-label="Edit business name"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean, single-line, whitespace-nowrap, no wrapping/collisions) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-semibold text-slate-600">
          <button
            onClick={() => handleNavClick('#home')}
            className="px-2 xl:px-2.5 py-1.5 whitespace-nowrap rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('#properties')}
            className="px-2 xl:px-2.5 py-1.5 whitespace-nowrap rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Properties
          </button>
          <button
            onClick={() => handleNavClick('#about')}
            className="px-2 xl:px-2.5 py-1.5 whitespace-nowrap rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            About Us
          </button>
          <button
            onClick={() => handleNavClick('#ceo')}
            className="px-2 xl:px-2.5 py-1.5 whitespace-nowrap rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            CEO Profile
          </button>
          <button
            onClick={() => handleNavClick('#services')}
            className="px-2 xl:px-2.5 py-1.5 whitespace-nowrap rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Services
          </button>

          {/* More Dropdown for Secondary Tools (Deals & Calculator) */}
          <div className="relative" ref={moreDropdownRef}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`flex items-center gap-1 px-2 xl:px-2.5 py-1.5 whitespace-nowrap rounded-lg transition-colors cursor-pointer ${
                moreMenuOpen
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'hover:text-emerald-700 hover:bg-slate-100'
              }`}
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreMenuOpen && (
              <div className="absolute top-full right-0 sm:left-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150">
                <button
                  onClick={() => handleNavClick('#deals')}
                  className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800">Recent Deals</div>
                    <div className="text-[10px] text-slate-500 font-normal">Closed transactions in Nawabshah</div>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('#calculator')}
                  className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800">Area Calculator</div>
                    <div className="text-[10px] text-slate-500 font-normal">Sindh Acre, Ghunta & Sq.Ft</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavClick('#contact')}
            className="px-2 xl:px-2.5 py-1.5 whitespace-nowrap rounded-lg hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Protected with shrink-0 and compact styling) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer border whitespace-nowrap ${
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
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={() => onOpenQuoteModal('Submit / Inquire Property')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer"
          >
            <span>Submit Property</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
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
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none cursor-pointer"
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
