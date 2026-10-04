import React, { useState } from 'react';
import { X, Check, Database, ExternalLink, AlertCircle, Copy, Info } from 'lucide-react';
import { getActiveFirebaseConfig, saveFirebaseConfig, FirebaseConfigObject } from '../../firebase/config';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const current = getActiveFirebaseConfig();
  const [apiKey, setApiKey] = useState(current.apiKey.includes('YOUR_') ? '' : current.apiKey);
  const [authDomain, setAuthDomain] = useState(current.authDomain.includes('your-project') ? '' : current.authDomain);
  const [projectId, setProjectId] = useState(current.projectId.includes('your-project') ? '' : current.projectId);
  const [storageBucket, setStorageBucket] = useState(current.storageBucket.includes('your-project') ? '' : current.storageBucket);
  const [messagingSenderId, setMessagingSenderId] = useState(current.messagingSenderId.includes('YOUR_') ? '' : current.messagingSenderId);
  const [appId, setAppId] = useState(current.appId.includes('YOUR_') ? '' : current.appId);

  const [rawJson, setRawJson] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Auto parse if user pastes raw object from Firebase console:
  const handleParseRawJson = () => {
    setError('');
    try {
      // Handle either JSON or js object syntax
      let clean = rawJson.trim();
      if (clean.includes('firebaseConfig =')) {
        clean = clean.split('firebaseConfig =')[1];
      }
      if (clean.endsWith(';')) {
        clean = clean.slice(0, -1);
      }
      // Replace unquoted keys
      const formatted = clean.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
      const parsed = JSON.parse(formatted);

      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);

      setShowJsonInput(false);
    } catch (e: any) {
      setError('Could not auto-parse the pasted snippet. Please enter the values in the fields below.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setError('apiKey and projectId are required.');
      return;
    }

    const newConfig: FirebaseConfigObject = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.firebasestorage.app`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    saveFirebaseConfig(newConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-700 mb-1">
          <Database className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Firebase Project Connection
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          Connect Your Firebase Project
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
          Paste your Web App credentials from the{' '}
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 underline font-semibold inline-flex items-center gap-0.5"
          >
            Firebase Console <ExternalLink className="w-3 h-3" />
          </a>
          . Your website will instantly connect to your live Cloud Firestore and Authentication!
        </p>

        {/* Quick Help Box */}
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-700" />
            Where to find these values:
          </div>
          <p className="text-[11px] leading-relaxed">
            1. Open <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">console.firebase.google.com</a> → Select your project.<br/>
            2. Click the gear icon ⚙️ (Project Settings) → General tab.<br/>
            3. Scroll down to <b>"Your apps"</b> → Select your Web App (or click <code>&lt;/&gt;</code> to register one).<br/>
            4. Copy the keys and paste below.
          </p>
        </div>

        {/* Toggle Paste Raw Snippet */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowJsonInput(!showJsonInput)}
            className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
          >
            {showJsonInput ? 'Hide snippet paste' : '⚡ Paste entire firebaseConfig code snippet'}
          </button>

          {showJsonInput && (
            <div className="mt-2 space-y-2">
              <textarea
                rows={4}
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                placeholder="const firebaseConfig = { apiKey: 'AIza...', ... };"
                className="w-full p-2.5 text-xs font-mono bg-slate-900 text-emerald-300 rounded-lg border border-slate-700"
              />
              <button
                type="button"
                onClick={handleParseRawJson}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold"
              >
                Auto-Fill Fields
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
              apiKey <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                projectId <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="nawabshah-estate-123"
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                authDomain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="your-project.firebaseapp.com"
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
              storageBucket
            </label>
            <input
              type="text"
              value={storageBucket}
              onChange={(e) => setStorageBucket(e.target.value)}
              placeholder="your-project.firebasestorage.app"
              className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                messagingSenderId
              </label>
              <input
                type="text"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                placeholder="123456789012"
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                appId
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:12345:web:abcdef"
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
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
              <span>Save & Connect Firebase</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
