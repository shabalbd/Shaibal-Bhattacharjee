import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  name: string;
}

export default function Navbar({ name }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Activities', href: '#activities' },
    { name: 'Publications', href: '#publications' },
    { name: 'Team', href: '#people' },
    { name: 'Blog', href: '#blog' },
    { name: 'Archive', href: '#archive' },
    { name: 'Contact', href: '#contact' },
  ];

  const textClass = isScrolled ? 'text-slate-700' : 'text-slate-100';
  const logoClass = isScrolled ? 'text-ocean-accent' : 'text-white';
  const hoverClass = isScrolled ? 'hover:text-ocean-accent' : 'hover:text-white';
  const headerBg = isScrolled 
    ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-slate-200' 
    : 'bg-transparent py-5';

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${headerBg}`} id="app-navbar">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <a href="#" className={`font-serif font-bold text-xl tracking-tight transition-colors ${logoClass}`}>
          {name}
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors ${textClass} ${hoverClass} ${
                !isScrolled ? 'hover:bg-white/10 px-3 py-1.5 rounded' : 'px-1 py-1'
              }`}
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden focus:outline-none p-1.5 rounded ${
            isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
          }`}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-ocean-accent hover:bg-slate-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
