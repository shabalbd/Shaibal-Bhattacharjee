import React from 'react';
import { Mail, MapPin, Shield, Linkedin, Facebook, Twitter, BookOpen, GraduationCap, Database, Layers, User } from 'lucide-react';
import { ContactData } from '../types';
import { formatAmpersand } from './Ampersand';

interface FooterProps {
  contact: ContactData;
  onOpenLogin: () => void;
}

export default function Footer({ contact, onOpenLogin }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Render profiles icons
  const renderProfileIcon = (type: string | undefined | null, fallback: string) => {
    const normType = (type || '').trim().toLowerCase();
    switch (normType) {
      case 'linkedin':
        return <Linkedin size={14} className="shrink-0" />;
      case 'facebook':
        return <Facebook size={14} className="shrink-0" />;
      case 'x':
      case 'twitter':
        return <Twitter size={14} className="shrink-0" />;
      case 'google':
      case 'scholar':
        return <BookOpen size={14} className="shrink-0" />;
      case 'researchgate':
        return <GraduationCap size={14} className="shrink-0" />;
      case 'orcid':
        return <User size={14} className="shrink-0" />;
      case 'scopus':
        return <Database size={14} className="shrink-0" />;
      case 'clarivate':
        return <Layers size={14} className="shrink-0" />;
      default:
        return <span className="font-mono font-bold text-[9px] uppercase shrink-0">{fallback}</span>;
    }
  };

  return (
    <footer id="contact" className="bg-ocean-dark text-slate-300 pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Column 1: Contact basic details */}
          <div>
            <h3 className="text-white text-base font-serif font-bold mb-6 tracking-wide">
              Contact
            </h3>
            <div className="space-y-4 font-sans">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 hover:text-white hover:underline transition-colors text-sm font-light text-slate-300"
              >
                <Mail size={18} className="text-ocean-accent shrink-0" />
                <span>{contact.email}</span>
              </a>
              
              <div className="flex items-start gap-3 text-sm font-light text-slate-300">
                <MapPin size={18} className="text-ocean-accent mt-0.5 shrink-0" />
                <div>
                  {contact.location.map((line, idx) => (
                    <span className="block leading-relaxed" key={idx}>
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Specific Academic Profiles */}
          <div>
            <h3 className="text-white text-base font-serif font-bold mb-6 tracking-wide">
              {formatAmpersand("Academic & Social Profiles")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {contact.profiles.map((prof) => (
                <a
                  key={prof.id}
                  href={prof.url}
                  className="flex items-center gap-2.5 hover:text-white transition-colors group text-sm font-light text-slate-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="bg-white/10 p-1.5 rounded group-hover:bg-ocean-accent group-hover:text-white transition-colors flex items-center justify-center w-7 h-7 text-slate-300">
                    {renderProfileIcon(prof.iconType, prof.shortLabel)}
                  </div>
                  <span className="truncate">{prof.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Opportunities statement */}
          <div>
            <h3 className="text-white text-base font-serif font-bold mb-6 tracking-wide">
              Future Endeavors
            </h3>
            <p className="text-sm leading-relaxed text-slate-300 font-light">
              {contact.futureWorkText}
            </p>
          </div>
        </div>

        {/* Lower bar banner */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs opacity-60">
          <p className="text-center md:text-left mb-3 md:mb-0">
            © {currentYear} Shaibal Bhattacharjee. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenLogin}
              className="opacity-50 hover:opacity-100 hover:text-white transition-all flex items-center justify-center p-1 cursor-pointer bg-transparent border-none shrink-0"
              aria-label="Admin settings mode"
              id="admin-login-trigger"
            >
              <Shield size={14} className="hover:scale-110 transition-transform shrink-0" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
