import React from 'react';
import { Users } from 'lucide-react';
import { PersonItem, PeopleConfig } from '../types';
import { formatAmpersand } from './Ampersand';
import { resolveMediaLink } from '../utils/mediaResolver';

interface TeamProps {
  peopleConfig: PeopleConfig;
  people: PersonItem[];
}

export default function Team({ peopleConfig, people }: TeamProps) {
  const hasTitle = !!(peopleConfig?.title && peopleConfig.title.trim() !== '');
  const hasDescription = !!(peopleConfig?.description && peopleConfig.description.trim() !== '');
  const hasPeople = Array.isArray(people) && people.length > 0;

  if (!hasTitle && !hasDescription && !hasPeople) return null;

  return (
    <section id="people" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title details */}
        {(hasTitle || hasDescription) && (
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <div className="bg-ocean-light p-3 rounded-full text-ocean-accent shadow-sm">
                <Users size={28} />
              </div>
            </div>
            {hasTitle && (
              <h2 className="text-3xl font-serif font-bold text-ocean-dark mb-4">
                {formatAmpersand(peopleConfig.title)}
              </h2>
            )}
            {hasDescription && (
              <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base font-light">
                {peopleConfig.description}
              </p>
            )}
            <div className="w-16 h-1 bg-ocean-accent mx-auto rounded-full mt-5" />
          </div>
        )}

        {/* Directory Grid */}
        {hasPeople ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {people.map((person) => {
              const hasImg = person.imageUrl && !person.imageUrl.includes('pexels.com');
              const resolvedImg = hasImg
                ? (resolveMediaLink(person.imageUrl || '', 'image').displayUrl || person.imageUrl)
                : '';
              const initials = person.name ? person.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
              return (
                <div
                  key={person.id}
                  className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full group"
                >
                  <div className="aspect-square overflow-hidden relative bg-slate-200 flex items-center justify-center">
                    <div className="absolute inset-0 bg-ocean-accent/10 opacity-70 group-hover:opacity-0 transition-opacity z-10" />
                    {hasImg ? (
                      <img
                        src={resolvedImg}
                        alt={person.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 text-2xl font-serif font-bold uppercase select-none">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-serif font-bold text-sm md:text-base text-ocean-dark mb-0.5 leading-tight group-hover:text-ocean-accent transition-colors">
                      {person.name}
                    </h3>
                    {person.role && (
                      <p className="text-xs font-bold text-ocean-accent uppercase tracking-wider mb-1">
                        {person.role}
                      </p>
                    )}
                    {person.institution && (
                      <p className="text-[10px] text-slate-400 mb-2 italic border-b border-slate-100 pb-2 leading-tight">
                        {person.institution}
                      </p>
                    )}
                    {person.bio && (
                      <p className="text-slate-600 text-xs leading-relaxed font-light line-clamp-3">
                        {person.bio}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-lg mx-auto">
            <Users className="mx-auto text-slate-300 mb-3 h-10 w-10 animate-pulse" />
            <p className="text-sm font-medium text-slate-500">No group members or collaborators listed yet.</p>
            <p className="text-xs text-slate-400 mt-1">Please log in to the administrator workspace to build your laboratory group, register co-authors and co-investigators.</p>
          </div>
        )}

      </div>
    </section>
  );
}
