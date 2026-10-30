import React from 'react';
import {
  ShieldCheck,
  Award,
  Phone,
  MessageCircle,
  CheckCircle2,
  Calendar,
  Building,
  Briefcase,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { CeoProfileData } from '../data/ceoData';

interface CeoProfileProps {
  ceoData: CeoProfileData;
  onOpenQuoteModal: (preset?: string) => void;
}

export const CeoProfile: React.FC<CeoProfileProps> = ({ ceoData, onOpenQuoteModal }) => {
  const cleanWhatsapp = ceoData.whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Assalam-o-Alaikum Mr. ${ceoData.name}, I am reaching out directly from the Nawabshah Estate Agency website for an executive property consultation.`
  )}`;

  return (
    <section id="ceo" className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-b border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wider uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Executive Leadership & Advisory
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            Meet Our Founder &amp; Chief Officer
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Direct executive guidance for residential plots, commercial investments, and agricultural farmland in Nawabshah (Shaheed Benazirabad) with 100% legal title assurance.
          </p>
        </div>

        {/* Main CEO Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Column 1: Portrait & Quick Credentials (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
              {/* Portrait */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={ceoData.photoUrl}
                  alt={`${ceoData.name} - ${ceoData.title}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to local asset if needed
                    (e.target as HTMLImageElement).src = '/src/assets/images/ceo_mukhtiar_jamali.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Executive floating badge */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">{ceoData.name}</h3>
                      <p className="text-xs font-medium text-emerald-400">{ceoData.title}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ceoData.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-emerald-900/40 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Message CEO Directly on WhatsApp</span>
              </a>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${ceoData.phone}`}
                  className="py-3 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Office Line</span>
                </a>
                <button
                  onClick={() => onOpenQuoteModal(`Executive Property Consultation with CEO ${ceoData.name}`)}
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>

            {/* Credentials List */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Professional Credentials
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {ceoData.credentials.map((cred, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{cred}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 2: Executive Bio, Philosophy, Numbers & Commitments (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* CEO Statement / Message */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Executive Statement
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    "A Promise of 100% Verified Titles & Zero Middleman Distortion"
                  </h3>
                </div>
              </div>

              <blockquote className="text-sm sm:text-base text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/40 pl-4 py-1">
                "{ceoData.fullMessage}"
              </blockquote>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                <div>
                  <div className="font-bold text-white">{ceoData.name}</div>
                  <div className="text-slate-400 text-[11px]">{ceoData.title}, {ceoData.organization}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-400 font-semibold">Serving Nawabshah & Sindh</span>
                  <div className="text-[10px] text-slate-500 font-mono">Verified Signatory</div>
                </div>
              </div>
            </div>

            {/* Performance Milestones */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Executive Track Record in Shaheed Benazirabad
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ceoData.achievements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                      {item.number}
                    </div>
                    <div className="text-xs font-bold text-white mt-1">
                      {item.label}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Founder Commitments */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Guarantees to Property Buyers & Sellers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                {ceoData.commitments.map((commitment, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                      ✓
                    </div>
                    <span className="leading-relaxed">{commitment}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overseas Desk Callout */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-400">
                  Overseas Pakistani Dedicated Advisory Desk
                </div>
                <p className="text-xs text-slate-300">
                  Are you living in the UAE, Saudi Arabia, UK, or USA? Connect directly with Founder &amp; Chief Officer {ceoData.name} for trusted video tours, title checks, and secure funds transfer.
                </p>
              </div>
              <button
                onClick={() => onOpenQuoteModal('Overseas Pakistani Advisory Desk - CEO Consultation')}
                className="shrink-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Inquire via Overseas Desk
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
