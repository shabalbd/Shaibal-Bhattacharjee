import React, { useState } from 'react';
import { Play, Maximize2, X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { ArchiveData } from '../types';
import { formatAmpersand } from './Ampersand';
import { resolveMediaLink } from '../utils/mediaResolver';

interface ArchiveProps {
  archive?: ArchiveData;
}

export default function Archive({ archive }: ArchiveProps) {
  const [selectedItem, setSelectedItem] = useState<{
    mediaUrl: string;
    mediaType: 'image' | 'video';
    name: string;
  } | null>(null);

  // Fallback initial values if the section isn't populated or updated yet
  const title = archive?.title || "Archive & Field Records";
  const description = archive?.description || "An extensive repository of field logs, expedition photos, and laboratory reference material captured during active coastal surveys.";
  const items = archive?.items || [];

  return (
    <section id="archive" className="py-20 bg-slate-50 border-t border-b border-slate-200/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section title header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold text-ocean-dark mb-4">
            {formatAmpersand(title)}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base font-light">
            {description}
          </p>
          <div className="w-16 h-1 bg-ocean-accent mx-auto rounded-full mt-4" />
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-lg mx-auto">
            <ImageIcon className="mx-auto text-slate-300 mb-3 h-10 w-10 animate-pulse" />
            <p className="text-sm font-medium text-slate-500">The archive is currently being populated.</p>
            <p className="text-xs text-slate-400 mt-1">Please log in to the administrator workspace to upload field records, diagrams, and video materials.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item) => {
              const resolved = resolveMediaLink(item.mediaUrl, item.mediaType);
              return (
                <div
                  key={item.id}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-ocean-accent/30 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Media Container */}
                  <div className="w-full aspect-video bg-slate-900 overflow-hidden relative flex items-center justify-center">
                    {item.mediaType === 'video' ? (
                      <>
                        {resolved.source !== 'standard' ? (
                          <img
                            src={resolved.displayUrl}
                            alt={item.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <video
                            src={resolved.directUrl}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                            muted
                            playsInline
                            disabled={true}
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                          <span className="p-3 bg-white/90 backdrop-blur text-ocean-dark rounded-full shadow-md group-hover:scale-110 group-hover:bg-ocean-accent group-hover:text-white transition-all duration-300">
                            <Play size={18} fill="currentColor" />
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={resolved.displayUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                          <span className="p-2.5 bg-white/95 text-slate-700 rounded-full shadow transition-transform">
                            <Maximize2 size={16} />
                          </span>
                        </div>
                      </>
                    )}

                    {/* Indicator badging */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1 shadow-sm font-mono tracking-wider border border-slate-200/50">
                      {item.mediaType === 'video' ? (
                        <>
                          <VideoIcon size={10} className="text-ocean-accent" />
                          Video
                        </>
                      ) : (
                        <>
                          <ImageIcon size={10} className="text-ocean-accent" />
                          Image
                        </>
                      )}
                    </div>
                  </div>

                  {/* Content info wrapper */}
                  <div className="p-4 flex-grow border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
                      {item.name}
                    </span>
                    <span className="text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 size={14} className="text-ocean-accent" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox Modal slider overlay */}
        {selectedItem && (() => {
          const resolved = resolveMediaLink(selectedItem.mediaUrl, selectedItem.mediaType);
          return (
            <div
              className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-8 animate-fade-in"
              id="archive-lightbox-portal"
              onClick={() => setSelectedItem(null)}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 md:top-8 md:right-8 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 cursor-pointer"
                aria-label="Close archive media lightroom"
              >
                <X size={24} />
              </button>

              <div 
                className="max-w-4xl w-full flex flex-col justify-center items-center bg-transparent relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full max-h-[75vh] flex justify-center items-center rounded-xl overflow-hidden bg-black shadow-2xl relative">
                  {selectedItem.mediaType === 'video' ? (
                    resolved.isEmbeddable ? (
                      <iframe
                        src={resolved.embedUrl}
                        className="w-full aspect-video max-h-[75vh] border-0 rounded-lg min-h-[400px]"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={selectedItem.name}
                      />
                    ) : (
                      <video
                        src={resolved.directUrl}
                        className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
                        controls
                        autoPlay
                        playsInline
                      />
                    )
                  ) : (
                    <img
                      src={resolved.displayUrl}
                      alt={selectedItem.name}
                      className="max-w-full max-h-[75vh] w-auto h-auto object-contain animate-zoom-in"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                
                <div className="mt-4 text-center max-w-xl">
                  <p className="text-white text-lg font-medium font-serif tracking-tight px-4">
                    {selectedItem.name}
                  </p>
                  <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-wider">
                    Reference Record • {selectedItem.mediaType === 'video' ? 'Media Stream' : 'Hi-Res Image'}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </section>
  );
}
