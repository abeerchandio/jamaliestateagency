import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  MapPin, 
  ArrowRight, 
  Phone, 
  TrendingUp, 
  HeartHandshake,
  Compass
} from 'lucide-react';
import { CompanyInfo } from '../data/companyData';

interface AboutSectionProps {
  company: CompanyInfo;
  onOpenQuoteModal: (preset?: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ company, onOpenQuoteModal }) => {
  return (
    <section id="about" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>About Nawabshah Estate Agency</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            About Nawabshah Estate Agency
          </h2>
          <p className="mt-3 text-base sm:text-lg text-emerald-400 font-medium">
            Dedicated to providing reliable and professional property solutions across Nawabshah.
          </p>
        </div>

        {/* Main Grid: Visuals on Left, Narrative & Pillars on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Office Image & Quick Credentials */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group bg-slate-950">
              <img
                src="/src/assets/images/estate_agency_office_1790974834547.jpg"
                alt="Nawabshah Estate Agency Consultation Office VIP Road"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/70 shadow-lg">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>Main Office Location</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  Main VIP Road, Nawabshah (Shaheed Benazirabad), Sindh, Pakistan
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Open for in-person consultation, property verification, and file reviews.
                </p>
              </div>
            </div>

            {/* Core Values Badge Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 text-center">
                <div className="text-lg font-extrabold text-emerald-400 font-mono">100%</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">Reliable Deals</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 text-center">
                <div className="text-lg font-extrabold text-white font-mono">Transparent</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">Honest Advice</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 text-center">
                <div className="text-lg font-extrabold text-emerald-400 font-mono">Full-Service</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">Buy, Sell & Rent</div>
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Have a property inquiry?</div>
                <div className="text-sm font-bold text-white mt-0.5">{company.displayPhone || "+92 312 8983678"}</div>
              </div>
              <a
                href={`tel:${company.phone || '+923128983678'}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Directly</span>
              </a>
            </div>
          </div>

          {/* Right Column: Exact User About Us Text & Key Pillars */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Primary Narrative Card with Exact User Text */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-800/90 via-slate-800/50 to-slate-900 border border-slate-700/80 shadow-xl relative">
              <div className="space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed">
                <p className="font-normal text-slate-100 first-letter:text-3xl first-letter:font-black first-letter:text-emerald-400 first-letter:mr-1">
                  <strong className="text-white font-bold">Nawabshah Estate Agency</strong> is a trusted real estate agency dedicated to providing reliable and professional property solutions across Nawabshah. We deal in residential, commercial, and investment properties, helping clients buy, sell, rent, and invest with confidence.
                </p>

                <p className="text-slate-300">
                  Our experienced team focuses on transparency, honest advice, and customer satisfaction. We carefully understand each client’s requirements and provide suitable property options according to their budget and preferences.
                </p>

                <p className="text-slate-300">
                  Whether you are looking for your dream home, commercial space, or a profitable investment opportunity, Nawabshah Estate Agency is here to assist you at every step. We aim to build long-term relationships through integrity, professionalism, and dependable real estate services.
                </p>
              </div>
            </div>

            {/* Highlights Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Residential & Commercial</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Prime plots, modern family bungalows, and commercial shops across top Nawabshah sectors.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Investment Opportunities</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Profitable land and property ventures curated with sound market valuation and growth potential.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Tailored to Your Budget</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Personalized consultations to find verified properties matching your specific financial preferences.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Integrity & Transparency</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Honest guidance and long-term client relationships without deceptive middleman margins.
                </p>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => onOpenQuoteModal('Consultation with Property Advisor')}
                className="px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg hover:shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
              >
                <span>Schedule Property Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#ceo"
                className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>View CEO Profile & Leadership</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
