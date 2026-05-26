import React, { useState } from 'react';
import { Lock, Webhook } from 'lucide-react';

interface LoginModalProps {
  onLogin: () => void;
  onCancel: () => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
}

export default function LoginModal({ onLogin, onCancel, apiUrl, setApiUrl }: LoginModalProps) {
  const [password, setPassword] = useState('');
  const [errorString, setErrorString] = useState('');
  const [inputUrl, setInputUrl] = useState(apiUrl);
  
  // Only require URL input if the system doesn't already have one embedded in env variables
  const needsUrl = !import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorString('');
    
    if (needsUrl && !inputUrl.trim()) {
      setErrorString('Please enter your Google Apps Script URL.');
      return;
    }

    if (password === 'admin17') {
      if (needsUrl) {
         setApiUrl(inputUrl.trim());
      }
      onLogin();
    } else {
      setErrorString('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-[100] backdrop-blur-sm" id="admin-login-modal">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        
        <div className="flex flex-col items-center mb-6">
          <div className="bg-ocean-light p-3 rounded-full text-ocean-dark mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-ocean-dark">
            Admin Portal Access
          </h2>
          <p className="text-xs text-slate-500 text-center mt-2">
            Sign in to modify your portfolio. Optionally enter your Apps Script Web App URL for Netlify backend persistence.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {needsUrl && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                Google Apps Script Web App URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Webhook className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-accent focus:border-transparent outline-none transition-all text-sm mb-1"
                  placeholder="https://script.google.com/macros/s/..."
                />
              </div>
              <p className="text-[10px] items-center text-slate-400 mt-1">Make sure it's deployed as 'Execute as: Me' and 'Access: Anyone'.</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-accent focus:border-transparent outline-none transition-all text-sm"
              placeholder="Enter password"
              autoFocus
              id="admin-password-input"
            />
          </div>

          {errorString && (
            <p className="text-red-500 text-xs font-medium" id="login-error-text">
              {errorString}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm font-semibold shadow-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-ocean-dark text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold shadow-md inline-flex items-center justify-center cursor-pointer"
            >
              Verify Access
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
