import React, { useState, useEffect } from 'react';
import { Lock, FileSpreadsheet } from 'lucide-react';
import { googleSignIn, initAuth, getAccessToken } from '../utils/googleSheets';

interface LoginModalProps {
  onLogin: () => void;
  onCancel: () => void;
  sheetId: string;
  setSheetId: (id: string) => void;
}

export default function LoginModal({ onLogin, onCancel, sheetId, setSheetId }: LoginModalProps) {
  const [errorString, setErrorString] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [requiresSheetId, setRequiresSheetId] = useState(!sheetId);
  const [inputSheetId, setInputSheetId] = useState(sheetId);

  useEffect(() => {
    return initAuth(
      (user, token) => {
        // User auto-logged in, but wait for them to click "Verify Access" or automatically login if we have a Sheet ID
      },
      () => {}
    );
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorString('');
    try {
      if (requiresSheetId) {
        if (!inputSheetId.trim()) {
          setErrorString('Please enter a valid Google Sheets ID.');
          setIsLoggingIn(false);
          return;
        }
        setSheetId(inputSheetId.trim());
      }

      const result = await googleSignIn();
      if (result) {
        onLogin();
      }
    } catch (err: any) {
      setErrorString(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
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
            Sign in with Google to securely edit and save your portfolio data back to your Google Sheet.
          </p>
        </div>

        <div className="space-y-4">
          {requiresSheetId && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                Google Sheets ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={inputSheetId}
                  onChange={(e) => setInputSheetId(e.target.value)}
                  className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-accent focus:border-transparent outline-none transition-all text-sm"
                  placeholder="e.g. 1BxiMVs0XRY..."
                  autoFocus
                />
              </div>
              <p className="text-[10px] items-center text-slate-400 mt-1">Make sure the linked Google Sheet has permission set to 'Anyone with the link can view' for public visitors.</p>
            </div>
          )}

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
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="flex-1 px-4 py-2.5 bg-ocean-dark text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold shadow-md inline-flex items-center justify-center disabled:opacity-75 disabled:cursor-wait cursor-pointer"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign in with Google'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
