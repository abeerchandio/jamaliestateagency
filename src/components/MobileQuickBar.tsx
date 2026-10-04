import React from 'react';
import { Phone, MessageCircle, Home } from 'lucide-react';
import { CompanyInfo } from '../data/companyData';

interface MobileQuickBarProps {
  company: CompanyInfo;
  onOpenQuoteModal: () => void;
}

export const MobileQuickBar: React.FC<MobileQuickBarProps> = ({ company, onOpenQuoteModal }) => {
  const cleanWhatsapp = company.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Assalam-o-Alaikum ${company.name}, I need urgent information regarding available plots/property in Nawabshah.`
  )}`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-between gap-2 shadow-2xl">
      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </a>

      {/* Call Button */}
      <a
        href={`tel:${company.phone}`}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors"
      >
        <Phone className="w-3.5 h-3.5 text-emerald-400" />
        <span>Call</span>
      </a>

      {/* Inquire Button */}
      <button
        onClick={onOpenQuoteModal}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Inquire</span>
      </button>
    </div>
  );
};
