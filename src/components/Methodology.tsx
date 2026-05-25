import React from 'react';
import { 
  ChartNoAxesColumn, 
  Globe, 
  Database, 
  Microscope, 
  Wrench, 
  Users, 
  Briefcase,
  Cpu
} from 'lucide-react';
import { SkillCategory, MethodologyConfig } from '../types';
import { formatAmpersand } from './Ampersand';

interface MethodologyProps {
  methodologyConfig: MethodologyConfig;
  skills: SkillCategory[];
}

export default function Methodology({ methodologyConfig, skills }: MethodologyProps) {
  // Renders distinct icons based on index or matching name
  const renderCategoryIcon = (idx: number, category: string) => {
    const norm = category.toLowerCase();
    if (norm.includes('statistic') || norm.includes('analysis')) {
      return <ChartNoAxesColumn size={22} />;
    }
    if (norm.includes('remote') || norm.includes('gis') || norm.includes('gps')) {
      return <Globe size={22} />;
    }
    if (norm.includes('modeling') || norm.includes('database')) {
      return <Database size={22} />;
    }
    if (norm.includes('field') || norm.includes('laboratory') || norm.includes('chemistry')) {
      return <Microscope size={22} />;
    }
    if (norm.includes('competen') || norm.includes('technical')) {
      return <Wrench size={22} />;
    }
    if (norm.includes('interpersonal') || norm.includes('soft') || norm.includes('leadership')) {
      return <Users size={22} />;
    }
    // Fallback based on rotating indices
    switch (idx % 4) {
      case 0: return <ChartNoAxesColumn size={22} />;
      case 1: return <Globe size={22} />;
      case 2: return <Database size={22} />;
      default: return <Microscope size={22} />;
    }
  };

  return (
    <section id="skills" className="py-20 bg-slate-50 ocean-grid">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section formatting */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold text-ocean-dark mb-4">
            {formatAmpersand(methodologyConfig.title)}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base font-light">
            {methodologyConfig.description}
          </p>
          <div className="w-16 h-1 bg-ocean-accent mx-auto rounded-full mt-4" />
        </div>

        {/* Structured Grid boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col group"
            >
              <div className="w-11 h-11 bg-ocean-light rounded-lg flex items-center justify-center text-ocean-accent mb-5 group-hover:bg-ocean-accent group-hover:text-white transition-colors duration-300">
                {renderCategoryIcon(idx, cat.category)}
              </div>
              
              <h3 className="font-bold text-slate-800 text-base mb-4">
                {formatAmpersand(cat.category)}
              </h3>
              
              <ul className="space-y-2 flex-grow">
                {cat.skills.map((skill, sIdx) => (
                  <li key={sIdx} className="flex items-center text-slate-600 text-sm">
                    <span className="w-1.5 h-1.5 bg-ocean-accent rounded-full mr-2.5 flex-shrink-0" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Workflow modernize highlights panel banner */}
        <div className="mt-16 bg-slate-900 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl" id="research-workflow-highlight">
          <div className="relative z-10">
            <Cpu className="w-10 h-10 mx-auto text-cyan-400 mb-4 animate-pulse" />
            <h3 className="text-xl font-serif font-bold mb-3 tracking-wide">
              Modernizing Research Workflows
            </h3>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-light">
              Active integration of AI-assisted tools for literature synthesis, data preprocessing, and climate modeling enhancement.
            </p>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-ocean-medium/80 to-slate-950/80 opacity-90" />
        </div>

      </div>
    </section>
  );
}
