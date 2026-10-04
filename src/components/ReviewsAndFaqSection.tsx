import React, { useState } from 'react';
import { clientReviews, CompanyInfo } from '../data/companyData';
import { Star, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface ReviewsAndFaqSectionProps {
  company: CompanyInfo;
}

export const ReviewsAndFaqSection: React.FC<ReviewsAndFaqSectionProps> = ({ company }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do you verify property ownership records and revenue files in Nawabshah?',
      a: 'We conduct a strict legal search directly with the Sub-Registrar office, Mukhtiarkar revenue department, and City Survey office. We examine Deh Form VII, Mutation (Inteqal), Fard, non-encumbrance certificates, and verified bank mortgage records to guarantee 100% clean, dispute-free title before you pay any token.'
    },
    {
      q: 'Can Overseas Pakistanis safely buy or sell property in Nawabshah without traveling?',
      a: 'Yes. We run a dedicated Overseas Pakistanis property desk. We arrange live video tours, physically inspect plots, coordinate through Special Power of Attorney (verified by the Pakistani Embassy/Consulate), and ensure direct banking channel remittances with full transparency.'
    },
    {
      q: 'What is the procedure for purchasing a plot in Society Phase 1 or Phase 2?',
      a: 'After selecting your preferred plot and completing direct negotiations with the registered owner, we verify the allotment order, NDC (No Demand Certificate), and utility dues with the society management. The transfer is finalized through biometric verification and official society transfer deeds.'
    },
    {
      q: 'How do you verify canal water shares (Waara) and soil quality for agricultural land?',
      a: 'For agricultural acreage along Rohri Canal or local distributaries, we check the official irrigation department water turn schedule (Irrigation Sanad / Waara), test tube-well water salinity/TDS, and review land revenue tax (Dhal) records with the local Tapedar.'
    },
    {
      q: 'Where is your main office located in Nawabshah?',
      a: 'Our central office is located prominently on Main VIP Road, directly opposite the Press Club and Civic Center in Nawabshah (Shaheed Benazirabad). You are welcome to visit six days a week for property consultations.'
    }
  ];

  return (
    <section className="py-20 bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1">
            Client Trust & Testimonials
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            Trusted by Doctors, Landowners & Overseas Families
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Read real feedback from clients who safely bought and sold properties through {company.name}.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {clientReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-emerald-400 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "{rev.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <div className="font-bold text-sm text-white">{rev.client}</div>
                <div className="text-xs text-slate-400">{rev.role}</div>
                <div className="text-xs text-emerald-400 font-medium mt-0.5">{rev.location}</div>
                <div className="text-[11px] text-slate-500 mt-2">Transaction: {rev.dealType}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto pt-8 border-t border-slate-800">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              Frequently Asked Property Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Common inquiries regarding buying, selling, legal registry, and land documentation in Nawabshah.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
