import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PROFILE } from '../../data/portfolioData';
import SwissLogo from '../ui/SwissLogo';

export default function SwissHeader() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-mono text-xs uppercase tracking-wider ${
        scrolled
          ? 'bg-white/94 backdrop-blur-md border-b border-[rgba(10,10,10,0.12)] shadow-sm py-2.5'
          : 'bg-white/85 backdrop-blur-sm border-b border-[rgba(10,10,10,0.08)] py-3'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between gap-4">
        
        {/* Brand / Logo Mark */}
        <Link 
          to="/" 
          className="outline-none"
          aria-label="Aberuu Home"
        >
          <SwissLogo size="md" />
        </Link>

        {/* Navigation Anchors (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-[11px] font-semibold text-[#434b5c]">
          {isHome ? (
            <>
              <a href="#work" className="hover:text-[#e0492a] transition-colors">
                [01 COMMISSIONS]
              </a>
              <a href="#about" className="hover:text-[#e0492a] transition-colors">
                [02 PERSPECTIVE]
              </a>
              <a href="#skills" className="hover:text-[#e0492a] transition-colors">
                [03 DISCIPLINES]
              </a>
              <a href="#contact" className="hover:text-[#e0492a] transition-colors">
                [04 DISPATCH]
              </a>
            </>
          ) : (
            <>
              <Link to="/#work" className="hover:text-[#e0492a] transition-colors">
                [01 COMMISSIONS]
              </Link>
              <Link to="/#about" className="hover:text-[#e0492a] transition-colors">
                [02 PERSPECTIVE]
              </Link>
              <Link to="/#skills" className="hover:text-[#e0492a] transition-colors">
                [03 DISCIPLINES]
              </Link>
              <Link to="/#contact" className="hover:text-[#e0492a] transition-colors">
                [04 DISPATCH]
              </Link>
            </>
          )}
        </nav>

        {/* Status Pill & Contact CTA */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-[10px] text-[#2c3240] font-medium bg-[rgba(10,10,10,0.04)] px-2.5 py-1 rounded border border-[rgba(10,10,10,0.08)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e0492a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e0492a]"></span>
            </span>
            <span>OPEN FOR DIRECTION &amp; ADVISORY</span>
          </div>

          <a
            href={isHome ? '#contact' : PROFILE.gmailUrl}
            target={isHome ? undefined : '_blank'}
            rel={isHome ? undefined : 'noopener noreferrer'}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0A0A0A] !text-white hover:bg-[#e0492a] rounded text-[10px] font-bold tracking-widest transition-colors shadow-sm"
            style={{ color: '#ffffff' }}
          >
            <span style={{ color: '#ffffff' }}>INQUIRE</span>
            <span style={{ color: '#ffffff' }}>&rarr;</span>
          </a>
        </div>

      </div>
    </header>
  );
}
