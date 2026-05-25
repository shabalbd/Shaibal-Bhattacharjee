import React, { useState, useEffect } from 'react';
import { INITIAL_DATA } from './initialData';
import { SiteData } from './types';
import { saveToIndexedDB, getFromIndexedDB, removeFromIndexedDB } from './utils/db';

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

  // Initialize and load persisted dataset from IndexedDB (with localStorage migration fallback)
  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Try to load from expanded IndexedDB database first
        let parsed = await getFromIndexedDB('academic_portfolio_site_data_v4');

        // 2. Migration fallback: If IndexedDB is empty, check old localStorage
        if (!parsed) {
          const legacySaved = localStorage.getItem('academic_portfolio_site_data_v3');
          if (legacySaved) {
            try {
              const legacyParsed = JSON.parse(legacySaved);
              if (legacyParsed && legacyParsed.hero && legacyParsed.about) {
                parsed = legacyParsed;
                // Migrate to new storage engine
                await saveToIndexedDB('academic_portfolio_site_data_v4', parsed);
                // Clean up old restrictively limited storage block
                localStorage.removeItem('academic_portfolio_site_data_v3');
              }
            } catch (err) {
              console.warn('Failed to parse previous legacy site data from localStorage.', err);
            }
          }
        }

        if (parsed && parsed.hero && parsed.about && parsed.publications) {
          // Migrate name to Shaibal Bhattacharjee automatically if stored as older initials
          if (parsed.hero.name === "S. Bhattacharjee") {
            parsed.hero.name = "Shaibal Bhattacharjee";
            await saveToIndexedDB('academic_portfolio_site_data_v4', parsed);
          }
          setData(parsed);
        } else {
          // Initialize fresh template
          setData(JSON.parse(JSON.stringify(INITIAL_DATA)));
        }
      } catch (err) {
        console.error('Error during database initialization:', err);
        setData(JSON.parse(JSON.stringify(INITIAL_DATA)));
      }
    };

    initData();
  }, []);

  const handleSaveData = async (updatedData: SiteData): Promise<boolean> => {
    try {
      setData(updatedData);
      const success = await saveToIndexedDB('academic_portfolio_site_data_v4', updatedData);
      return success;
    } catch (e) {
      console.error('Failed to save to browser database:', e);
      setData(updatedData);
      return false;
    }
  };

  const handleResetData = async () => {
    setData(JSON.parse(JSON.stringify(INITIAL_DATA)));
    await removeFromIndexedDB('academic_portfolio_site_data_v4');
    localStorage.removeItem('academic_portfolio_site_data_v3');
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
