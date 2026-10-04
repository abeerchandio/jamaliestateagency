import React from 'react';
import { CompanyInfo } from '../data/companyData';
import { Phone, MessageCircle, Mail, MapPin, ShieldCheck, ArrowUp, Building } from 'lucide-react';

interface FooterProps {
  company: CompanyInfo;
  onOpenNameEditor: () => void;
}

export const Footer: React.FC<FooterProps> = ({ company, onOpenNameEditor }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanWhatsapp = company.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}`;

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                <Building className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                {company.name}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pr-4">
              Nawabshah's premier real estate consultancy. Delivering 100% legally verified residential plots, luxury bungalows, high-yield VIP Road commercial plazas, and fertile agricultural farmland across Shaheed Benazirabad district.
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Clear Title Verification · Zero Fraud Guarantee</span>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenNameEditor}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
              >
                Customize Agency Name / Phone Numbers
              </button>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#home" className="hover:text-emerald-400 transition-colors">Home Page</a></li>
              <li><a href="#properties" className="hover:text-emerald-400 transition-colors">Property Listings</a></li>
              <li><a href="#services" className="hover:text-emerald-400 transition-colors">Real Estate Services</a></li>
              <li><a href="#deals" className="hover:text-emerald-400 transition-colors">Closed Transactions</a></li>
              <li><a href="#calculator" className="hover:text-emerald-400 transition-colors">Sindh Area Converter</a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">About Our Agency</a></li>
              <li><a href="#contact" className="hover:text-emerald-400 transition-colors">Contact Our Office</a></li>
            </ul>
          </div>

          {/* Prime Sectors in Nawabshah */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Top Locations
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Society Phase 1 & 2 Plots</li>
              <li>Main VIP Road Commercial</li>
              <li>Airport Road & Taj Colony</li>
              <li>Court Road & Officers Colony</li>
              <li>Rohri Canal Agricultural Belt</li>
              <li>Sakrand / Jam Sahib Farmland</li>
              <li>Qazi Ahmed Bypass Commercial</li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Direct Contact
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={`tel:${company.phone}`} className="hover:text-white font-mono">
                  {company.displayPhone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp: {company.displayWhatsapp}
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={`mailto:${company.email}`} className="hover:text-white font-mono truncate">
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-slate-300 pt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">{company.address}, {company.city}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {company.name}. All rights reserved. Trusted Real Estate & Property Consultants in Shaheed Benazirabad, Sindh.
          </div>

          <div className="flex items-center gap-6">
            <span>Sub-Registrar Certified Verification</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
