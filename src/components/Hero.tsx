import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, Download, X } from 'lucide-react';
import { HeroData, RecentActivityItem } from '../types';
import { formatAmpersand } from './Ampersand';

interface HeroProps {
  hero: HeroData;
  recentActivities: RecentActivityItem[];
}

export default function Hero({ hero, recentActivities }: HeroProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);

  // Validate slideshow photos (fallback if empty)
  const images = useMemo(() => {
    const arr = Array.isArray(hero.galleryImages) ? hero.galleryImages.filter(Boolean) : [];
    const fallback = hero.imageUrl || "https://picsum.photos/400/400?grayscale";
    const result = arr.length > 0 ? [...arr] : [fallback];
    while (result.length < 5) result.push(result[result.length - 1] || fallback);
    return result.slice(0, 5);
  }, [hero.galleryImages, hero.imageUrl]);

  // Validate slideshow videos (fallback if empty)
  const videos = useMemo(() => {
    const arr = Array.isArray(hero.videoUrls) ? hero.videoUrls.filter(Boolean) : [];
    const fallback = hero.videoUrl || "https://videos.pexels.com/video-files/3576686/3576686-hd_1920_1080_30fps.mp4";
    const result = arr.length > 0 ? [...arr] : [fallback];
    while (result.length < 5) result.push(result[result.length - 1] || fallback);
    return result.slice(0, 5);
  }, [hero.videoUrls, hero.videoUrl]);

  // Cycle image slideshow (every 4 seconds)
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  // Cycle background video slideshow (every 6 seconds)
  useEffect(() => {
    if (videos.length <= 1) return;
    const interval = setInterval(() => {
      setActiveVideoIdx((prev) => (prev + 1) % videos.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [videos]);

  const hasCV = !!(hero.cvUrl && hero.cvUrl.trim().length > 0);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-900/10" id="hero-section">
      {/* Dynamic Video background flow */}
      <div className="absolute inset-0 z-0">
        <video
          key={videos[activeVideoIdx]}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover scale-105 transition-all duration-1000"
        >
          <source src={videos[activeVideoIdx]} type="video/mp4" />
          <img
            src="https://images.pexels.com/photos/1482193/pexels-photo-1482193.jpeg"
            alt="Ocean coast fallback"
            className="w-full h-full object-cover"
          />
        </video>
        {/* 10% black and blue mixed themed overlays */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-ocean-dark/30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-ocean-dark/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark/50 via-black/10 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-32 pb-24">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
          {/* Main textual presentation */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-amber-400 font-bold tracking-wider uppercase text-sm mb-3 drop-shadow-md">
              {hero.subtitle}
            </h2>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              {hero.name}
            </h1>
            
            <div className="mb-8">
              <p className="text-xl md:text-2xl text-slate-100 font-light mb-2 drop-shadow-md font-serif">
                {formatAmpersand(hero.title)}
              </p>
              <p className="text-lg md:text-xl text-slate-200 font-light drop-shadow-md">
                {hero.affiliationLine1}
              </p>
              <p className="text-lg md:text-xl text-slate-200 font-light drop-shadow-md opacity-90">
                {hero.affiliationLine2}
              </p>
            </div>

            <p className="text-base md:text-lg text-slate-200 max-w-2xl mx-auto md:mx-0 mb-10 leading-relaxed drop-shadow-sm font-light">
              {hero.summary}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button
                type="button"
                onClick={() => setIsActivitiesModalOpen(true)}
                className="inline-flex items-center px-6 py-3 border border-white/30 text-sm font-medium rounded-lg text-white bg-white/15 backdrop-blur-md hover:bg-white/25 active:bg-white/30 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                id="btn-recent-activities"
              >
                <Briefcase className="mr-2 h-4 w-4 text-amber-400" />
                Recent Activities
              </button>

              <a
                href={hasCV ? hero.cvUrl : '#'}
                className={`inline-flex items-center px-6 py-3 border border-white/30 text-sm font-medium rounded-lg text-white bg-white/15 backdrop-blur-md transition-all shadow-lg ${
                  hasCV ? 'hover:bg-white/25 hover:shadow-xl' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (!hasCV) {
                    e.preventDefault();
                    alert('CV file has not been uploaded to the workspace yet. Please upload it via Admin settings.');
                  }
                }}
                target={hasCV ? '_blank' : undefined}
                rel={hasCV ? 'noreferrer' : undefined}
                download={hasCV}
                id="btn-cv-download"
              >
                <Download className="mr-2 h-4 w-4 text-cyan-400" />
                Download CV
              </a>
            </div>
          </div>

          {/* Right Presentation Picture sequencing */}
          <div className="hidden md:flex flex-col items-center flex-shrink-0 relative group">
            <div className="w-64 h-80 md:w-80 md:h-[26rem] relative">
              {/* Blur back glow */}
              <div className="absolute inset-0 bg-ocean-accent/25 rounded-2xl blur-3xl transform translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500" />
              <img
                src={images[activeImageIdx]}
                alt={hero.name}
                className="w-full h-full object-cover rounded-2xl border-4 border-white/25 shadow-2xl relative z-10 duration-700"
              />
            </div>
            
            {/* Realtime collaboration badge */}
            <div className="mt-6 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2.5 z-20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Open to Collaboration
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities modal popup trigger */}
      {isActivitiesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="modal-container-recents">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-serif font-bold text-ocean-dark">
                Recent Research Updates & Fieldwork
              </h3>
              <button
                type="button"
                onClick={() => setIsActivitiesModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                id="btn-close-recents-modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {recentActivities.length === 0 ? (
                <p className="text-center py-10 text-slate-400 italic">No recent activities updated yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentActivities.map((act) => (
                    <article key={act.id} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50 flex flex-col shadow-sm">
                      <div className="h-44 bg-slate-200 relative overflow-hidden">
                        {act.mediaType === 'video' ? (
                          <video src={act.mediaUrl} className="w-full h-full object-cover" controls playsInline />
                        ) : (
                          <img src={act.mediaUrl} alt={act.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm mb-1">{act.name}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
