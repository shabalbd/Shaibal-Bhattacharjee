import React, { useState } from 'react';
import {
  Monitor,
  User,
  FileText,
  Wrench,
  Briefcase,
  Users,
  BookOpen,
  Mail,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  Upload,
  LogOut,
  Archive,
  X,
  Download
} from 'lucide-react';
import { SiteData, SkillCategory, PublicationItem, BlogItem, PersonItem } from '../types';
import { resolveMediaLink } from '../utils/mediaResolver';

interface AdminPanelProps {
  initialData: SiteData;
  onSave: (data: SiteData) => Promise<boolean> | boolean;
  onReset: () => void;
  onLogout: () => void;
}

const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB single file limit

export default function AdminPanel({ initialData, onSave, onReset, onLogout }: AdminPanelProps) {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkType, setNewLinkType] = useState<'image' | 'video'>('image');

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 6000);
  };

  const [data, setData] = useState<SiteData>(() => {
    const raw = JSON.parse(JSON.stringify(initialData)) as SiteData;
    if (!raw.archive) {
      raw.archive = {
        title: "Archive & Field Records",
        description: "An extensive repository of field logs, expedition photos, and laboratory reference material captured during active coastal surveys.",
        items: []
      };
    }
    return raw;
  });
  const [activeTab, setActiveTab] = useState('hero');
  const [isModified, setIsModified] = useState(false);

  // Tabs layout
  const sidebarTabs = [
    { id: 'hero', label: 'Hero Section', icon: Monitor },
    { id: 'about', label: 'About Me', icon: User },
    { id: 'publications', label: 'Publications', icon: FileText },
    { id: 'skills', label: 'Skills & Expertise', icon: Wrench },
    { id: 'activities', label: 'Activities/Fieldwork', icon: Briefcase },
    { id: 'people', label: 'Group & Peers', icon: Users },
    { id: 'blogs', label: 'Blogs & Articles', icon: BookOpen },
    { id: 'archive', label: 'Archive & Media', icon: Archive },
    { id: 'contact', label: 'Footer & Networks', icon: Mail },
  ];

  const updateField = (section: keyof SiteData, field: string | null, value: any) => {
    setData((prev) => {
      const copy = { ...prev };
      if (field === null || field === undefined || field === "") {
        (copy as any)[section] = value;
      } else {
        (copy[section] as any)[field] = value;
      }
      return copy;
    });
    setIsModified(true);
  };

  const handleSave = async () => {
    const success = await onSave(data);
    if (success) {
      setIsModified(false);
      showNotification('All modifications saved to your Google Sheets database successfully!', 'success');
    } else {
      showNotification('Save failed: Unable to sync with Google Apps Script Web App. Please check your external database URL and permissions.', 'error');
    }
  };

  const handleReset = () => {
    setConfirmAction({
      message: 'Are you sure you want to revert all customizations back into defaults? All local updates will be erased.',
      onConfirm: () => {
        onReset();
        showNotification('Boilerplate templates restored. Switch tabs or refresh to view defaults.', 'info');
        setConfirmAction(null);
      }
    });
  };

  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `academic_website_dataset_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showNotification('Academic website configuration exported as a local JSON database backup successfully!', 'success');
    } catch (err) {
      showNotification('Backup export failed: Could not compile data stream.', 'error');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object' && parsed.hero && parsed.about) {
          setData(parsed);
          setIsModified(true);
          showNotification('Database backup imported successfully! Click "Save Modifications" at the top to commit these changes to the server.', 'success');
        } else {
          showNotification('Import failed: Selected JSON file layout does not match academic schema rules.', 'error');
        }
      } catch (err) {
        showNotification('Syntax error: Uploaded file is corrupt or not formatted in valid JSON.', 'error');
      }
    };
    fileReader.readAsText(file);
    e.target.value = '';
  };

  // Safe file reader with full-stack server-side upload and storage
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (urlOrBase64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showNotification(`File size exceeds the permitted 30 MB limit. Please select a smaller file (Maximum size: 30 MB). Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`, 'error');
      e.target.value = '';
      return;
    }

    showNotification(`Uploading "${file.name}" to the server...`, 'info');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            base64: base64Data
          })
        });

        if (res.ok) {
          const result = await res.json();
          if (result && result.url) {
            showNotification(`"${file.name}" uploaded successfully!`, 'success');
            onComplete(result.url);
            return;
          }
        }
        
        // Fail-safe fallback to base64 if server-side upload endpoint reports an error
        console.warn('Server upload failed, falling back to local base64 storage:', res.statusText);
        showNotification('Server-side write bypassed, saving local browser draft instead.', 'info');
        onComplete(base64Data);
      } catch (uploadErr) {
        // Fail-safe fallback to base64 if server-side fetch crashes
        console.error('Exception during server-side upload, using local fallback:', uploadErr);
        showNotification('Saved local draft due to service connection state.', 'info');
        onComplete(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans" id="admin-workspace">
      
      {/* Structural Sidebar */}
      <aside className="w-64 bg-ocean-dark text-slate-300 flex-shrink-0 flex flex-col h-screen sticky top-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-white font-serif font-bold text-lg">Researcher Admin</h1>
          <p className="text-xs text-slate-500 mt-1">Shaibal Bhattacharjee Website</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-xs font-medium cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-ocean-accent text-white shadow-md font-semibold'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-900/30 text-red-400 rounded-lg hover:bg-red-950/20 text-xs transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main Form Fields Panels Frame */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Upper Action Bar */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800 capitalize font-serif">
            Editing {activeTab.replace('-', ' ')} Values
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Download your entire customized website structure as a backup JSON file"
            >
              <Download size={14} className="text-cyan-600" />
              <span>Export Backup</span>
            </button>
            <label
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Upload and load a previously saved website backup JSON"
            >
              <Upload size={14} className="text-cyan-600" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportBackup}
              />
            </label>
            {isModified && (
              <span className="text-amber-600 text-xs font-semibold animate-pulse">
                Unsaved modifications pending
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!isModified}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isModified
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save size={16} />
              Save Modifications
            </button>
          </div>
        </header>

        {/* Categories scrollable forms panel frame */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">

            {/* TAB: HERO EDITING */}
            {activeTab === 'hero' && (
              <>
                {/* 15GB Cloud Storage Integration Portal Guidance */}
                <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 w-36 h-36 bg-cyan-700/10 rounded-full blur-2xl block" />
                  <div className="relative z-10 space-y-3">
                    <h3 className="text-sm font-bold font-serif text-cyan-400 flex items-center gap-2">
                      ☁️ Free 15 GB Cloud Storage Integration & Persistence Guide
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      Instead of uploading heavy files directly to the server container storage (which has a limited ephemeral disk and resets automatically when scaled or restarted), utilize <strong>Google Drive (15 GB FREE)</strong>, <strong>OneDrive (5 GB FREE)</strong>, or <strong>Dropbox (2 GB FREE)</strong> as your online cloud storage center.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          🔗 1. Copy Cloud Sharing URL
                        </span>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          Upload your high-res photos, expedition videos, or academic slide decks to your public cloud drive. Copy the link having the sharing privacy level configured as <strong>"Anyone with the link can view / reader"</strong>.
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          ⚡ 2. Paste or Backup Streams
                        </span>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          Paste the link directly into slot boxes below. The portal's built-in <strong>media resolver</strong> will automatically decode, optimize, and stream it natively to all users on any browser! Use the <strong>Export/Import Backup</strong> buttons above to import or save your entire content settings instantly!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Primary Academic Scholar Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-ocean-accent outline-none text-sm"
                      value={data.hero.name}
                      onChange={(e) => updateField('hero', 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Academic Title Caption</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-ocean-accent outline-none text-sm"
                      value={data.hero.title}
                      onChange={(e) => updateField('hero', 'title', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Subtitle Banner (PhD details)</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-ocean-accent outline-none text-sm"
                      value={data.hero.subtitle}
                      onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">CV / Resume Document URL</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-ocean-accent outline-none text-sm font-mono"
                      value={data.hero.cvUrl}
                      placeholder="Insert URL or Base64 string"
                      onChange={(e) => updateField('hero', 'cvUrl', e.target.value)}
                    />
                    <div className="mt-2.5">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors">
                        <Upload size={14} className="text-ocean-accent" />
                        <span>Upload CV PDF (Max 30 MB)</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            handleFileUpload(e, (base64) => {
                              updateField('hero', 'cvUrl', base64);
                            });
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Affiliation Institution Line 1</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-ocean-accent outline-none text-sm"
                      value={data.hero.affiliationLine1}
                      onChange={(e) => updateField('hero', 'affiliationLine1', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Affiliation Institution Line 2</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-ocean-accent outline-none text-sm"
                      value={data.hero.affiliationLine2}
                      onChange={(e) => updateField('hero', 'affiliationLine2', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Academic Core Summary</label>
                  <textarea
                    rows={3}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-ocean-accent outline-none text-sm leading-relaxed"
                    value={data.hero.summary}
                    onChange={(e) => updateField('hero', 'summary', e.target.value)}
                  />
                </div>

                 {/* Profile photos slideshow sequences with 30MB uploads */}
                 <div className="pt-6 border-t border-slate-100 space-y-4">
                   <h3 className="font-serif font-bold text-slate-800 text-sm">Cycling Profile Photos Sequence (Rotates automatically)</h3>
                   <p className="text-xs text-slate-500">Configure 5 profile pictures. Paste standard web URLs, Google Drive view links, or direct OneDrive sharing files. Max upload limit is strictly 30 MB per photo.</p>
                   
                   <div className="space-y-4">
                     {Array.from({ length: 5 }).map((_, index) => {
                       const imgUrl = (data.hero.galleryImages || [])[index] || '';
                       const resolved = resolveMediaLink(imgUrl, 'image');
                       return (
                         <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50 items-center">
                           <div className="space-y-2">
                             <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                               <span>🖼️</span> Profile Picture Slot {index + 1} Source Link
                             </label>
                             <input
                               type="text"
                               placeholder="Paste a direct image URL, Google Drive share URL, or OneDrive link..."
                               className="w-full p-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-ocean-accent"
                               value={imgUrl}
                               onChange={(e) => {
                                 const copy = [...(data.hero.galleryImages || [])];
                                 while (copy.length < 5) copy.push('');
                                 copy[index] = e.target.value;
                                 const truncated = copy.slice(0, 5);
                                 updateField('hero', 'galleryImages', truncated);
                                 if (index === 0) updateField('hero', 'imageUrl', e.target.value);
                               }}
                             />
                             {imgUrl && (
                               <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                                 <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                 Resolved Source: <span className="font-bold uppercase text-ocean-accent">{resolved.source}</span>
                                 {resolved.source !== 'standard' && <span className="text-emerald-600 font-medium">(Optimized for instant drive loading)</span>}
                               </div>
                             )}
                             <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded shadow-xs transition-colors mt-1">
                               <Upload size={12} className="text-ocean-accent" />
                               <span>Upload Photo {index + 1} (Max 30 MB)</span>
                               <input
                                 type="file"
                                 accept="image/*"
                                 className="hidden"
                                 onChange={(e) => {
                                   handleFileUpload(e, (base64) => {
                                     const copy = [...(data.hero.galleryImages || [])];
                                     while (copy.length < 5) copy.push('');
                                     copy[index] = base64;
                                     const truncated = copy.slice(0, 5);
                                     updateField('hero', 'galleryImages', truncated);
                                     if (index === 0) updateField('hero', 'imageUrl', base64);
                                   });
                                 }}
                               />
                             </label>
                           </div>
                           <div className="flex flex-col items-center">
                             <span className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Preview</span>
                             <div className="w-16 h-16 rounded overflow-hidden border bg-white flex items-center justify-center relative shadow-sm">
                               {imgUrl ? (
                                 <img
                                   src={resolved.displayUrl}
                                   className="w-full h-full object-cover"
                                   alt=""
                                   onError={(e) => {
                                     (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e2e8f0/475569?text=Error';
                                   }}
                                   referrerPolicy="no-referrer"
                                 />
                               ) : (
                                 <span className="text-[10px] text-slate-300">Empty</span>
                               )}
                             </div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>

                 {/* Background videos slideshow sequences with 30MB uploads */}
                 <div className="pt-6 border-t border-slate-100 space-y-4">
                   <h3 className="font-serif font-bold text-slate-800 text-sm">First Page Background Videos (Rotates automatically)</h3>
                   <p className="text-xs text-slate-500">Configure 5 background video files. Paste direct MP4 streaming media, Google Drive shared videos, or general Web links. Maximum upload limit is strictly 30 MB per file package.</p>
                   
                   <div className="space-y-4">
                     {Array.from({ length: 5 }).map((_, index) => {
                       const vidUrl = (data.hero.videoUrls || [])[index] || '';
                       const resolved = resolveMediaLink(vidUrl, 'video');
                       return (
                         <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50 items-center">
                           <div className="space-y-2">
                             <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                               <span>🎥</span> Background Video Slot {index + 1} Source Link
                             </label>
                             <input
                               type="text"
                               placeholder="Paste a direct MP4, Google Drive video link, Dropbox share link, or OneDrive web link..."
                               className="w-full p-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-ocean-accent"
                               value={vidUrl}
                               onChange={(e) => {
                                 const copy = [...(data.hero.videoUrls || [])];
                                 while (copy.length < 5) copy.push('');
                                 copy[index] = e.target.value;
                                 const truncated = copy.slice(0, 5);
                                 updateField('hero', 'videoUrls', truncated);
                                 if (index === 0) updateField('hero', 'videoUrl', e.target.value);
                               }}
                             />
                             {vidUrl && (
                               <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                                 <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                 Resolved Stream Format: <span className="font-bold uppercase text-ocean-accent">{resolved.source}</span>
                                 {resolved.isEmbeddable ? (
                                   <span className="text-cyan-600 font-medium">(Requires web frame sandbox viewport)</span>
                                 ) : (
                                   <span className="text-emerald-600 font-medium">(Direct stream pipeline active)</span>
                                 )}
                               </div>
                             )}
                             <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded shadow-xs transition-colors mt-1">
                               <Upload size={12} className="text-ocean-accent" />
                               <span>Upload Video {index + 1} (Max 30 MB)</span>
                               <input
                                 type="file"
                                 accept="video/*"
                                 className="hidden"
                                 onChange={(e) => {
                                   handleFileUpload(e, (base64) => {
                                     const copy = [...(data.hero.videoUrls || [])];
                                     while (copy.length < 5) copy.push('');
                                     copy[index] = base64;
                                     const truncated = copy.slice(0, 5);
                                     updateField('hero', 'videoUrls', truncated);
                                     if (index === 0) updateField('hero', 'videoUrl', base64);
                                   });
                                 }}
                               />
                             </label>
                           </div>
                           <div className="flex flex-col items-center">
                             <span className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Preview</span>
                             <div className="w-24 h-16 rounded overflow-hidden border bg-white flex items-center justify-center relative shadow-sm">
                               {vidUrl ? (
                                 resolved.isEmbeddable ? (
                                   <iframe
                                     src={resolved.embedUrl}
                                     className="w-full h-full border-none pointer-events-none"
                                     allow="autoplay"
                                   />
                                 ) : (
                                   <video src={resolved.directUrl} className="w-full h-full object-cover" muted />
                                 )
                               ) : (
                                 <span className="text-[10px] text-slate-300">Empty</span>
                               )}
                             </div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
              </div>
             </>
            )}

            {/* TAB: ABOUT ME */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Section Header Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded text-sm font-semibold"
                      value={data.about.title}
                      onChange={(e) => updateField('about', 'title', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center p-4 border border-slate-100 rounded bg-slate-50">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <span>🖼️</span> Profile Narrative Image (Cloud Link or Uploaded URL)
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Paste a Cloud Sharing URL (Google Drive, Dropbox, OneDrive, etc.) or click the button below to upload a direct file backup. (Max 30 MB)
                      </p>
                      <input
                        type="text"
                        className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                        placeholder="Paste cloud url (e.g. Dropbox, Google Drive, etc.)..."
                        value={data.about.aboutImage}
                        onChange={(e) => updateField('about', 'aboutImage', e.target.value)}
                      />
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded">
                        <Upload size={12} className="text-ocean-accent" />
                        <span>Upload Custom Photo (Max 30 MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            handleFileUpload(e, (base64) => {
                              updateField('about', 'aboutImage', base64);
                            });
                          }}
                        />
                      </label>
                    </div>
                    {data.about.aboutImage && (
                      <div className="w-16 h-20 rounded border bg-white overflow-hidden shadow-xs shrink-0">
                        <img 
                          src={resolveMediaLink(data.about.aboutImage, 'image').displayUrl || data.about.aboutImage} 
                          className="w-full h-full object-cover" 
                          alt="" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Paragraphs narrative sequences */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-slate-800 text-sm">Biographical Narrative Paragraphs</h3>
                  <div className="space-y-4">
                    {data.about.content.map((p, idx) => (
                      <div key={idx} className="relative group">
                        <textarea
                          rows={3}
                          className="w-full p-3 border border-slate-300 rounded text-sm font-light leading-relaxed"
                          value={p}
                          onChange={(e) => {
                            const copy = [...data.about.content];
                            copy[idx] = e.target.value;
                            updateField('about', 'content', copy);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...data.about.content];
                            copy.splice(idx, 1);
                            updateField('about', 'content', copy);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-md transition-opacity opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateField('about', 'content', [...data.about.content, 'New biographical block...']);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ocean-accent hover:underline"
                  >
                    <Plus size={14} />
                    Add Narrative Paragraph
                  </button>
                </div>

                {/* Appointments & Education lists sequence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Edu */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-slate-800 text-sm">Academic Qualifications</h3>
                    <div className="space-y-4">
                      {data.about.education.map((edu, idx) => (
                        <div key={edu.id} className="p-3 border rounded-lg bg-slate-50 space-y-2 relative group">
                          <input
                            type="text"
                            placeholder="Degree/Award"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-semibold"
                            value={edu.degree}
                            onChange={(e) => {
                              const copy = [...data.about.education];
                              copy[idx].degree = e.target.value;
                              updateField('about', 'education', copy);
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Institution"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                            value={edu.institution}
                            onChange={(e) => {
                              const copy = [...data.about.education];
                              copy[idx].institution = e.target.value;
                              updateField('about', 'education', copy);
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Sessions period"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono"
                            value={edu.year}
                            onChange={(e) => {
                              const copy = [...data.about.education];
                              copy[idx].year = e.target.value;
                              updateField('about', 'education', copy);
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Dissertation details/honors"
                            className="w-full p-1.5 border border-slate-300 rounded text-[11px]"
                            value={edu.description || ''}
                            onChange={(e) => {
                              const copy = [...data.about.education];
                              copy[idx].description = e.target.value;
                              updateField('about', 'education', copy);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...data.about.education];
                              copy.splice(idx, 1);
                              updateField('about', 'education', copy);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem = { id: `edu-${Date.now()}`, degree: 'B.Sc. Degree', institution: 'University', year: '2024' };
                        updateField('about', 'education', [...data.about.education, newItem]);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ocean-accent hover:underline"
                    >
                      <Plus size={14} />
                      Add Certificate
                    </button>
                  </div>

                  {/* Appointments */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-slate-800 text-sm">Professional Appointments</h3>
                    <div className="space-y-4">
                      {data.about.experience.map((exp, idx) => (
                        <div key={exp.id} className="p-3 border rounded-lg bg-slate-50 space-y-2 relative group">
                          <input
                            type="text"
                            placeholder="Role/Title"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-semibold"
                            value={exp.role}
                            onChange={(e) => {
                              const copy = [...data.about.experience];
                              copy[idx].role = e.target.value;
                              updateField('about', 'experience', copy);
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Research Group/Body"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                            value={exp.institution}
                            onChange={(e) => {
                              const copy = [...data.about.experience];
                              copy[idx].institution = e.target.value;
                              updateField('about', 'experience', copy);
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Months/Years session"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono"
                            value={exp.period}
                            onChange={(e) => {
                              const copy = [...data.about.experience];
                              copy[idx].period = e.target.value;
                              updateField('about', 'experience', copy);
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Duties summary"
                            className="w-full p-1.5 border border-slate-300 rounded text-[11px]"
                            value={exp.description || ''}
                            onChange={(e) => {
                              const copy = [...data.about.experience];
                              copy[idx].description = e.target.value;
                              updateField('about', 'experience', copy);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...data.about.experience];
                              copy.splice(idx, 1);
                              updateField('about', 'experience', copy);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem = { id: `exp-${Date.now()}`, role: 'Research Analyst', institution: 'Institute', period: '2024 - Present' };
                        updateField('about', 'experience', [...data.about.experience, newItem]);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ocean-accent hover:underline"
                    >
                      <Plus size={14} />
                      Add Appointment
                    </button>
                  </div>
                </div>

                {/* Interests & methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-slate-800 text-sm">Interests & Domains</h3>
                    <div className="space-y-2">
                      {data.about.interests.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            className="flex-grow p-1.5 border border-slate-300 rounded text-xs"
                            value={item}
                            onChange={(e) => {
                              const copy = [...data.about.interests];
                              copy[idx] = e.target.value;
                              updateField('about', 'interests', copy);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...data.about.interests];
                              copy.splice(idx, 1);
                              updateField('about', 'interests', copy);
                            }}
                            className="text-red-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField('about', 'interests', [...data.about.interests, 'New interest area'])}
                      className="text-xs text-ocean-accent hover:underline font-semibold"
                    >
                      + Add Domain
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-slate-800 text-sm">Spec. Methodologies</h3>
                    <div className="space-y-2">
                      {data.about.methods.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            className="flex-grow p-1.5 border border-slate-300 rounded text-xs"
                            value={item}
                            onChange={(e) => {
                              const copy = [...data.about.methods];
                              copy[idx] = e.target.value;
                              updateField('about', 'methods', copy);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...data.about.methods];
                              copy.splice(idx, 1);
                              updateField('about', 'methods', copy);
                            }}
                            className="text-red-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField('about', 'methods', [...data.about.methods, 'New methodological framework'])}
                      className="text-xs text-ocean-accent hover:underline font-semibold"
                    >
                      + Add Method
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PUBLICATIONS */}
            {activeTab === 'publications' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-slate-800 text-sm">Header Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Publications Header Title</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-slate-300 rounded font-semibold text-sm"
                        value={data.publicationsConfig.title}
                        onChange={(e) => updateField('publicationsConfig', 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Citations Note Caption</label>
                      <textarea
                        rows={2}
                        className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                        value={data.publicationsConfig.description}
                        onChange={(e) => updateField('publicationsConfig', 'description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {data.publications.map((pub, idx) => (
                    <div key={pub.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-4">
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...data.publications];
                          copy.splice(idx, 1);
                          updateField('publications', null as any, copy);
                        }}
                        className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-md shadow-xs transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Publication Title</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded font-bold text-sm"
                            value={pub.title}
                            onChange={(e) => {
                              const copy = [...data.publications];
                              copy[idx].title = e.target.value;
                              updateField('publications', null as any, copy);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Publication Year</label>
                          <input
                            type="number"
                            className="w-full p-2 border border-slate-300 rounded text-sm"
                            value={pub.year}
                            onChange={(e) => {
                              const copy = [...data.publications];
                              copy[idx].year = parseInt(e.target.value) || new Date().getFullYear();
                              updateField('publications', null as any, copy);
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Authors (comma separated, in order)</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-slate-300 rounded text-xs"
                          value={pub.authors.join(', ')}
                          placeholder="Author A, Author B, Shaibal Bhattacharjee"
                          onChange={(e) => {
                            const copy = [...data.publications];
                            copy[idx].authors = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            updateField('publications', null as any, copy);
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Journal, Conference or Workshop venue</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                            value={pub.journal}
                            onChange={(e) => {
                              const copy = [...data.publications];
                              copy[idx].journal = e.target.value;
                              updateField('publications', null as any, copy);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">DOI Handle URL</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                            value={pub.doi || ''}
                            placeholder="e.g. 10.1016/j.env.2024..."
                            onChange={(e) => {
                              const copy = [...data.publications];
                              copy[idx].doi = e.target.value;
                              updateField('publications', null as any, copy);
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Volume (No)</label>
                          <input
                            type="text"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono"
                            value={pub.volume || ''}
                            onChange={(e) => {
                              const copy = [...data.publications];
                              copy[idx].volume = e.target.value;
                              updateField('publications', null as any, copy);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Issue</label>
                          <input
                            type="text"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono"
                            value={pub.issue || ''}
                            onChange={(e) => {
                              const copy = [...data.publications];
                              copy[idx].issue = e.target.value;
                              updateField('publications', null as any, copy);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Pages Index</label>
                          <input
                            type="text"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono"
                            placeholder="e.g. 15-28"
                            value={pub.pages || ''}
                            onChange={(e) => {
                              const copy = [...data.publications];
                              copy[idx].pages = e.target.value;
                              updateField('publications', null as any, copy);
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1 font-mono">Category Type</label>
                          <select
                            className="w-full p-2 border border-slate-300 bg-white rounded text-xs cursor-pointer"
                            value={pub.type}
                            onChange={(e) => {
                              const copy = [...data.publications];
                              copy[idx].type = e.target.value as any;
                              updateField('publications', null as any, copy);
                            }}
                          >
                            <option value="article">Journal Article</option>
                            <option value="preprint">Preprint</option>
                            <option value="conference">Conference Seminars</option>
                            <option value="presentation">Presentation</option>
                            <option value="poster">Poster</option>
                            <option value="workshop">Training Workshop</option>
                            <option value="book">Books</option>
                            <option value="data">Data</option>
                            <option value="code">Code</option>
                            <option value="thesis">Thesis</option>
                            <option value="data-article">Data Article</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Review/Publishing Status</label>
                          <select
                            className="w-full p-2 border border-slate-300 bg-white rounded text-xs cursor-pointer"
                            value={pub.status}
                            onChange={(e) => {
                              const copy = [...data.publications];
                              copy[idx].status = e.target.value as any;
                              updateField('publications', null as any, copy);
                            }}
                          >
                            <option value="Published">Published / In Press</option>
                            <option value="Under Review">Under Peer Review</option>
                            <option value="In Preparation">Manuscript In Preparation</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newItem: PublicationItem = {
                      id: `pub-${Date.now()}`,
                      year: new Date().getFullYear(),
                      title: 'New Publication Title',
                      authors: ['Bhattacharjee, S.'],
                      journal: 'Academic Journal of Ocean Sciences',
                      type: 'article',
                      status: 'Published'
                    };
                    updateField('publications', null as any, [...data.publications, newItem]);
                  }}
                  className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-ocean-accent rounded-xl text-slate-500 text-sm font-semibold hover:text-ocean-accent transition-colors flex justify-center items-center gap-2 cursor-pointer bg-white"
                >
                  <Plus size={16} />
                  Add Scientific Publication
                </button>
              </div>
            )}

            {/* TAB: METHODOLOGY */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-slate-800 text-sm">Heading Configurations</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded font-bold text-sm"
                      value={data.methodologyConfig.title}
                      onChange={(e) => updateField('methodologyConfig', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                      value={data.methodologyConfig.description}
                      onChange={(e) => updateField('methodologyConfig', 'description', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.skills.map((cat, catIdx) => (
                    <div key={catIdx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 relative group">
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...data.skills];
                          copy.splice(catIdx, 1);
                          updateField('skills', null as any, copy);
                        }}
                        className="absolute top-4 right-4 p-1 bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category Name</label>
                        <input
                          type="text"
                          className="w-full p-1.5 border border-slate-300 rounded text-sm font-bold text-slate-800"
                          value={cat.category}
                          onChange={(e) => {
                            const copy = [...data.skills];
                            copy[catIdx].category = e.target.value;
                            updateField('skills', null as any, copy);
                          }}
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Tags</label>
                        {cat.skills.map((skill, sIdx) => (
                          <div key={sIdx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              className="flex-grow p-1.5 border border-slate-300 rounded text-xs"
                              value={skill}
                              onChange={(e) => {
                                const copy = [...data.skills];
                                copy[catIdx].skills[sIdx] = e.target.value;
                                updateField('skills', null as any, copy);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...data.skills];
                                copy[catIdx].skills.splice(sIdx, 1);
                                updateField('skills', null as any, copy);
                              }}
                              className="text-red-400 hover:text-red-500 p-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...data.skills];
                          copy[catIdx].skills.push('New Skill');
                          updateField('skills', null as any, copy);
                        }}
                        className="text-xs text-ocean-accent hover:underline font-semibold"
                      >
                        + Add Skill tag
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newCategory: SkillCategory = { category: 'New Skill Area', skills: ['Initial Skill'] };
                    updateField('skills', null as any, [...data.skills, newCategory]);
                  }}
                  className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-ocean-accent rounded-xl text-slate-500 text-sm font-semibold hover:text-ocean-accent transition-colors flex justify-center items-center gap-2 cursor-pointer bg-white"
                >
                  <Plus size={16} />
                  Add Technical Category
                </button>
              </div>
            )}

            {/* TAB: ACTIVITIES */}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-slate-800 text-sm">Header narrative</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Section Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded font-semibold text-sm"
                      value={data.activities.sectionTitle}
                      onChange={(e) => updateField('activities', 'sectionTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Section Description</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                      value={data.activities.sectionDescription}
                      onChange={(e) => updateField('activities', 'sectionDescription', e.target.value)}
                    />
                  </div>
                </div>

                {/* Professional development initiatives list */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-slate-800 text-sm">Appointments & Voluntary Work</h3>
                  <div className="space-y-4">
                    {data.activities.development.map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-slate-50 space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...data.activities.development];
                            copy.splice(idx, 1);
                            updateField('activities', 'development', copy);
                          }}
                          className="absolute top-4 right-4 p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Activity Name</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-300 rounded text-xs font-bold text-slate-800"
                              value={item.title}
                              onChange={(e) => {
                                const copy = [...data.activities.development];
                                copy[idx].title = e.target.value;
                                updateField('activities', 'development', copy);
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Subtitle / Category Type</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-300 rounded text-xs"
                              value={item.subtitle}
                              onChange={(e) => {
                                const copy = [...data.activities.development];
                                copy[idx].subtitle = e.target.value;
                                updateField('activities', 'development', copy);
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Narrative Summary</label>
                          <textarea
                            rows={2}
                            className="w-full p-2 border border-slate-300 rounded text-xs font-light"
                            value={item.desc}
                            onChange={(e) => {
                              const copy = [...data.activities.development];
                              copy[idx].desc = e.target.value;
                              updateField('activities', 'development', copy);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newItem = { title: 'New Outreach Service', subtitle: 'Global volunteering', desc: 'Narratives...' };
                      updateField('activities', 'development', [...data.activities.development, newItem]);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ocean-accent hover:underline"
                  >
                    <Plus size={14} />
                    Add Outreach Activity
                  </button>
                </div>

                {/* Recent Activities modal gallery list */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-slate-800 text-sm">Recent Activities Popup (Media & Summaries)</h3>
                  <p className="text-xs text-slate-500">Add or edit activities featured in the Home "Recent Activities" pop-up screen. Maximum upload size: strictly 30 MB.</p>
                  
                  <div className="space-y-4">
                    {data.activities.recentActivities.map((act, idx) => (
                      <div key={act.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...data.activities.recentActivities];
                            copy.splice(idx, 1);
                            updateField('activities', 'recentActivities', copy);
                          }}
                          className="absolute top-4 right-4 p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Activity Short Name</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded text-xs font-bold text-slate-800"
                            value={act.name}
                            onChange={(e) => {
                              const copy = [...data.activities.recentActivities];
                              copy[idx].name = e.target.value;
                              updateField('activities', 'recentActivities', copy);
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Narrative Summary</label>
                          <textarea
                            rows={2}
                            className="w-full p-2 border border-slate-300 rounded text-xs font-light"
                            value={act.description}
                            onChange={(e) => {
                              const copy = [...data.activities.recentActivities];
                              copy[idx].description = e.target.value;
                              updateField('activities', 'recentActivities', copy);
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center">
                          <div className="flex-grow">
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Media Source URL (Cloud Link or Base64 / Local Link)</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                              value={act.mediaUrl}
                              placeholder="Paste cloud URL or uploaded local link..."
                              onChange={(e) => {
                                const copy = [...data.activities.recentActivities];
                                copy[idx].mediaUrl = e.target.value;
                                updateField('activities', 'recentActivities', copy);
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Media Type</label>
                            <select
                              className="p-2 border border-slate-300 bg-white rounded text-xs cursor-pointer"
                              value={act.mediaType}
                              onChange={(e) => {
                                const copy = [...data.activities.recentActivities];
                                copy[idx].mediaType = e.target.value as any;
                                updateField('activities', 'recentActivities', copy);
                              }}
                            >
                              <option value="image">Image</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                          <div className="pt-5">
                            <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 border bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 rounded whitespace-nowrap shadow-xs">
                              <Upload size={12} className="text-ocean-accent" />
                              <span>Upload File (Max 30 MB)</span>
                              <input
                                type="file"
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleFileUpload(e, (base64) => {
                                    const copy = [...data.activities.recentActivities];
                                    copy[idx].mediaUrl = base64;
                                    // Auto-detect type
                                    const fileType = e.target.files?.[0].type;
                                    copy[idx].mediaType = fileType && fileType.startsWith('video/') ? 'video' : 'image';
                                    updateField('activities', 'recentActivities', copy);
                                  });
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Rich video/image interactive preview block */}
                        {act.mediaUrl && (() => {
                          const resolved = resolveMediaLink(act.mediaUrl, act.mediaType);
                          return (
                            <div className="w-40 h-24 rounded border overflow-hidden mt-2 bg-slate-50 relative flex items-center justify-center shadow-xs shrink-0">
                              {resolved.isEmbeddable ? (
                                <iframe
                                  src={resolved.embedUrl}
                                  className="w-full h-full border-zero scale-102"
                                  allow="autoplay; fullscreen"
                                />
                              ) : resolved.source !== 'standard' || act.mediaType === 'video' ? (
                                <video src={resolved.directUrl} className="w-full h-full object-cover animate-fade-in" muted controls />
                              ) : (
                                <img 
                                  src={resolved.displayUrl} 
                                  className="w-full h-full object-cover animate-fade-in" 
                                  alt="" 
                                  referrerPolicy="no-referrer" 
                                />
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newItem = {
                        id: `act-${Date.now()}`,
                        name: 'New fieldwork update',
                        description: 'Details...',
                        mediaUrl: 'https://images.pexels.com/photos/162568/ocean-wave-sea-water-162568.jpeg?auto=compress&cs=tinysrgb&w=900',
                        mediaType: 'image' as const
                      };
                      updateField('activities', 'recentActivities', [...data.activities.recentActivities, newItem]);
                    }}
                    className="text-xs text-ocean-accent hover:underline font-semibold"
                  >
                    + Add New Activity popup card
                  </button>
                </div>
              </div>
            )}

            {/* TAB: TEAM/PEOPLE LISTS */}
            {activeTab === 'people' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-slate-800 text-sm">Collaborators Header</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded font-bold text-sm"
                      value={data.peopleConfig.title}
                      onChange={(e) => updateField('peopleConfig', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                      value={data.peopleConfig.description}
                      onChange={(e) => updateField('peopleConfig', 'description', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {data.people.map((person, idx) => (
                    <div key={person.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-4">
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...data.people];
                          copy.splice(idx, 1);
                          updateField('people', null as any, copy);
                        }}
                        className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded shadow-xs"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="flex gap-6 items-start">
                        <div className="w-20 h-20 rounded border bg-slate-50 flex overflow-hidden items-center justify-center flex-shrink-0 shadow-xs">
                          {person.imageUrl ? (
                            <img src={resolveMediaLink(person.imageUrl, 'image').displayUrl || person.imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[10px] text-slate-400">Empty</span>
                          )}
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Academic Peer Name</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-300 rounded text-xs font-bold text-slate-800"
                              value={person.name}
                              onChange={(e) => {
                                const copy = [...data.people];
                                copy[idx].name = e.target.value;
                                updateField('people', null as any, copy);
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Research Role</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-300 rounded text-xs"
                              value={person.role}
                              onChange={(e) => {
                                const copy = [...data.people];
                                copy[idx].role = e.target.value;
                                updateField('people', null as any, copy);
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Peer Institution/Body</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                            value={person.institution}
                            onChange={(e) => {
                              const copy = [...data.people];
                              copy[idx].institution = e.target.value;
                              updateField('people', null as any, copy);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Portrait Source Link (Cloud Link or Uploaded URL)</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                              placeholder="Paste direct URL, Google Drive or OneDrive link..."
                              value={person.imageUrl || ''}
                              onChange={(e) => {
                                const copy = [...data.people];
                                copy[idx].imageUrl = e.target.value;
                                updateField('people', null as any, copy);
                              }}
                            />
                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 border bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 rounded font-semibold whitespace-nowrap">
                              <Upload size={12} className="text-ocean-accent" />
                              <span>Upload (Max 30M)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleFileUpload(e, (base64) => {
                                    const copy = [...data.people];
                                    copy[idx].imageUrl = base64;
                                    updateField('people', null as any, copy);
                                  });
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Brief Bio Description</label>
                        <textarea
                          rows={2}
                          className="w-full p-2 border border-slate-300 rounded text-xs font-light"
                          value={person.bio}
                          onChange={(e) => {
                            const copy = [...data.people];
                            copy[idx].bio = e.target.value;
                            updateField('people', null as any, copy);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newItem: PersonItem = {
                      id: `person-${Date.now()}`,
                      name: 'Collaborator Name',
                      role: 'Research Partner',
                      institution: 'Institute of Marine Sciences',
                      bio: 'Collaborative researcher focuses on coastal dynamics.',
                      imageUrl: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200'
                    };
                    updateField('people', null as any, [...data.people, newItem]);
                  }}
                  className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-ocean-accent rounded-xl text-slate-500 text-sm font-semibold hover:text-ocean-accent transition-colors flex justify-center items-center gap-2 cursor-pointer bg-white"
                >
                  <Plus size={16} />
                  Add Collaborator / Peer
                </button>
              </div>
            )}

            {/* TAB: BLOGS SECTION */}
            {activeTab === 'blogs' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-slate-800 text-sm">Blogs Header Config</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Blogs Page Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded font-bold text-sm"
                      value={data.blogsConfig.title}
                      onChange={(e) => updateField('blogsConfig', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description Subtitle</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                      value={data.blogsConfig.description}
                      onChange={(e) => updateField('blogsConfig', 'description', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {data.blogs.map((post, idx) => (
                    <div key={post.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-4">
                      
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...data.blogs];
                          copy.splice(idx, 1);
                          updateField('blogs', null as any, copy);
                        }}
                        className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded shadow-xs"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Blog Title Name</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded font-bold text-sm"
                            value={post.title}
                            onChange={(e) => {
                              const copy = [...data.blogs];
                              copy[idx].title = e.target.value;
                              updateField('blogs', null as any, copy);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Published Date Label</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                            value={post.date}
                            onChange={(e) => {
                              const copy = [...data.blogs];
                              copy[idx].date = e.target.value;
                              updateField('blogs', null as any, copy);
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Author Name tag</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                            value={post.author}
                            onChange={(e) => {
                              const copy = [...data.blogs];
                              copy[idx].author = e.target.value;
                              updateField('blogs', null as any, copy);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Read Time estimate</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                            value={post.readTime}
                            onChange={(e) => {
                              const copy = [...data.blogs];
                              copy[idx].readTime = e.target.value;
                              updateField('blogs', null as any, copy);
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Short Excerpt (Grid card overview)</label>
                        <textarea
                          rows={2}
                          className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                          value={post.excerpt}
                          onChange={(e) => {
                            const copy = [...data.blogs];
                            copy[idx].excerpt = e.target.value;
                            updateField('blogs', null as any, copy);
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Core Biographical / Fieldwork article content</label>
                        <textarea
                          rows={5}
                          className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                          value={post.content}
                          onChange={(e) => {
                            const copy = [...data.blogs];
                            copy[idx].content = e.target.value;
                            updateField('blogs', null as any, copy);
                          }}
                        />
                      </div>

                      {/* Primary Cover Image configuration block */}
                      <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
                        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <span>🖼️</span> Primary Blog Cover Image (Cloud Link or Uploaded URL)
                        </label>
                        <p className="text-[10px] text-slate-500">
                          Set the cover image displayed on cards in the Blogs grid category. Provide a direct cloud URL or click the button to upload an image. (Max 30 MB)
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center">
                          <div className="flex-grow">
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                              placeholder="Paste cover image link (e.g., Google Drive, OneDrive, Dropbox)..."
                              value={post.imageUrl || ''}
                              onChange={(e) => {
                                const copy = [...data.blogs];
                                copy[idx].imageUrl = e.target.value;
                                if (!copy[idx].galleryImages) copy[idx].galleryImages = [];
                                if (copy[idx].galleryImages.length === 0) copy[idx].galleryImages.push(e.target.value);
                                else copy[idx].galleryImages[0] = e.target.value;
                                updateField('blogs', null as any, copy);
                              }}
                            />
                          </div>
                          <div>
                            <label className="cursor-pointer inline-flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold rounded whitespace-nowrap">
                              <Upload size={12} className="text-ocean-accent" />
                              <span>Upload Cover Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleFileUpload(e, (base64) => {
                                    const copy = [...data.blogs];
                                    copy[idx].imageUrl = base64;
                                    if (!copy[idx].galleryImages) copy[idx].galleryImages = [];
                                    if (copy[idx].galleryImages.length === 0) copy[idx].galleryImages.push(base64);
                                    else copy[idx].galleryImages[0] = base64;
                                    updateField('blogs', null as any, copy);
                                  });
                                }}
                              />
                            </label>
                          </div>
                          {post.imageUrl && (
                            <div className="w-14 h-9 border rounded overflow-hidden shadow-xs bg-white">
                              <img src={post.imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Custom blog gallery layout with 30MB restrict */}
                      <div className="pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-lg">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Blog Attachment Gallery (Images)</h4>
                        <p className="text-[10px] text-slate-540 mb-3">Configure up to 3 to 5 images per blog details sheet. Strictly Max 30 MB upload limit.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(post.galleryImages || []).map((galImg, gIdx) => {
                            const resolvedGalImg = galImg ? (resolveMediaLink(galImg, 'image').displayUrl || galImg) : '';
                            return (
                              <div key={gIdx} className="bg-white border rounded shadow-xs p-2 space-y-2 flex flex-col justify-between">
                                <div className="aspect-video w-full overflow-hidden border rounded bg-slate-100 relative shadow-inner">
                                  {galImg ? (
                                    <img src={resolvedGalImg} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                  ) : (
                                    <span className="text-[10px] text-slate-400 absolute inset-0 flex items-center justify-center italic">No image / Empty</span>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  className="w-full p-1 border rounded text-[10px] font-mono"
                                  placeholder="Paste cloud URL or uploaded local link..."
                                  value={galImg}
                                  onChange={(e) => {
                                    const copy = [...data.blogs];
                                    if (!copy[idx].galleryImages) copy[idx].galleryImages = [];
                                    copy[idx].galleryImages[gIdx] = e.target.value;
                                    if (gIdx === 0) copy[idx].imageUrl = e.target.value;
                                    updateField('blogs', null as any, copy);
                                  }}
                                />
                              <div className="flex justify-between items-center pt-1.5">
                                <label className="cursor-pointer inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-2 py-1 text-[9px] font-semibold rounded border border-slate-200">
                                  <Upload size={10} className="text-ocean-accent" />
                                  <span>Upload (Max 30 MB)</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      handleFileUpload(e, (base64) => {
                                        const copy = [...data.blogs];
                                        if (!copy[idx].galleryImages) copy[idx].galleryImages = [];
                                        copy[idx].galleryImages[gIdx] = base64;
                                        if (gIdx === 0) copy[idx].imageUrl = base64;
                                        updateField('blogs', null as any, copy);
                                      });
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const copy = [...data.blogs];
                                    copy[idx].galleryImages.splice(gIdx, 1);
                                    if (gIdx === 0) copy[idx].imageUrl = copy[idx].galleryImages[0] || '';
                                    updateField('blogs', null as any, copy);
                                  }}
                                  className="text-[10px] font-bold text-red-500 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...data.blogs];
                            if (!copy[idx].galleryImages) copy[idx].galleryImages = [];
                            copy[idx].galleryImages.push('');
                            updateField('blogs', null as any, copy);
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs text-ocean-accent font-semibold hover:underline"
                        >
                          <Plus size={14} />
                          Add attachment photo
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newItem: BlogItem = {
                      id: `blog-${Date.now()}`,
                      title: 'Research blog name',
                      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                      excerpt: 'Brief overview summaries...',
                      content: 'Long narrative analysis text...',
                      author: data.hero.name || 'Shaibal Bhattacharjee',
                      readTime: '5 min read',
                      imageUrl: 'https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg?auto=compress&cs=tinysrgb&w=600',
                      galleryImages: [
                        'https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg?auto=compress&cs=tinysrgb&w=900',
                        'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=900',
                        'https://images.pexels.com/photos/33129/popcorn-macro-water-plant.jpg?auto=compress&cs=tinysrgb&w=900'
                      ]
                    };
                    updateField('blogs', null as any, [...data.blogs, newItem]);
                  }}
                  className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-ocean-accent rounded-xl text-slate-500 text-sm font-semibold hover:text-ocean-accent transition-colors flex justify-center items-center gap-2 cursor-pointer bg-white"
                >
                  <Plus size={16} />
                  Add Fieldwork / Research Blog Entry
                </button>
              </div>
            )}

            {/* TAB: ARCHIVE */}
            {activeTab === 'archive' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h4 className="text-xs font-serif font-bold text-slate-800 text-sm border-b pb-2">Archive & Media Section Settings</h4>
                  <p className="text-xs text-slate-500 mt-1">Manage the historical visual records of fieldwork, research labs, or expeditions. Add files without quantity limits (limit: 30MB per file).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Section Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded text-sm font-sans"
                      value={data.archive?.title || ''}
                      onChange={(e) => {
                        const arch = { ...(data.archive || { title: "", description: "", items: [] }) };
                        arch.title = e.target.value;
                        setData(prev => ({
                          ...prev,
                          archive: arch
                        }));
                        setIsModified(true);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Section Description</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed font-sans"
                      value={data.archive?.description || ''}
                      onChange={(e) => {
                        const arch = { ...(data.archive || { title: "", description: "", items: [] }) };
                        arch.description = e.target.value;
                        setData(prev => ({
                          ...prev,
                          archive: arch
                        }));
                        setIsModified(true);
                      }}
                    />
                  </div>
                </div>

                {/* Brand new: Add Media via OneDrive, Google Drive or Cloud Link */}
                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 mt-4 space-y-3 font-sans">
                  <h4 className="text-xs font-bold text-ocean-dark flex items-center gap-1">
                    <span>🔗</span> Add Image or Video via Cloud Link (Google Drive / OneDrive / Dropbox / Web URLs)
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Paste a shared folder file url, Google Drive view path, OneDrive share URL, or direct media link. Standard OneDrive links are auto-converted to raw streaming URLs; Google Drive files load with custom fast pre-renditioning.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Item Title / Caption</label>
                      <input
                        type="text"
                        placeholder="e.g. Laboratory Sample"
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Paste Cloud Sharing URL Link</label>
                      <input
                        type="text"
                        placeholder="e.g. https://drive.google.com/file/d/... or OneDrive short link"
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Realtime Live Link Parser & Checker Preview */}
                  {newLinkUrl.trim() && (() => {
                    const resolved = resolveMediaLink(newLinkUrl, newLinkType);
                    return (
                      <div className="bg-white border rounded-lg p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] border-b pb-1">
                          <span className="font-semibold text-slate-800">Detected Source: <span className="uppercase text-ocean-accent">{resolved.source}</span></span>
                          <span className="text-slate-400">Auto-Resolved Preview</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5 text-[11px] text-slate-600">
                            <p className="line-clamp-2"><strong>Sanitized URL:</strong> <span className="break-all font-mono text-[10px] bg-slate-50 border p-1 rounded block max-h-12 overflow-y-auto">{resolved.originalUrl}</span></p>
                            <p className="line-clamp-2"><strong>Stream URL:</strong> <span className="break-all font-mono text-[10px] bg-slate-50 border p-1 rounded block max-h-12 overflow-y-auto">{resolved.directUrl}</span></p>
                            <p><strong>Embeddable Frame:</strong> <span className="font-semibold text-slate-700">{resolved.isEmbeddable ? 'Yes (IFrame embedded player)' : 'No (Raw image/video tag stream)'}</span></p>
                          </div>
                          <div className="flex items-center justify-center bg-slate-900 rounded aspect-video overflow-hidden border border-slate-200">
                            {newLinkType === 'video' ? (
                              resolved.isEmbeddable ? (
                                <iframe
                                  src={resolved.embedUrl}
                                  className="w-full h-full border-0 pointer-events-none"
                                  title="Admin Live Preview"
                                  allow="autoplay"
                                />
                              ) : (
                                <video
                                  src={resolved.directUrl}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                  controls={false}
                                />
                              )
                            ) : (
                              <img
                                src={resolved.displayUrl}
                                alt="Live Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x310/e2e8f0/475569?text=CORS+Isolated+Cloud+Media';
                                }}
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex flex-wrap items-center justify-between pt-1 gap-4">
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="new-link-type"
                          checked={newLinkType === 'image'}
                          onChange={() => setNewLinkType('image')}
                          className="text-ocean-accent focus:ring-ocean-accent"
                        />
                        Image Link
                      </label>
                      <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="new-link-type"
                          checked={newLinkType === 'video'}
                          onChange={() => setNewLinkType('video')}
                          className="text-ocean-accent focus:ring-ocean-accent"
                        />
                        Video Link
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newLinkUrl.trim()) {
                          showNotification('Please enter a valid URL link.', 'error');
                          return;
                        }
                        const name = newLinkName.trim() || `Cloud Record (${newLinkType === 'video' ? 'Video' : 'Image'})`;
                        
                        const arch = { ...(data.archive || { title: "Archive & Field Records", description: "", items: [] }) };
                        const newItem = {
                          id: `arch-${Date.now()}`,
                          name,
                          mediaUrl: newLinkUrl.trim(),
                          mediaType: newLinkType,
                          fileSize: 0
                        };
                        arch.items = [...arch.items, newItem];
                        setData(prev => ({
                          ...prev,
                          archive: arch
                        }));
                        setIsModified(true);
                        setNewLinkUrl('');
                        setNewLinkName('');
                        showNotification('Cloud media link added to archive list. Press "Save Changes" on the panel to publish and sync live to other visitor browser windows!', 'success');
                      }}
                      className="px-3.5 py-1.5 bg-ocean-dark text-white rounded text-xs font-semibold hover:bg-ocean-accent transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Link to Archive
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase">Uploaded Files ({data.archive?.items?.length || 0})</h4>
                      <p className="text-[10px] text-slate-400">Supported formats: JPG, PNG, GIF, MP4, WebM. (Max 30MB each)</p>
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        id="archive-file-uploader"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (file.size > MAX_FILE_SIZE_BYTES) {
                            showNotification(`File is too large. The size limit is 30MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`, 'error');
                            e.target.value = '';
                            return;
                          }

                          showNotification(`Uploading "${file.name}" to the server...`, 'info');

                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            const rawBase64 = reader.result as string;
                            const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
                            let finalUrl = rawBase64;

                            try {
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  name: file.name,
                                  type: file.type,
                                  base64: rawBase64
                                })
                              });

                              if (res.ok) {
                                const result = await res.json();
                                if (result && result.url) {
                                  finalUrl = result.url;
                                  showNotification(`"${file.name}" uploaded successfully!`, 'success');
                                }
                              } else {
                                console.warn('Server archive upload failed, using local base64 fallback.');
                                showNotification('Server upload bypassed, using local database draft instead.', 'info');
                              }
                            } catch (uploadErr) {
                              console.error('Exception during archive upload:', uploadErr);
                              showNotification('Using offline database storage due to link state.', 'info');
                            }
                            
                            const arch = { ...(data.archive || { title: "Archive & Field Records", description: "", items: [] }) };
                            const newItem = {
                              id: `arch-${Date.now()}`,
                              name: file.name.replace(/\.[^/.]+$/, ""), // remove extension for cleaner default name
                              mediaUrl: finalUrl,
                              mediaType,
                              fileSize: file.size
                            };
                            arch.items = [...arch.items, newItem];
                            
                            setData(prev => ({
                              ...prev,
                              archive: arch
                            }));
                            setIsModified(true);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <label
                        htmlFor="archive-file-uploader"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ocean-accent text-white rounded text-xs font-semibold hover:bg-ocean-dark transition-colors cursor-pointer"
                      >
                        <Upload size={14} />
                        Upload Photo / Video
                      </label>
                    </div>
                  </div>

                  {(!data.archive?.items || data.archive.items.length === 0) ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                      <p className="text-xs text-slate-400">No media uploaded in the archive yet. Click the upload button above to add active items.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
                      {data.archive.items.map((item, idx) => (
                        <div key={item.id} className="p-3 border rounded-xl bg-slate-50 flex flex-col space-y-3 relative group shadow-sm hover:shadow transition-shadow">
                          <button
                            type="button"
                            onClick={() => {
                              const arch = { ...(data.archive || { title: "", description: "", items: [] }) };
                              arch.items = arch.items.filter(i => i.id !== item.id);
                              setData(prev => ({
                                ...prev,
                                archive: arch
                              }));
                              setIsModified(true);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-white/95 border border-red-100 hover:bg-red-50 text-red-500 rounded-full shadow-sm hover:scale-105 transition-all z-10"
                            title="Remove from archive"
                          >
                            <Trash2 size={12} />
                          </button>

                          <div className="w-full h-32 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative">
                            {(() => {
                              const resolved = resolveMediaLink(item.mediaUrl, item.mediaType);
                              if (item.mediaType === 'video') {
                                if (resolved.isEmbeddable) {
                                  return (
                                    <iframe 
                                      src={resolved.embedUrl} 
                                      className="w-full h-full border-0 scale-102 pointer-events-none" 
                                      allow="autoplay"
                                    />
                                  );
                                }
                                return (
                                  <video
                                    src={resolved.directUrl}
                                    className="w-full h-full object-cover"
                                    controls={false}
                                    muted
                                    playsInline
                                  />
                                );
                              } else {
                                return (
                                  <img
                                    src={resolved.displayUrl || item.mediaUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x310/e2e8f0/475569?text=CORS+Isolated+Cloud+Media';
                                    }}
                                  />
                                );
                              }
                            })()}
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                              {item.mediaType.toUpperCase()} {item.fileSize ? `• ${(item.fileSize / (1024 * 1024)).toFixed(1)}MB` : ''}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Item Title / Caption</label>
                            <input
                              type="text"
                              className="w-full p-1 border border-slate-300 rounded text-xs"
                              value={item.name}
                              onChange={(e) => {
                                const arch = { ...(data.archive || { title: "", description: "", items: [] }) };
                                arch.items = arch.items.map(i => {
                                  if (i.id === item.id) {
                                    return { ...i, name: e.target.value };
                                  }
                                  return i;
                                });
                                setData(prev => ({
                                  ...prev,
                                  archive: arch
                                }));
                                setIsModified(true);
                              }}
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Source Link (Cloud Link or Uploaded URL)</label>
                            <div className="flex gap-1.5 items-center">
                              <input
                                type="text"
                                className="w-full p-1 border border-slate-300 rounded text-[11px] font-mono"
                                value={item.mediaUrl}
                                onChange={(e) => {
                                  const arch = { ...(data.archive || { title: "", description: "", items: [] }) };
                                  arch.items = arch.items.map(i => {
                                    if (i.id === item.id) {
                                      return { ...i, mediaUrl: e.target.value };
                                    }
                                    return i;
                                  });
                                  setData(prev => ({
                                    ...prev,
                                    archive: arch
                                  }));
                                  setIsModified(true);
                                }}
                              />
                              <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-semibold rounded whitespace-nowrap text-slate-700">
                                <Upload size={10} className="text-ocean-accent" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    handleFileUpload(e, (base64) => {
                                      const arch = { ...(data.archive || { title: "", description: "", items: [] }) };
                                      const mediaType = e.target.files?.[0].type.startsWith('video/') ? 'video' : 'image';
                                      arch.items = arch.items.map(i => {
                                        if (i.id === item.id) {
                                          return { ...i, mediaUrl: base64, mediaType, fileSize: e.target.files?.[0].size };
                                        }
                                        return i;
                                      });
                                      setData(prev => ({
                                        ...prev,
                                        archive: arch
                                      }));
                                      setIsModified(true);
                                    });
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: FOOTER & SOCIAL NETWORKS */}
            {activeTab === 'contact' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-serif font-bold text-slate-800 text-sm border-b pb-2">Direct Contact details & Index and citations panels</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Academic Email</label>
                    <input
                      type="email"
                      className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
                      value={data.contact.email}
                      onChange={(e) => updateField('contact', 'email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Future Openness Note Label</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                      value={data.contact.futureWorkText}
                      onChange={(e) => updateField('contact', 'futureWorkText', e.target.value)}
                    />
                  </div>
                </div>

                {/* Mailing location lines */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Location Address Lines</label>
                  <div className="space-y-2">
                    {data.contact.location.map((line, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          className="flex-grow p-1.5 border border-slate-300 rounded text-xs"
                          value={line}
                          onChange={(e) => {
                            const copy = [...data.contact.location];
                            copy[idx] = e.target.value;
                            updateField('contact', 'location', copy);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...data.contact.location];
                            copy.splice(idx, 1);
                            updateField('contact', 'location', copy);
                          }}
                          className="text-red-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('contact', 'location', [...data.contact.location, 'Chittagong, Bangladesh'])}
                    className="mt-2.5 text-xs text-ocean-accent hover:underline font-semibold"
                  >
                    + Add Address Line
                  </button>
                </div>

                {/* Academic Networks citation buttons profiles */}
                <div className="pt-6 border-t border-slate-155">
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Academic Index Pages</h4>
                  <div className="space-y-4">
                    {data.contact.profiles.map((prof, idx) => (
                      <div key={prof.id} className="p-3 border rounded bg-slate-50 relative space-y-2 group">
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...data.contact.profiles];
                            copy.splice(idx, 1);
                            updateField('contact', 'profiles', copy);
                          }}
                          className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={12} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <input
                              type="text"
                              placeholder="Network Name"
                              className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold text-slate-800"
                              value={prof.name}
                              onChange={(e) => {
                                const copy = [...data.contact.profiles];
                                copy[idx].name = e.target.value;
                                updateField('contact', 'profiles', copy);
                              }}
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Short tag label (e.g. RG)"
                              className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono"
                              value={prof.shortLabel}
                              onChange={(e) => {
                                const copy = [...data.contact.profiles];
                                copy[idx].shortLabel = e.target.value;
                                updateField('contact', 'profiles', copy);
                              }}
                            />
                          </div>
                          <div>
                            <select
                              className="w-full p-1.5 border border-slate-300 bg-white rounded text-xs"
                              value={prof.iconType}
                              onChange={(e) => {
                                const copy = [...data.contact.profiles];
                                copy[idx].iconType = e.target.value as any;
                                updateField('contact', 'profiles', copy);
                              }}
                            >
                              <option value="default">Default Label</option>
                              <option value="linkedin">LinkedIn</option>
                              <option value="google">Google Scholar</option>
                              <option value="researchgate">ResearchGate</option>
                              <option value="orcid">ORCID ID</option>
                              <option value="scopus">Scopus</option>
                              <option value="clarivate">Clarivate Web of Science</option>
                              <option value="facebook">Facebook</option>
                              <option value="x">X / Twitter</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Complete indexing network URL Link"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono"
                            value={prof.url}
                            onChange={(e) => {
                              const copy = [...data.contact.profiles];
                              copy[idx].url = e.target.value;
                              updateField('contact', 'profiles', copy);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newItem = { id: `prof-${Date.now()}`, name: 'New network', url: '#', shortLabel: 'NET', iconType: 'default' as const };
                      updateField('contact', 'profiles', [...data.contact.profiles, newItem]);
                    }}
                    className="text-xs text-ocean-accent hover:underline font-semibold mt-3"
                  >
                    + Add Network Profile
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Floating State Toast Notification Banner */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl shadow-2xl border animate-fade-in font-sans text-xs max-w-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
              : notification.type === 'error'
              ? 'bg-rose-50 border-rose-250 text-rose-800 animate-bounce'
              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}
          style={{ animation: 'slideUp 0.15s ease-out' }}
        >
          <div className="flex-1 font-semibold">{notification.message}</div>
          <button 
            type="button" 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Confirmation Modal Overlay */}
      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 animate-scale-in">
            <h3 className="text-sm font-bold text-slate-800">Please Confirm Action</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{confirmAction.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmAction.onConfirm();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reset Default Templates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
