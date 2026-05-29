import React from 'react';
import { Briefcase, BookOpen, Target, GraduationCap } from 'lucide-react';
import { AboutData } from '../types';
import { formatAmpersand } from './Ampersand';
import { resolveMediaLink } from '../utils/mediaResolver';

interface AboutProps {
  about: AboutData;
}

export default function About({ about }: AboutProps) {
  const resolvedImg = about.aboutImage && !about.aboutImage.includes('pexels.com')
    ? (resolveMediaLink(about.aboutImage, 'image').displayUrl || about.aboutImage)
    : '';

  const hasTitle = !!(about.title && about.title.trim() !== '');
  const hasContent = Array.isArray(about.content) && about.content.some(para => para && para.trim() !== '');
  const hasImage = !!resolvedImg;
  const hasExperience = Array.isArray(about.experience) && about.experience.length > 0;
  const hasEducation = Array.isArray(about.education) && about.education.length > 0;
  const hasInterests = Array.isArray(about.interests) && about.interests.some(item => item && item.trim() !== '');
  const hasMethods = Array.isArray(about.methods) && about.methods.some(item => item && item.trim() !== '');

  const showSection = hasTitle || hasContent || hasExperience || hasEducation || hasInterests || hasMethods;

  if (!showSection) return null;

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title bar banner */}
        {hasTitle && (
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-ocean-dark mb-4">
              {formatAmpersand(about.title)}
            </h2>
            <div className="w-16 h-1 bg-ocean-accent mx-auto rounded-full" />
          </div>
        )}

        {/* Text descriptions + Side image box */}
        {(hasImage || hasContent) && (
          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start mb-20 text-justify">
            {hasImage && (
              <div className="w-full lg:w-1/3 flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="absolute inset-0 bg-ocean-accent/10 rounded-2xl transform rotate-3 translate-x-2 translate-y-2" />
                  <img
                    src={resolvedImg}
                    alt="Shaibal in laboratory"
                    className="relative rounded-2xl shadow-lg w-full max-w-sm object-cover aspect-[3/4]"
                  />
                </div>
              </div>
            )}
            
            <div className={`w-full ${hasImage ? 'lg:w-2/3' : 'max-w-4xl mx-auto'} space-y-5`}>
              {about.content.filter(para => para && para.trim() !== '').map((para, idx) => (
                <p key={idx} className="leading-relaxed text-slate-700 text-sm md:text-base font-light">
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Timelines section: Work vs Education side-by-side */}
        {(hasExperience || hasEducation) && (
          <div className={`grid grid-cols-1 ${hasExperience && hasEducation ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-12 mb-16`}>
            {/* Work Experience Column */}
            {hasExperience && (
              <div>
                <h3 className="flex items-center gap-3 text-lg font-bold text-ocean-dark mb-6 border-b border-slate-100 pb-3 font-serif">
                  <Briefcase className="text-ocean-accent shrink-0" size={20} />
                  Professional Appointments
                </h3>
                
                <div className="space-y-6 border-l-2 border-slate-100 pl-6 ml-2">
                  {about.experience.map((exp) => (
                    <div key={exp.id} className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-white bg-ocean-accent shadow-sm" />
                      <h4 className="text-base font-bold text-slate-800 leading-tight">
                        {formatAmpersand(exp.role)}
                      </h4>
                      <p className="text-ocean-medium text-sm font-medium">
                        {formatAmpersand(exp.institution)}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mb-2">
                        {exp.period}
                      </p>
                      {exp.description && (
                        <p className="text-slate-600 text-xs leading-relaxed font-light">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Appointments Column */}
            {hasEducation && (
              <div>
                <h3 className="flex items-center gap-3 text-lg font-bold text-ocean-dark mb-6 border-b border-slate-100 pb-3 font-serif">
                  <GraduationCap className="text-ocean-accent shrink-0" size={20} />
                  Academic Grounding
                </h3>
                
                <div className="space-y-6 border-l-2 border-slate-100 pl-6 ml-2">
                  {about.education.map((edu) => (
                    <div key={edu.id} className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-white bg-ocean-medium shadow-sm" />
                      <h4 className="text-base font-bold text-slate-800 leading-tight">
                        {formatAmpersand(edu.degree)}
                      </h4>
                      <p className="text-ocean-medium text-sm font-medium">
                        {formatAmpersand(edu.institution)}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mb-2">
                        {edu.year}
                      </p>
                      {edu.description && (
                        <p className="text-slate-600 text-xs leading-relaxed font-light">
                          {formatAmpersand(edu.description)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interests & Methods callout blocks */}
        {(hasInterests || hasMethods) && (
          <div className="bg-slate-50 rounded-2xl p-6 md:p-10 border border-slate-100">
            <div className={`grid grid-cols-1 ${hasInterests && hasMethods ? 'md:grid-cols-2' : ''} gap-8`}>
              {hasInterests && (
                <div>
                  <h3 className="flex items-center gap-2 font-serif font-bold text-base text-ocean-dark mb-4">
                    <Target size={18} className="text-ocean-accent shrink-0" />
                    {formatAmpersand("Interests & Focus Fields")}
                  </h3>
                  <ul className="space-y-2.5">
                    {about.interests.filter(item => item && item.trim() !== '').map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-slate-700 bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-sm">
                        <span className="w-1.5 h-1.5 bg-ocean-accent rounded-full mt-2 flex-shrink-0" />
                        <span>{formatAmpersand(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasMethods && (
                <div>
                  <h3 className="flex items-center gap-2 font-serif font-bold text-base text-ocean-dark mb-4">
                    <BookOpen size={18} className="text-ocean-accent shrink-0" />
                    {formatAmpersand("Specialized Methodologies")}
                  </h3>
                  <ul className="space-y-2.5">
                    {about.methods.filter(item => item && item.trim() !== '').map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-slate-700 bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-sm">
                        <span className="w-1.5 h-1.5 bg-ocean-accent rounded-full mt-2 flex-shrink-0" />
                        <span>{formatAmpersand(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
