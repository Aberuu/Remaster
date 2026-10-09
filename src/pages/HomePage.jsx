import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FEATURED_PROJECTS, PROFILE } from '../data/portfolioData';
import WildHeroSection from '../components/sections/WildHeroSection';

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const categories = ['ALL', 'SYSTEMS & UI', 'MOTION & FILM'];

  const filteredProjects = FEATURED_PROJECTS.filter((project) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'SYSTEMS & UI') {
      return (
        project.category.toLowerCase().includes('system') ||
        project.category.toLowerCase().includes('architecture') ||
        project.category.toLowerCase().includes('interaction')
      );
    }
    if (activeFilter === 'MOTION & FILM') {
      return (
        project.category.toLowerCase().includes('art direction') ||
        project.category.toLowerCase().includes('motion') ||
        project.category.toLowerCase().includes('color')
      );
    }
    return true;
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PROFILE.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="w-full bg-[#fbfbfa] text-[#0A0A0A] min-h-screen">
      {/* ─── Hero Section: Marquee Hero with Generative Wave ─── */}
      <WildHeroSection />

      {/* ─── Main Content Canvas ─── */}
      <main className="w-full px-6 sm:px-10 md:px-16 lg:px-20 pt-16 sm:pt-24 pb-32 max-w-[1440px] mx-auto">
        
        {/* ─── SECTION 01: SELECTED COMMISSIONS ─── */}
        <section id="work" className="mb-28 sm:mb-36 scroll-mt-24">
          
          {/* Section Header & Interactive Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-[#0A0A0A] pb-5 mb-10 sm:mb-14">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e0492a] font-bold mb-1">
                <span>[01 // DIRECTED COMMISSIONS]</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] uppercase">
                Selected Commissions
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  style={{ color: activeFilter === cat ? '#ffffff' : '#434b5c' }}
                  className={`px-3.5 py-1.5 rounded-md font-bold transition-all ${
                    activeFilter === cat
                      ? 'bg-[#0A0A0A] !text-white shadow-sm'
                      : 'bg-white border border-[rgba(10,10,10,0.15)] !text-[#434b5c] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                  }`}
                >
                  {cat} {cat === 'ALL' ? `[${FEATURED_PROJECTS.length}]` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Structured Projects Showcase */}
          <div className="space-y-12">
            
            {/* Flagship Featured Project (Lumen OS) */}
            {filteredProjects.find((p) => p.id === 'lumen-os') && (
              (() => {
                const flagship = filteredProjects.find((p) => p.id === 'lumen-os');
                return (
                  <article className="group bg-white border-2 border-[rgba(10,10,10,0.12)] hover:border-[#0A0A0A] rounded-2xl p-6 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] transition-all duration-300">
                    <Link to={`/project/${flagship.id}`} className="block outline-none">
                      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 sm:gap-12 items-center">
                        
                        {/* Media Container */}
                        <div className="relative w-full aspect-[16/10] bg-[#111318] rounded-xl overflow-hidden border border-[rgba(10,10,10,0.1)]">
                          <img 
                            src={flagship.heroImage || flagship.thumbnail} 
                            alt={flagship.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                          />
                          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/95 backdrop-blur-md rounded border border-[rgba(10,10,10,0.15)] font-mono text-[10px] tracking-widest uppercase font-bold text-[#0A0A0A]">
                            FLAGSHIP DIRECTION // {flagship.year}
                          </div>
                        </div>

                        {/* Details */}
                        <div>
                          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-[#e0492a] font-bold mb-2">
                            <span>{flagship.category}</span>
                            <span className="text-[#8b8b8b]">&bull;</span>
                            <span className="text-[#3b4252]">{flagship.role}</span>
                          </div>

                          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] group-hover:text-[#e0492a] transition-colors uppercase mb-3">
                            {flagship.title}
                          </h3>

                          <p className="text-base sm:text-lg text-[#252934] leading-relaxed max-w-xl font-normal mb-6">
                            {flagship.summary || flagship.subtitle}
                          </p>

                          {/* Metrics Bar */}
                          {flagship.metrics && (
                            <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-[#f6f7f9] border border-[rgba(10,10,10,0.08)] rounded-xl font-mono">
                              {flagship.metrics.map((m) => (
                                <div key={m.label}>
                                  <span className="block text-lg font-bold text-[#0A0A0A]">{m.value}</span>
                                  <span className="block text-[10px] text-[#5e6677] uppercase tracking-wider">{m.label}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Stack & Button */}
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-1.5">
                              {flagship.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2.5 py-1 bg-[#edf0f5] text-[#1c2230] rounded font-mono text-xs font-semibold">
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0A0A0A] group-hover:text-[#e0492a]">
                              <span>READ CASE STUDY</span>
                              <span>&rarr;</span>
                            </span>
                          </div>

                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })()
            )}

            {/* Supporting Projects (3-Column Responsive Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects
                .filter((p) => p.id !== 'lumen-os' || activeFilter !== 'ALL')
                .map((project, idx) => (
                  <article 
                    key={project.id}
                    className="group bg-white border border-[rgba(10,10,10,0.14)] hover:border-[#0A0A0A] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <Link to={`/project/${project.id}`} className="block outline-none">
                      
                      {/* Media */}
                      <div className="relative w-full aspect-[16/10] bg-[#111318] rounded-xl overflow-hidden border border-[rgba(10,10,10,0.1)] mb-5">
                        <img 
                          src={project.heroImage || project.thumbnail} 
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                        />
                        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded border border-[rgba(10,10,10,0.15)] font-mono text-[9px] tracking-widest uppercase font-bold text-[#0A0A0A]">
                          PROJ 0{idx + 2} // {project.year}
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#e0492a] font-bold mb-1.5">
                          <span>{project.category}</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A0A0A] group-hover:text-[#e0492a] transition-colors uppercase mb-2">
                          {project.title}
                        </h3>

                        <p className="text-sm sm:text-base text-[#383f4f] leading-relaxed line-clamp-3 font-normal mb-5">
                          {project.subtitle || project.description}
                        </p>
                      </div>

                      {/* Footer & Tags */}
                      <div className="pt-4 border-t border-[rgba(10,10,10,0.08)] flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-[#f0f2f5] text-[#222733] rounded font-mono text-[11px] font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A] group-hover:text-[#e0492a] inline-flex items-center gap-1">
                          <span>STUDY</span>
                          <span>&rarr;</span>
                        </span>
                      </div>

                    </Link>
                  </article>
                ))}
            </div>

          </div>
        </section>

        {/* ─── SECTION 02: PERSPECTIVE & VISION ─── */}
        <section id="about" className="mb-28 sm:mb-36 scroll-mt-24">
          <div className="bg-white border-2 border-[rgba(10,10,10,0.12)] rounded-3xl p-8 sm:p-14 lg:p-16 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-12 sm:gap-16 items-start">
              
              {/* Left Column: Directorial Manifesto */}
              <div>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e0492a] font-bold mb-3">
                  <span>[02 // DIRECTORIAL PERSPECTIVE]</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] leading-tight uppercase mb-6">
                  Directing form, tension, and tactile digital craft.
                </h2>

                <p className="text-base sm:text-lg text-[#252935] leading-relaxed mb-6 font-normal">
                  I lead at the intersection of Swiss typographic discipline, generative web code, and cinematic storytelling. As a Creative Director, I reject generic digital noise in favor of intentional hierarchy, visceral contrast, and tactile feedback.
                </p>

                <p className="text-sm sm:text-base text-[#4a5266] leading-relaxed mb-8">
                  Partnering with founders, design studios, and visionary product teams globally to craft uncompromising brand identities, brutalist interfaces, and cinematic narratives that command attention.
                </p>

                {/* Quick Info Table */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[rgba(10,10,10,0.1)] font-mono text-xs">
                  <div>
                    <span className="block text-[#6a7285] text-[10px] uppercase font-bold">PRIMARY ROLE</span>
                    <span className="font-bold text-[#0A0A0A]">Creative Director &amp; Technologist</span>
                  </div>
                  <div>
                    <span className="block text-[#6a7285] text-[10px] uppercase font-bold">LOCATION</span>
                    <span className="font-bold text-[#0A0A0A]">Indonesia (GMT+7)</span>
                  </div>
                  <div>
                    <span className="block text-[#6a7285] text-[10px] uppercase font-bold">FOCUS</span>
                    <span className="font-bold text-[#0A0A0A]">Brand Systems &bull; Spatial UI &bull; Film</span>
                  </div>
                  <div>
                    <span className="block text-[#6a7285] text-[10px] uppercase font-bold">AVAILABILITY</span>
                    <span className="font-bold text-[#e0492a]">Open for Direction &amp; Advisory</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3 Core Directorial Pillars */}
              <div className="space-y-6">
                <span className="font-mono text-xs uppercase tracking-wider text-[#6a7285] font-bold block mb-2">
                  DIRECTORIAL PILLARS
                </span>

                <div className="p-6 bg-[#f7f8fa] border border-[rgba(10,10,10,0.08)] rounded-2xl">
                  <span className="font-mono text-xs text-[#e0492a] font-bold block mb-1">01 // ARCHITECTURAL INTENT</span>
                  <h3 className="text-lg font-bold text-[#0A0A0A] uppercase mb-2">Typography as Structural Spine</h3>
                  <p className="text-sm text-[#3b4354] leading-relaxed">
                    Ruthless hierarchy over ornamental fluff. Every layout is governed by mathematical Swiss grids and expressive type scale that communicates command and clarity.
                  </p>
                </div>

                <div className="p-6 bg-[#f7f8fa] border border-[rgba(10,10,10,0.08)] rounded-2xl">
                  <span className="font-mono text-xs text-[#e0492a] font-bold block mb-1">02 // VISCERAL TEXTURE</span>
                  <h3 className="text-lg font-bold text-[#0A0A0A] uppercase mb-2">Tactile Digital Weight</h3>
                  <p className="text-sm text-[#3b4354] leading-relaxed">
                    Marrying raw brutalist contrast with kinetic pixel art, generative canvas physics, and tactile micro-interactions that make software feel tangible and human.
                  </p>
                </div>

                <div className="p-6 bg-[#f7f8fa] border border-[rgba(10,10,10,0.08)] rounded-2xl">
                  <span className="font-mono text-xs text-[#e0492a] font-bold block mb-1">03 // DIRECTED MOTION</span>
                  <h3 className="text-lg font-bold text-[#0A0A0A] uppercase mb-2">Rhythm-Locked Cinematic Pacing</h3>
                  <p className="text-sm text-[#3b4354] leading-relaxed">
                    Motion is orchestrated with musical cadence and spatial continuity. Zero gratuitous decoration; every transition serves emotional impact and narrative pacing.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── SECTION 03: CAPABILITIES & DISCIPLINES ─── */}
        <section id="skills" className="mb-28 sm:mb-36 scroll-mt-24">
          <div className="border-b-2 border-[#0A0A0A] pb-5 mb-10">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e0492a] font-bold mb-1">
              <span>[03 // CAPABILITY MATRIX]</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] uppercase">
              Disciplines &amp; Advisory
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROFILE.skills.map((skillGroup, idx) => (
              <div 
                key={skillGroup.category}
                className="bg-white border-2 border-[rgba(10,10,10,0.12)] hover:border-[#0A0A0A] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-xs mb-3">
                    <span className="text-[#e0492a] font-bold">PILLAR 0{idx + 1}</span>
                    <span className="text-[#6a7285] uppercase">DIRECTION SCOPE</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0A0A0A] uppercase mb-6 tracking-tight">
                    {skillGroup.category}
                  </h3>

                  <div className="space-y-2.5">
                    {skillGroup.items.map((item) => (
                      <div 
                        key={item} 
                        className="flex items-center gap-2.5 p-2.5 bg-[#f6f7f9] border border-[rgba(10,10,10,0.06)] rounded-lg font-mono text-xs font-semibold text-[#1e2544]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-8 border-t border-[rgba(10,10,10,0.08)] font-mono text-[11px] text-[#5e6677]">
                  From strategic vision to production master.
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 04: COMMISSIONS & DISPATCH ─── */}
        <section id="contact" className="scroll-mt-24">
          <div className="bg-white border-2 border-[#0A0A0A] rounded-3xl p-8 sm:p-14 lg:p-16 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 sm:gap-16 items-start">
              
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[rgba(10,10,10,0.05)] border border-[rgba(10,10,10,0.12)] rounded font-mono text-xs tracking-widest text-[#e0492a] font-bold uppercase mb-4">
                  <span>[04 // INQUIRIES &amp; ADVISORY]</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A] uppercase leading-[1.05] mb-6">
                  Directing your next digital commission.
                </h2>

                <p className="text-base sm:text-lg text-[#252a36] leading-relaxed max-w-xl mb-8">
                  Open for select creative direction contracts, brand system architecture, and commercial motion collaborations globally.
                </p>

                {/* Interactive Action Bar */}
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href={`mailto:${PROFILE.email}`}
                    style={{ color: '#ffffff' }}
                    className="inline-flex items-center gap-2 px-7 py-4 bg-[#0A0A0A] !text-white hover:bg-[#e0492a] rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
                  >
                    <span style={{ color: '#ffffff' }}>INQUIRE FOR DIRECTION</span>
                    <span style={{ color: '#ffffff' }}>&rarr;</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    style={{ color: '#0A0A0A' }}
                    className="inline-flex items-center gap-2 px-6 py-4 bg-[#f4f5f8] hover:bg-[#e8ebf0] border border-[rgba(10,10,10,0.15)] rounded-xl font-mono text-xs font-bold uppercase tracking-wider !text-[#0A0A0A] transition-all"
                  >
                    <span style={{ color: '#0A0A0A' }}>{copiedEmail ? 'COPIED TO CLIPBOARD!' : 'COPY EMAIL'}</span>
                    <span style={{ color: '#0A0A0A' }} className="text-xs">&copy;</span>
                  </button>
                </div>
              </div>

              {/* Direct Info & Social Grid */}
              <div className="flex flex-col justify-between h-full space-y-8 lg:border-l lg:border-[rgba(10,10,10,0.1)] lg:pl-12 font-mono text-xs">
                <div>
                  <span className="block text-[#6a7285] text-[10px] font-bold uppercase mb-1">
                    PRIMARY DISPATCH
                  </span>
                  <a href={`mailto:${PROFILE.email}`} className="text-base font-bold text-[#0A0A0A] hover:text-[#e0492a] transition-colors">
                    {PROFILE.email}
                  </a>
                  <p className="text-[#555d70] text-[11px] mt-1">
                    Turnaround expectation: &lt; 24 business hours.
                  </p>
                </div>

                <div>
                  <span className="block text-[#6a7285] text-[10px] font-bold uppercase mb-2">
                    DIGITAL CHANNELS
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {PROFILE.socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-[#f6f7f9] border border-[rgba(10,10,10,0.08)] hover:border-[#0A0A0A] rounded-lg font-bold text-[#0A0A0A] hover:text-[#e0492a] transition-all"
                      >
                        <span className="block text-[10px] text-[#6a7285]">{s.label}</span>
                        <span className="text-xs">{s.username}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-[rgba(10,10,10,0.1)] text-[#6a7285] text-[11px] flex justify-between">
                  <span>{PROFILE.name.toUpperCase()} &bull; INDONESIA</span>
                  <span>ALL RIGHTS RESERVED &copy; {new Date().getFullYear()}</span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
