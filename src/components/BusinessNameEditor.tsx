import React, { useState } from 'react';
import { X, Check, RotateCcw, Building } from 'lucide-react';
import { CompanyInfo, defaultCompanyInfo } from '../data/companyData';

interface BusinessNameEditorProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyInfo;
  onSave: (updated: CompanyInfo) => void;
}

export const BusinessNameEditor: React.FC<BusinessNameEditorProps> = ({
  isOpen,
  onClose,
  company,
  onSave
}) => {
  const [name, setName] = useState(company.name);
  const [displayPhone, setDisplayPhone] = useState(company.displayPhone);
  const [phone, setPhone] = useState(company.phone);
  const [whatsapp, setWhatsapp] = useState(company.whatsappNumber);
  const [email, setEmail] = useState(company.email);
  const [address, setAddress] = useState(company.address);
  const [city, setCity] = useState(company.city);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CompanyInfo = {
      ...company,
      name: name.trim() || defaultCompanyInfo.name,
      displayPhone: displayPhone.trim() || defaultCompanyInfo.displayPhone,
      phone: phone.trim() || defaultCompanyInfo.phone,
      whatsappNumber: whatsapp.trim() || defaultCompanyInfo.whatsappNumber,
      displayWhatsapp: displayPhone.trim() || defaultCompanyInfo.displayWhatsapp,
      email: email.trim() || defaultCompanyInfo.email,
      address: address.trim() || defaultCompanyInfo.address,
      city: city.trim() || defaultCompanyInfo.city
    };
    onSave(updated);
    onClose();
  };

  const handleResetToDefault = () => {
    setName(defaultCompanyInfo.name);
    setDisplayPhone(defaultCompanyInfo.displayPhone);
    setPhone(defaultCompanyInfo.phone);
    setWhatsapp(defaultCompanyInfo.whatsappNumber);
    setEmail(defaultCompanyInfo.email);
    setAddress(defaultCompanyInfo.address);
    setCity(defaultCompanyInfo.city);
    onSave(defaultCompanyInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          aria-label="Close editor"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-emerald-700">
          <Building className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Agency Details Customizer</span>
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          Estate Agency Identity
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
          Update the real estate agency name, phone, WhatsApp, and office address. Changes persist automatically and update across the entire site.
        </p>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estate Agency Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nawabshah Estate Agency"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Phone
              </label>
              <input
                type="text"
                value={displayPhone}
                onChange={(e) => setDisplayPhone(e.target.value)}
                placeholder="+92 300 555-7890"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Direct Dial Tel
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+923005557890"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp (Digits Only)
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="923005557890"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Nawabshah, Sindh"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Office Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Main VIP Road, Opposite Press Club"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@nawabshahestate.com"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Default
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
