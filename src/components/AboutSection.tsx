import React from 'react';
import { ShieldCheck, Award, Building, CheckCircle2, Users, FileCheck, MapPin } from 'lucide-react';
import { CompanyInfo, trustedGuarantees } from '../data/companyData';

interface AboutSectionProps {
  company: CompanyInfo;
  onOpenQuoteModal: (preset?: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ company, onOpenQuoteModal }) => {
  return (
    <section id="about" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase mb-2">
            About Nawabshah Estate Agency
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            Your Trusted Bridge to Verified Property & Land in Nawabshah
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Established on Main VIP Road in the heart of Nawabshah (Shaheed Benazirabad), {company.name} is the premier property consultancy connecting discerning home buyers, commercial investors, and agricultural landowners with genuine, legally verified properties.
          </p>
        </div>

        {/* Content Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Visual Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl group">
              <img
                src="/src/assets/images/estate_agency_office_1790974834547.jpg"
                alt="Nawabshah Estate Agency modern consultation office on VIP Road"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-300 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-emerald-400">Main VIP Road Office:</span> Visit our consultation lounge for transparent direct buyer-seller meetings and property file verification.
              </div>
            </div>

            {/* Quick Pillars */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="text-lg font-bold text-emerald-400 font-mono">100%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Verified Legal Deeds</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="text-lg font-bold text-white font-mono">0%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Hidden Broker Margins</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="text-lg font-bold text-white font-mono">15+ Yrs</div>
                <div className="text-[11px] text-slate-400 mt-0.5">District Authority</div>
              </div>
            </div>
          </div>

          {/* Details & Guarantees */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Full Legal Due Diligence & Revenue Record Verification</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    We thoroughly investigate Sub-Registrar records, Mukhtiarkar revenue sheets (Deh Form VII), City Survey maps, and non-encumbrance status before facilitating any financial token.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Direct Buyer-to-Seller Transparency</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    No deceptive middleman markups. We arrange direct table meetings between real buyers and registered owners to negotiate fair market prices in a professional atmosphere.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Dedicated Overseas Pakistanis Property Desk</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Serving expatriates in UAE, Saudi Arabia, UK, and USA. We provide video walk-throughs, Power of Attorney verification, safe banking transactions, and physical plot protection.
                  </p>
                </div>
              </div>
            </div>

            {/* Guarantees strip */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Our Non-Negotiable Operational Standards
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trustedGuarantees.map((g) => (
                  <div
                    key={g.label}
                    className="p-2.5 rounded-md bg-slate-800/70 border border-slate-700/70 text-xs text-slate-300 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">{g.label}</div>
                      <div className="text-slate-400 text-[11px]">{g.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenQuoteModal('Consultation with Property Advisor')}
                className="px-5 py-3 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
              >
                Schedule Consultation at VIP Road Office
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
