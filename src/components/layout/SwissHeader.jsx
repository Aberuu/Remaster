import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PROFILE } from '../../data/portfolioData';
import { useTheme } from '../../context/ThemeContext';
import SwissLogo from '../ui/SwissLogo';

export default function SwissHeader() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isHome = location.pathname === '/';
  const isDark = theme === 'dark';

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
          ? 'bg-white/94 dark:bg-[#0A0A0A]/94 backdrop-blur-md border-b border-[rgba(10,10,10,0.12)] dark:border-white/14 shadow-sm py-2.5'
          : 'bg-white/85 dark:bg-[#0A0A0A]/85 backdrop-blur-sm border-b border-[rgba(10,10,10,0.08)] dark:border-white/10 py-3'
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
        <nav className="hidden md:flex items-center gap-6 text-[11px] font-semibold text-[#434b5c] dark:text-[#b4bccf]">
          {isHome ? (
            <>
              <a href="#work" className="hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-colors">
                [01 COMMISSIONS]
              </a>
              <a href="#motion" className="hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-colors">
                [02 MOTION]
              </a>
              <a href="#about" className="hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-colors">
                [03 PERSPECTIVE]
              </a>
              <a href="#skills" className="hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-colors">
                [04 DISCIPLINES]
              </a>
              <a href="#contact" className="hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-colors">
                [05 DISPATCH]
              </a>
            </>
          ) : (
            <>
              <Link to="/#work" className="hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-colors">
                [01 COMMISSIONS]
              </Link>
              <Link to="/#motion" className="hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-colors">
                [02 MOTION]
              </Link>
              <Link to="/#about" className="hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-colors">
                [03 PERSPECTIVE]
              </Link>
              <Link to="/#skills" className="hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-colors">
                [04 DISCIPLINES]
              </Link>
              <Link to="/#contact" className="hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-colors">
                [05 DISPATCH]
              </Link>
            </>
          )}
        </nav>

        {/* Status Pill, Theme Toggle & Contact CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="hidden xl:flex items-center gap-2 text-[10px] text-[#2c3240] dark:text-[#d0d5e0] font-medium bg-[rgba(10,10,10,0.04)] dark:bg-white/5 px-2.5 py-1 rounded border border-[rgba(10,10,10,0.08)] dark:border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e0492a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e0492a]"></span>
            </span>
            <span>OPEN FOR DIRECTION &amp; ADVISORY</span>
          </div>

          {/* Swiss Brutalist Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[rgba(10,10,10,0.16)] dark:border-white/20 bg-white dark:bg-[#14161c] text-[#0A0A0A] dark:text-[#FAF9F6] hover:border-[#0A0A0A] dark:hover:border-white hover:text-[#e0492a] dark:hover:text-[#ff5a36] text-[10px] font-bold tracking-wider transition-all shadow-xs"
          >
            {isDark ? (
              <>
                <svg className="w-3.5 h-3.5 text-[#d8ff00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
                <span className="hidden sm:inline">LIGHT</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-[#0A0A0A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <span className="hidden sm:inline">DARK</span>
              </>
            )}
          </button>

          <a
            href={isHome ? '#contact' : PROFILE.gmailUrl}
            target={isHome ? undefined : '_blank'}
            rel={isHome ? undefined : 'noopener noreferrer'}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0A0A0A] text-white dark:bg-[#FAF9F6] dark:text-[#0A0A0A] hover:bg-[#e0492a] dark:hover:bg-[#e0492a] dark:hover:text-white rounded text-[10px] font-bold tracking-widest transition-colors shadow-sm"
          >
            <span>INQUIRE</span>
            <span>&rarr;</span>
          </a>
        </div>

      </div>
    </header>
  );
}
