import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Phone,
  MessageSquare,
  Award,
  FileText,
  Building
} from 'lucide-react';
import { CeoProfileData, defaultCeoProfile } from '../../data/ceoData';
import { saveCeoProfile, getCachedCeoProfile, subscribeToCeoProfile } from '../../firebase/settingsService';

interface CeoProfileEditorProps {
  onSuccessNotice?: (msg: string) => void;
}

export const CeoProfileEditor: React.FC<CeoProfileEditorProps> = ({ onSuccessNotice }) => {
  const [profile, setProfile] = useState<CeoProfileData>(getCachedCeoProfile);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync with Firestore real-time
  useEffect(() => {
    const unsub = subscribeToCeoProfile((updated) => {
      setProfile(updated);
    });
    return () => unsub();
  }, []);

  const handleChange = (field: keyof CeoProfileData, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCredentialChange = (index: number, value: string) => {
    const updated = [...profile.credentials];
    updated[index] = value;
    setProfile((prev) => ({ ...prev, credentials: updated }));
  };

  const handleAddCredential = () => {
    setProfile((prev) => ({
      ...prev,
      credentials: [...prev.credentials, '']
    }));
  };

  const handleRemoveCredential = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      credentials: prev.credentials.filter((_, i) => i !== index)
    }));
  };

  const handleAchievementChange = (index: number, field: 'number' | 'label' | 'description', value: string) => {
    const updated = [...profile.achievements];
    updated[index] = { ...updated[index], [field]: value };
    setProfile((prev) => ({ ...prev, achievements: updated }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      await saveCeoProfile(profile);
      setStatusMsg({
        type: 'success',
        text: 'CEO Profile & Leadership details saved successfully to Firestore!'
      });
      if (onSuccessNotice) {
        onSuccessNotice('CEO Profile updated globally.');
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Error saving CEO profile to database.'
      });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset CEO Profile to standard Nawabshah Estate Agency defaults?')) {
      setProfile(defaultCeoProfile);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">CEO Profile & Leadership Manager</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage the CEO Profile section displayed on the main website. Changes are stored in Firestore and visible globally.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2.5 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Basic Details & Photo (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Executive Identity & Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">CEO Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Executive Title</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Agency / Organization</label>
                <input
                  type="text"
                  value={profile.organization}
                  onChange={(e) => handleChange('organization', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Office Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Direct WhatsApp Number</label>
                <input
                  type="text"
                  value={profile.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="e.g. 923128983678"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Direct Calling Phone</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. +923128983678"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-semibold">Official Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Photo URL & Live Preview */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              CEO Photograph
            </h3>
            
            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Image URL or Local Asset Path</label>
                <input
                  type="text"
                  value={profile.photoUrl}
                  onChange={(e) => handleChange('photoUrl', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  placeholder="https://... or /src/assets/images/..."
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="w-20 h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                  <img
                    src={profile.photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/estate_agency_office_1790974834547.jpg';
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Portrait image displayed prominently in the CEO section. You can use any high resolution URL or keep the verified studio portrait of Mukhtiar Hussain Jamali.
                </div>
              </div>
            </div>
          </div>

          {/* CEO Executive Message */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              CEO Executive Statement & Vision
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Short Executive Summary</label>
                <textarea
                  rows={2}
                  value={profile.shortBio}
                  onChange={(e) => handleChange('shortBio', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white text-xs focus:border-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Message to Clients & Investors</label>
                <textarea
                  rows={4}
                  value={profile.fullMessage}
                  onChange={(e) => handleChange('fullMessage', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white text-xs focus:border-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Credentials & Milestones (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Achievements */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Key Executive Milestones (4 Badges)
            </h3>

            <div className="space-y-3 text-xs">
              {profile.achievements.map((ach, idx) => (
                <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Stat / Number</label>
                      <input
                        type="text"
                        value={ach.number}
                        onChange={(e) => handleAchievementChange(idx, 'number', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-400 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Label</label>
                      <input
                        type="text"
                        value={ach.label}
                        onChange={(e) => handleAchievementChange(idx, 'label', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white font-semibold text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Description</label>
                    <input
                      type="text"
                      value={ach.description}
                      onChange={(e) => handleAchievementChange(idx, 'description', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credentials */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Professional Credentials
              </h3>
              <button
                type="button"
                onClick={handleAddCredential}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {profile.credentials.map((cred, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cred}
                    onChange={(e) => handleCredentialChange(idx, e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCredential(idx)}
                    className="text-rose-400 hover:text-rose-300 text-xs px-2 py-1 rounded bg-slate-900 hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Firestore Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save CEO Profile to Firestore</span>
                </>
              )}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};
