import React from 'react';
import { FileText, Layers, Users, BookOpen, ExternalLink, Presentation, Book, Database, Code, GraduationCap, Binary } from 'lucide-react';
import { PublicationItem, PublicationsConfig } from '../types';
import { formatAmpersand } from './Ampersand';

interface PublicationsProps {
  publicationsConfig: PublicationsConfig;
  publications: PublicationItem[];
}

export default function Publications({ publicationsConfig, publications }: PublicationsProps) {
  const articles = publications.filter((p) => p.type === 'article');
  const preprints = publications.filter((p) => p.type === 'preprint');
  const conferences = publications.filter((p) => p.type === 'conference');
  const presentations = publications.filter((p) => p.type === 'presentation');
  const posters = publications.filter((p) => p.type === 'poster');
  const workshops = publications.filter((p) => p.type === 'workshop');
  const books = publications.filter((p) => p.type === 'book');
  const data = publications.filter((p) => p.type === 'data');
  const code = publications.filter((p) => p.type === 'code');
  const thesis = publications.filter((p) => p.type === 'thesis');
  const dataArticles = publications.filter((p) => p.type === 'data-article');

  const renderPubItem = (pub: PublicationItem) => {
    return (
      <div 
        key={pub.id} 
        className="p-5 rounded-lg bg-white border-l-4 border-ocean-accent hover:bg-slate-50 transition-colors shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4"
      >
        <div className="flex-1">
          <p className="text-slate-800 text-sm md:text-base leading-snug">
            {/* Format authors list, highlighting Shaibal S.*/}
            <span className="font-semibold text-slate-900">
              {pub.authors.map((author, index) => {
                const isShaibal = author.toLowerCase().includes('bhattacharjee') || author.toLowerCase().startsWith('bhattacharjee');
                return (
                  <React.Fragment key={index}>
                    <span className={isShaibal ? 'underline font-bold' : ''}>{author}</span>
                    {index < pub.authors.length - 1 ? ', ' : ''}
                  </React.Fragment>
                );
              })}
            </span>
            <span> ({pub.year}). </span>
            <span className="font-medium text-slate-800">{pub.title}. </span>
            <span className="italic text-slate-600">{pub.journal}</span>
            {pub.volume && <span className="text-slate-600">, {pub.volume}</span>}
            {pub.issue && <span className="text-slate-500">({pub.issue})</span>}
            {pub.pages && <span className="text-slate-500">, {pub.pages}</span>}
            <span>.</span>
          </p>

          <div className="mt-2.5 flex items-center gap-3 flex-wrap">
            {pub.status && (
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                pub.status === 'Published' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : pub.status === 'Under Review' 
                    ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {pub.status}
              </span>
            )}
          </div>
        </div>

        {pub.doi && (
          <a
            href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center text-xs text-ocean-accent hover:text-ocean-medium font-semibold whitespace-nowrap bg-ocean-light hover:bg-ocean-accent hover:text-white px-3 py-1.5 rounded-md transition-all gap-1 border border-ocean-accent/10 shrink-0"
          >
            DOI Link
            <ExternalLink size={12} className="shrink-0" />
          </a>
        )}
      </div>
    );
  };

  const renderSection = (title: string, list: PublicationItem[], icon: React.ReactNode) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-12">
        <h3 className="text-lg font-bold text-ocean-dark mb-6 flex items-center gap-2.5 border-b border-slate-200/60 pb-2 font-serif">
          {icon}
          {formatAmpersand(title)}
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-sans font-normal">
            {list.length}
          </span>
        </h3>
        <div className="space-y-4">
          {list.map(renderPubItem)}
        </div>
      </div>
    );
  };

  return (
    <section id="publications" className="py-20 bg-slate-50 ocean-grid">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title bar banner */}
        <div className="flex items-center gap-3.5 mb-14 border-b border-slate-200/60 pb-4">
          <div className="bg-ocean-dark p-2 text-white rounded-lg shadow-md shrink-0">
            <FileText size={24} className="shrink-0" />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-ocean-dark">
              {publicationsConfig.title}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {publicationsConfig.description}
            </p>
          </div>
        </div>

        {/* Dynamic Category groups */}
        {renderSection("Articles", articles, <Layers size={18} className="text-ocean-accent shrink-0" />)}
        {renderSection("Preprints", preprints, <FileText size={18} className="text-ocean-accent shrink-0" />)}
        {renderSection("Conferences/Seminars", conferences, <Users size={18} className="text-ocean-accent shrink-0" />)}
        {renderSection("Presentations", presentations, <Presentation size={18} className="text-ocean-accent shrink-0" />)}
        {renderSection("Posters", posters, <FileText size={18} className="text-ocean-accent shrink-0" />)}
        {renderSection("Workshops", workshops, <BookOpen size={18} className="text-ocean-accent shrink-0" />)}
        {renderSection("Books", books, <Book size={18} className="text-ocean-accent shrink-0" />)}
        {renderSection("Data", data, <Database size={18} className="text-ocean-accent shrink-0" />)}
        {renderSection("Code", code, <Code size={18} className="text-ocean-accent shrink-0" />)}
        {renderSection("Thesis", thesis, <GraduationCap size={18} className="text-ocean-accent shrink-0" />)}
        {renderSection("Data Articles", dataArticles, <Binary size={18} className="text-ocean-accent shrink-0" />)}

      </div>
    </section>
  );
}
