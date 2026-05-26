import React, { useState, useEffect } from 'react';
import { INITIAL_DATA } from './initialData';
import { SiteData } from './types';
import { saveToIndexedDB, getFromIndexedDB, removeFromIndexedDB, smartMergeData } from './utils/db';

// Importing extracted functional modules
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Methodology from './components/Methodology';
import Activities from './components/Activities';
import Publications from './components/Publications';
import Team from './components/Team';
import Blog from './components/Blog';
import Archive from './components/Archive';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [data, setData] = useState<SiteData | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Load Google Apps Script Webhook URL from env or local storage
  const [apiUrl, setApiUrl] = useState<string>(() => {
    return import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || localStorage.getItem('academic_portfolio_api_url') || '/api/site-data';
  });

  const updateApiUrl = (url: string) => {
    setApiUrl(url);
    if (url.startsWith('http')) {
      localStorage.setItem('academic_portfolio_api_url', url);
    }
  };

  // Initialize and load persisted dataset from server store (with IndexedDB fallback)
  useEffect(() => {
    const initData = async () => {
      try {
        let serverData: SiteData | null = null;
        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            const rawData = await response.json();
            if (rawData && !rawData.error) {
              serverData = rawData;
            }
          }
        } catch (fetchErr) {
          console.warn('Could not contact API, checking browser database fallback...', fetchErr);
        }

        let parsed = serverData;

        // If server data couldn't load (e.g., offline/errors), query IndexedDB fallback
        if (!parsed) {
          parsed = await getFromIndexedDB('academic_portfolio_site_data_v4');

          // Migration fallback: If IndexedDB is empty, check old localStorage
          if (!parsed) {
            const legacySaved = localStorage.getItem('academic_portfolio_site_data_v3');
            if (legacySaved) {
              try {
                const legacyParsed = JSON.parse(legacySaved);
                if (legacyParsed && legacyParsed.hero && legacyParsed.about) {
                  parsed = legacyParsed;
                  await saveToIndexedDB('academic_portfolio_site_data_v4', parsed);
                  localStorage.removeItem('academic_portfolio_site_data_v3');
                }
              } catch (err) {
                console.warn('Failed to parse previous legacy site data from localStorage.', err);
              }
            }
          }
        }

        if (parsed && parsed.hero && parsed.about && parsed.publications) {
          // Migrate name to Shaibal Bhattacharjee automatically if stored as older initials
          if (parsed.hero.name === "S. Bhattacharjee") {
            parsed.hero.name = "Shaibal Bhattacharjee";
          }
          // Recursively overlay any new additions/updates made in INITIAL_DATA codebase
          const { merged, updated } = smartMergeData(parsed, INITIAL_DATA);
          
          if (updated) {
            setData(merged);
            await saveToIndexedDB('academic_portfolio_site_data_v4', merged);
            try {
              await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(merged),
              });
            } catch(e) {}
          } else {
            setData(parsed);
            await saveToIndexedDB('academic_portfolio_site_data_v4', parsed);
          }
        } else {
          // Initialize fresh template
          const newTemplate = JSON.parse(JSON.stringify(INITIAL_DATA));
          setData(newTemplate);
          try {
            await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newTemplate),
            });
          } catch(e) {}
        }
      } catch (err) {
        console.error('Error during database initialization:', err);
        setData(JSON.parse(JSON.stringify(INITIAL_DATA)));
      }
    };

    initData();
  }, [apiUrl]);

  // Periodic background check to fetch fresh published data (Real-Time Sync for multi-user tabs)
  useEffect(() => {
    if (isAdminMode || !apiUrl.startsWith('http')) return; // Prevent overwriting while administrator is editing draft changes

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
           const freshData = await response.json();
           if (freshData && freshData.hero && !freshData.error && JSON.stringify(freshData) !== JSON.stringify(data)) {
             setData(freshData);
             await saveToIndexedDB('academic_portfolio_site_data_v4', freshData);
           }
        }
      } catch (err) {
        // Silently swallow network drops
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, [isAdminMode, data, apiUrl]);

  const handleSaveData = async (updatedData: SiteData): Promise<boolean> => {
    try {
      setData(updatedData);
      // Save local IndexedDB first for fast local caching
      await saveToIndexedDB('academic_portfolio_site_data_v4', updatedData);

      // Save to server-side filesystem store so other devices and visitors load it
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      return response.ok;
    } catch (e) {
      console.error('Failed to save to server and browser database:', e);
      return false;
    }
  };

  const handleResetData = async () => {
    try {
      setData(JSON.parse(JSON.stringify(INITIAL_DATA)));
      await removeFromIndexedDB('academic_portfolio_site_data_v4');
      localStorage.removeItem('academic_portfolio_site_data_v3');
      
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(INITIAL_DATA),
      });
    } catch (e) {
      console.error('Error resetting site modifications:', e);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-100 font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium tracking-wide text-slate-400">Loading Shaibal Bhattacharjee Website Context...</p>
        </div>
      </div>
    );
  }

  // Admin section dashboard routing
  if (isAdminMode) {
    return (
      <AdminPanel
        initialData={data}
        onSave={handleSaveData}
        onReset={handleResetData}
        onLogout={() => setIsAdminMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen font-sans bg-white text-slate-700 antialiased selection:bg-ocean-accent selection:text-white">
      {/* Dynamic contextual header bar */}
      <Navbar name="S. Bhattacharjee Portfolio" />

      {/* Main presentation routes */}
      <main>
        <Hero hero={data.hero} recentActivities={data.activities.recentActivities} />
        <About about={data.about} />
        <Methodology methodologyConfig={data.methodologyConfig} skills={data.skills} />
        <Activities activities={data.activities} />
        <Publications publicationsConfig={data.publicationsConfig} publications={data.publications} />
        <Team peopleConfig={data.peopleConfig} people={data.people} />
        <Blog blogsConfig={data.blogsConfig} blogs={data.blogs} />
        <Archive archive={data.archive} />
      </main>

      {/* Base contact and citations footer bar */}
      <Footer contact={data.contact} onOpenLogin={() => setIsLoginOpen(true)} />

      {/* Access validation dialog overlay */}
      {isLoginOpen && (
        <LoginModal
          apiUrl={apiUrl}
          setApiUrl={updateApiUrl}
          onLogin={() => {
            setIsAdminMode(true);
            setIsLoginOpen(false);
          }}
          onCancel={() => setIsLoginOpen(false)}
        />
      )}
    </div>
  );
}
