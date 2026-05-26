import React from 'react';
import { Users, BookOpen, GraduationCap, FileText } from 'lucide-react';
import { ActivitiesData } from '../types';

interface ActivitiesProps {
  activities: ActivitiesData;
}

export default function Activities({ activities }: ActivitiesProps) {
  // Render distinct icons based on indexing or header matching
  const renderActivityIcon = (idx: number) => {
    switch (idx % 4) {
      case 0: return <Users className="text-ocean-accent h-7 w-7 shrink-0" />;
      case 1: return <BookOpen className="text-ocean-accent h-7 w-7 shrink-0" />;
      case 2: return <GraduationCap className="text-ocean-accent h-7 w-7 shrink-0" />;
      default: return <FileText className="text-ocean-accent h-7 w-7 shrink-0" />;
    }
  };

  return (
    <section id="activities" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section title header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold text-ocean-dark mb-4">
            {activities.sectionTitle}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base font-light">
            {activities.sectionDescription}
          </p>
          <div className="w-16 h-1 bg-ocean-accent mx-auto rounded-full mt-4" />
        </div>

        {/* Development grid list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activities.development.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-6 md:p-8 rounded-xl border border-slate-100/80 hover:shadow-md hover:bg-white transition-all duration-300 group flex items-start gap-4"
            >
              <div className="p-3 bg-white rounded-lg border border-slate-200/60 shadow-sm flex-shrink-0 group-hover:bg-ocean-light transition-colors">
                {renderActivityIcon(idx)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-ocean-accent uppercase tracking-wider mb-2">
                  {item.subtitle}
                </p>
                <p className="text-slate-600 text-sm leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
