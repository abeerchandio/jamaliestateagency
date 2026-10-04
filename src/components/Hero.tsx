import React, { useState } from 'react';
import { ArrowRight, Phone, MessageCircle, ShieldCheck, CheckCircle2, Search, MapPin, Building, Home, Tractor } from 'lucide-react';
import { CompanyInfo } from '../data/companyData';

interface HeroProps {
  company: CompanyInfo;
  onOpenQuoteModal: (preset?: string) => void;
  onFilterProperties?: (type: string, location: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ company, onOpenQuoteModal, onFilterProperties }) => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');

  const cleanWhatsapp = company.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Assalam-o-Alaikum ${company.name}, I am looking to buy/sell property in Nawabshah. Please share current available options.`
  )}`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilterProperties) {
      onFilterProperties(selectedType, selectedArea);
    }
    const propSection = document.getElementById('properties');
    if (propSection) {
      propSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative bg-slate-950 text-white overflow-hidden">
      {/* Background Hero Image with Measured Gradient Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_nawabshah_villas_1790974799226.jpg"
          alt="Luxury residential villas and real estate properties in Nawabshah"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20">
        
        {/* Editorial Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-900/90 border border-slate-800 text-xs text-slate-300 mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-400">Shaheed Benazirabad’s Most Trusted Agency</span>
          <span className="text-slate-500">·</span>
          <span>100% Verified Legal Records</span>
        </div>

        {/* Marquee Headline */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight text-balance">
            {company.name}
          </h1>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-400">
            Plots, Luxury Houses, Commercial Plazas & Agricultural Land
          </p>
          
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {company.shortDescription}
          </p>

          {/* Value Proof Badges */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Society Phase 1 & 2 Prime Plots & Luxury Homes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>VIP Road High Rental Commercial Plazas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Rohri Canal Irrigated Fertile Mango Farms</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sub-Registrar Registry & Legal Mutation Assistance</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="#properties"
              className="px-6 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <span>Explore Verified Listings</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 text-sm font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-lg transition-colors flex items-center gap-2.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Property Desk</span>
            </a>

            <a
              href={`tel:${company.phone}`}
              className="px-4 py-3.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{company.displayPhone}</span>
            </a>
          </div>
        </div>

        {/* Quick Property Search Bar */}
        <div className="mt-12 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Property Category
              </label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Properties (Plots, Homes, Commercial)</option>
                  <option value="residential_plot">Residential Plots (120, 200, 400 Sq. Yds)</option>
                  <option value="house">Ready Luxury Houses & Bungalows</option>
                  <option value="commercial">Commercial Plazas, Shops & Showrooms</option>
                  <option value="agricultural">Agricultural Land & Mango Orchards</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Nawabshah Location / Sector
              </label>
              <div className="relative">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Sectors in Nawabshah</option>
                  <option value="society">Society Phase 1 & 2</option>
                  <option value="vip">Main VIP Road & Civic Center</option>
                  <option value="airport">Airport Road & Taj Colony</option>
                  <option value="court">Court Road & Officers Colony</option>
                  <option value="agricultural">Sakrand / Rohri Canal Agricultural Belt</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2 pt-2 sm:pt-5">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

          </form>
        </div>

        {/* Quantified Real Estate Rigor Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">1,250+</div>
            <div className="text-xs text-slate-400 mt-1">Verified Deals Closed Successfully</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">100%</div>
            <div className="text-xs text-slate-400 mt-1">Legal Title & Revenue Verification</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">15+ Years</div>
            <div className="text-xs text-slate-400 mt-1">Trusted Nawabshah Market Authority</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">PKR 30+ Cr</div>
            <div className="text-xs text-slate-400 mt-1">Annual Managed Property Portfolio</div>
          </div>
        </div>

      </div>
    </section>
  );
};
