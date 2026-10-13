import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PROFILE } from '../data/portfolioData';
import { useProjects } from '../hooks/useProjects';
import WildHeroSection from '../components/sections/WildHeroSection';
import FootageShowcaseSection from '../components/sections/FootageShowcaseSection';

export default function HomePage() {
  const { projects } = useProjects();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const categories = ['ALL', 'SYSTEMS & UI', 'MOTION & FILM'];

  const filteredProjects = projects.filter((project) => {
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

  const flagship = filteredProjects.find((p) => p.featured) || filteredProjects[0];
  const supportingProjects = flagship 
    ? filteredProjects.filter((p) => p.id !== flagship.id) 
    : filteredProjects;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PROFILE.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="w-full bg-[#fbfbfa] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAF9F6] min-h-screen transition-colors duration-200">
      {/* ─── Hero Section: Marquee Hero with Generative Wave ─── */}
      <WildHeroSection />

      {/* ─── Main Content Canvas ─── */}
      <main className="w-full px-6 sm:px-10 md:px-16 lg:px-20 pt-16 sm:pt-24 pb-32 max-w-[1440px] mx-auto">
        
        {/* ─── SECTION 01: SELECTED COMMISSIONS ─── */}
        <section id="work" className="mb-28 sm:mb-36 scroll-mt-24">
          
          {/* Section Header & Interactive Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-[#0A0A0A] dark:border-white/25 pb-5 mb-10 sm:mb-14">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e0492a] dark:text-[#ff5a36] font-bold mb-1">
                <span>[01 // DIRECTED COMMISSIONS]</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] dark:text-[#FAF9F6] uppercase">
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
                  className={`px-3.5 py-1.5 rounded-md font-bold transition-all ${
                    activeFilter === cat
                      ? 'bg-[#0A0A0A] text-white dark:bg-[#FAF9F6] dark:text-[#0A0A0A] shadow-sm'
                      : 'bg-white dark:bg-[#121318] border border-[rgba(10,10,10,0.15)] dark:border-white/15 text-[#434b5c] dark:text-[#b4bccf] hover:border-[#0A0A0A] dark:hover:border-white hover:text-[#0A0A0A] dark:hover:text-[#FAF9F6]'
                  }`}
                >
                  {cat} {cat === 'ALL' ? `[${projects.length}]` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Structured Projects Showcase */}
          <div className="space-y-12">
            
            {/* Flagship Featured Project */}
            {flagship && (
              <article className="group bg-white dark:bg-[#121318] border-2 border-[rgba(10,10,10,0.12)] dark:border-white/14 hover:border-[#0A0A0A] dark:hover:border-white/40 rounded-2xl p-6 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] transition-all duration-300">
                <Link to={`/project/${flagship.id}`} className="block outline-none">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 sm:gap-12 items-center">
                    
                    {/* Media Container */}
                    <div className="relative w-full aspect-[16/10] bg-[#111318] rounded-xl overflow-hidden border border-[rgba(10,10,10,0.1)] dark:border-white/12">
                      <img 
                        src={flagship.heroImage || flagship.thumbnail} 
                        alt={flagship.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                      />
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/95 dark:bg-[#0A0A0A]/90 backdrop-blur-md rounded border border-[rgba(10,10,10,0.15)] dark:border-white/20 font-mono text-[10px] tracking-widest uppercase font-bold text-[#0A0A0A] dark:text-[#FAF9F6]">
                        FLAGSHIP DIRECTION // {flagship.year}
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-[#e0492a] dark:text-[#ff5a36] font-bold mb-2">
                        <span>{flagship.category}</span>
                        <span className="text-[#8b8b8b]">&bull;</span>
                        <span className="text-[#3b4252] dark:text-[#b4bccf]">{flagship.role}</span>
                      </div>

                      <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] dark:text-[#FAF9F6] group-hover:text-[#e0492a] dark:group-hover:text-[#ff5a36] transition-colors uppercase mb-3">
                        {flagship.title}
                      </h3>

                      <p className="text-base sm:text-lg text-[#252934] dark:text-[#c5cce0] leading-relaxed max-w-xl font-normal mb-6">
                        {flagship.summary || flagship.subtitle}
                      </p>

                      {/* Metrics Bar */}
                      {flagship.metrics && flagship.metrics.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 bg-[#f6f7f9] dark:bg-[#1a1c23] border border-[rgba(10,10,10,0.08)] dark:border-white/10 rounded-xl font-mono">
                          {flagship.metrics.map((m) => (
                            <div key={m.label}>
                              <span className="block text-lg font-bold text-[#0A0A0A] dark:text-[#FAF9F6]">{m.value}</span>
                              <span className="block text-[10px] text-[#5e6677] dark:text-[#8e96a8] uppercase tracking-wider">{m.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stack & Button */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-1.5">
                          {flagship.tags?.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2.5 py-1 bg-[#edf0f5] dark:bg-[#1e212b] text-[#1c2230] dark:text-[#d5d9e6] rounded font-mono text-xs font-semibold">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-[#FAF9F6] group-hover:text-[#e0492a] dark:group-hover:text-[#ff5a36]">
                          <span>READ CASE STUDY</span>
                          <span>&rarr;</span>
                        </span>
                      </div>

                    </div>
                  </div>
                </Link>
              </article>
            )}

            {/* Supporting Projects (3-Column Responsive Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {supportingProjects.map((project, idx) => (
                  <article 
                    key={project.id}
                    className="group bg-white dark:bg-[#121318] border border-[rgba(10,10,10,0.14)] dark:border-white/14 hover:border-[#0A0A0A] dark:hover:border-white/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <Link to={`/project/${project.id}`} className="block outline-none">
                      
                      {/* Media */}
                      <div className="relative w-full aspect-[16/10] bg-[#111318] rounded-xl overflow-hidden border border-[rgba(10,10,10,0.1)] dark:border-white/12 mb-5">
                        <img 
                          src={project.heroImage || project.thumbnail} 
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                        />
                        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-white/95 dark:bg-[#0A0A0A]/90 backdrop-blur-md rounded border border-[rgba(10,10,10,0.15)] dark:border-white/20 font-mono text-[9px] tracking-widest uppercase font-bold text-[#0A0A0A] dark:text-[#FAF9F6]">
                          PROJ 0{idx + 2} // {project.year}
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#e0492a] dark:text-[#ff5a36] font-bold mb-1.5">
                          <span>{project.category}</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-[#FAF9F6] group-hover:text-[#e0492a] dark:group-hover:text-[#ff5a36] transition-colors uppercase mb-2">
                          {project.title}
                        </h3>

                        <p className="text-sm sm:text-base text-[#383f4f] dark:text-[#b4bccf] leading-relaxed line-clamp-3 font-normal mb-4">
                          {project.subtitle || project.description}
                        </p>

                        {/* Mini Metric */}
                        {project.metrics && project.metrics.length > 0 && (
                          <div className="mb-4 px-3 py-2 bg-[#f6f7f9] dark:bg-[#1a1c23] border border-[rgba(10,10,10,0.06)] dark:border-white/10 rounded-lg font-mono">
                            <span className="block text-xs font-bold text-[#0A0A0A] dark:text-[#FAF9F6] truncate">
                              {project.metrics[0].value}
                            </span>
                            <span className="block text-[9px] text-[#5e6677] dark:text-[#8e96a8] uppercase tracking-wider truncate">
                              {project.metrics[0].label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer & Tags */}
                      <div className="pt-4 border-t border-[rgba(10,10,10,0.08)] dark:border-white/10 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-[#f0f2f5] dark:bg-[#1e212b] text-[#222733] dark:text-[#d5d9e6] rounded font-mono text-[11px] font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-[#FAF9F6] group-hover:text-[#e0492a] dark:group-hover:text-[#ff5a36] inline-flex items-center gap-1">
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

        {/* ─── SECTION 02: MOTION & REEL VAULT ─── */}
        <FootageShowcaseSection />

        {/* ─── SECTION 03: PERSPECTIVE & VISION ─── */}
        <section id="about" className="mb-28 sm:mb-36 scroll-mt-24">
          <div className="bg-white dark:bg-[#121318] border-2 border-[rgba(10,10,10,0.12)] dark:border-white/14 rounded-3xl p-8 sm:p-14 lg:p-16 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-12 sm:gap-16 items-start">
              
              {/* Left Column: Directorial Manifesto */}
              <div>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e0492a] dark:text-[#ff5a36] font-bold mb-3">
                  <span>[03 // DIRECTORIAL PERSPECTIVE]</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] dark:text-[#FAF9F6] leading-tight uppercase mb-6">
                  BRIDGING STRATEGY, DESIGN, AND TECHNOLOGY.
                </h2>

                <p className="text-base sm:text-lg text-[#252935] dark:text-[#d0d5e0] leading-relaxed mb-6 font-normal">
                  I am a Creative Developer based in Indonesia, working at the intersection of visual design, branding, and interactive digital experiences. I enjoy translating concepts into cohesive visual systems from art direction and social media strategy to modern websites. 
                </p>

                <p className="text-sm sm:text-base text-[#4a5266] dark:text-[#9ca4b8] leading-relaxed mb-8">
                  I believe design is more than aesthetics; it is a functional way to establish identity and create lasting impressions.
                </p>

                {/* Quick Info Table */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[rgba(10,10,10,0.1)] dark:border-white/12 font-mono text-xs">
                  <div>
                    <span className="block text-[#6a7285] dark:text-[#8e96a8] text-[10px] uppercase font-bold">PRIMARY ROLE</span>
                    <span className="font-bold text-[#0A0A0A] dark:text-[#FAF9F6]">Creative Director &amp; Video Editor</span>
                  </div>
                  <div>
                    <span className="block text-[#6a7285] dark:text-[#8e96a8] text-[10px] uppercase font-bold">LOCATION</span>
                    <span className="font-bold text-[#0A0A0A] dark:text-[#FAF9F6]">Indonesia (GMT+7)</span>
                  </div>
                  <div>
                    <span className="block text-[#6a7285] dark:text-[#8e96a8] text-[10px] uppercase font-bold">FOCUS</span>
                    <span className="font-bold text-[#0A0A0A] dark:text-[#FAF9F6]">Visual Systems &bull; Front-End &bull; Evend Branding</span>
                  </div>
                  <div>
                    <span className="block text-[#6a7285] dark:text-[#8e96a8] text-[10px] uppercase font-bold">AVAILABILITY</span>
                    <span className="font-bold text-[#e0492a] dark:text-[#ff5a36]">Open for Direction &amp; Advisory</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3 Core Directorial Pillars */}
              <div className="space-y-6">
                <span className="font-mono text-xs uppercase tracking-wider text-[#6a7285] dark:text-[#8e96a8] font-bold block mb-2">
                  DIRECTORIAL PILLARS
                </span>

                <div className="p-6 bg-[#f7f8fa] dark:bg-[#1a1c23] border border-[rgba(10,10,10,0.08)] dark:border-white/10 rounded-2xl">
                  <span className="font-mono text-xs text-[#e0492a] dark:text-[#ff5a36] font-bold block mb-1">01 // CONSISTENCY</span>
                  <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-[#FAF9F6] uppercase mb-2">UNIFIED VISUAL SYSTEMS</h3>
                  <p className="text-sm text-[#3b4354] dark:text-[#b4bccf] leading-relaxed">
                    Building cohesive and scalable visual languages across different media and platforms, ensuring the brand identity remains strong and recognizable.
                  </p>
                </div>

                <div className="p-6 bg-[#f7f8fa] dark:bg-[#1a1c23] border border-[rgba(10,10,10,0.08)] dark:border-white/10 rounded-2xl">
                  <span className="font-mono text-xs text-[#e0492a] dark:text-[#ff5a36] font-bold block mb-1">02 // STORYTELLING</span>
                  <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-[#FAF9F6] uppercase mb-2">NARRATIVE &amp; VISUAL PACING</h3>
                  <p className="text-sm text-[#3b4354] dark:text-[#b4bccf] leading-relaxed">
                    Crafting purpose-driven stories across digital interfaces and video formats. From event aftermovies and commercial edits to weddings and brand films, every frame is cut with intentional rhythm and emotion.
                  </p>
                </div>

                <div className="p-6 bg-[#f7f8fa] dark:bg-[#1a1c23] border border-[rgba(10,10,10,0.08)] dark:border-white/10 rounded-2xl">
                  <span className="font-mono text-xs text-[#e0492a] dark:text-[#ff5a36] font-bold block mb-1">03 // EXPERIENCE</span>
                  <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-[#FAF9F6] uppercase mb-2">FUNCTIONAL INTERACTION</h3>
                  <p className="text-sm text-[#3b4354] dark:text-[#b4bccf] leading-relaxed">
                    Creating digital products and visual campaigns that are not only aesthetically striking but also highly functional. Merging smooth front-end execution with intuitive audience engagement.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── SECTION 04: CAPABILITIES & DISCIPLINES ─── */}
        <section id="skills" className="mb-28 sm:mb-36 scroll-mt-24">
          <div className="border-b-2 border-[#0A0A0A] dark:border-white/25 pb-5 mb-10">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e0492a] dark:text-[#ff5a36] font-bold mb-1">
              <span>[04 // CAPABILITY MATRIX]</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] dark:text-[#FAF9F6] uppercase">
              Disciplines &amp; Advisory
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROFILE.skills.map((skillGroup, idx) => (
              <div 
                key={skillGroup.category}
                className="bg-white dark:bg-[#121318] border-2 border-[rgba(10,10,10,0.12)] dark:border-white/14 hover:border-[#0A0A0A] dark:hover:border-white/40 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-xs mb-3">
                    <span className="text-[#e0492a] dark:text-[#ff5a36] font-bold">PILLAR 0{idx + 1}</span>
                    <span className="text-[#6a7285] dark:text-[#8e96a8] uppercase">DIRECTION SCOPE</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-[#FAF9F6] uppercase mb-6 tracking-tight">
                    {skillGroup.category}
                  </h3>

                  <div className="space-y-2.5">
                    {skillGroup.items.map((item) => (
                      <div 
                        key={item} 
                        className="flex items-center gap-2.5 p-2.5 bg-[#f6f7f9] dark:bg-[#1a1c23] border border-[rgba(10,10,10,0.06)] dark:border-white/10 rounded-lg font-mono text-xs font-semibold text-[#1e2544] dark:text-[#d5d9e6]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] dark:bg-[#e0492a]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-8 border-t border-[rgba(10,10,10,0.08)] dark:border-white/10 font-mono text-[11px] text-[#5e6677] dark:text-[#8e96a8]">
                  From strategic vision to production master.
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 05: COMMISSIONS & DISPATCH ─── */}
        <section id="contact" className="scroll-mt-24">
          <div className="bg-white dark:bg-[#121318] border-2 border-[#0A0A0A] dark:border-white/25 rounded-3xl p-8 sm:p-14 lg:p-16 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 sm:gap-16 items-start">
              
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[rgba(10,10,10,0.05)] dark:bg-white/5 border border-[rgba(10,10,10,0.12)] dark:border-white/15 rounded font-mono text-xs tracking-widest text-[#e0492a] dark:text-[#ff5a36] font-bold uppercase mb-4">
                  <span>[05 // INQUIRIES &amp; ADVISORY]</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A] dark:text-[#FAF9F6] uppercase leading-[1.05] mb-6">
                  Directing your next digital commission.
                </h2>

                <p className="text-base sm:text-lg text-[#252a36] dark:text-[#c5cce0] leading-relaxed max-w-xl mb-8">
                  Open for select creative direction contracts, brand system architecture, and commercial motion collaborations globally.
                </p>

                {/* Interactive Action Bar */}
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href={PROFILE.gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-4 bg-[#0A0A0A] text-white dark:bg-[#FAF9F6] dark:text-[#0A0A0A] hover:bg-[#e0492a] dark:hover:bg-[#e0492a] dark:hover:text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
                  >
                    <span>INQUIRE FOR DIRECTION</span>
                    <span>&rarr;</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-2 px-6 py-4 bg-[#f4f5f8] dark:bg-[#1a1c23] hover:bg-[#e8ebf0] dark:hover:bg-[#252833] border border-[rgba(10,10,10,0.15)] dark:border-white/15 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-[#FAF9F6] transition-all"
                  >
                    <span>{copiedEmail ? 'COPIED TO CLIPBOARD!' : 'COPY EMAIL'}</span>
                    <span className="text-xs">&copy;</span>
                  </button>
                </div>
              </div>

              {/* Direct Info & Social Grid */}
              <div className="flex flex-col justify-between h-full space-y-8 lg:border-l lg:border-[rgba(10,10,10,0.1)] dark:lg:border-white/12 lg:pl-12 font-mono text-xs">
                <div>
                  <span className="block text-[#6a7285] dark:text-[#8e96a8] text-[10px] font-bold uppercase mb-1">
                    PRIMARY DISPATCH
                  </span>
                  <a 
                    href={PROFILE.gmailUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-base font-bold text-[#0A0A0A] dark:text-[#FAF9F6] hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-colors"
                  >
                    {PROFILE.email}
                  </a>
                  <p className="text-[#555d70] dark:text-[#9ca4b8] text-[11px] mt-1">
                    Turnaround expectation: &lt; 24 business hours.
                  </p>
                </div>

                <div>
                  <span className="block text-[#6a7285] dark:text-[#8e96a8] text-[10px] font-bold uppercase mb-2">
                    DIGITAL CHANNELS
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {PROFILE.socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-[#f6f7f9] dark:bg-[#1a1c23] border border-[rgba(10,10,10,0.08)] dark:border-white/10 hover:border-[#0A0A0A] dark:hover:border-white/40 rounded-lg font-bold text-[#0A0A0A] dark:text-[#FAF9F6] hover:text-[#e0492a] dark:hover:text-[#ff5a36] transition-all"
                      >
                        <span className="block text-[10px] text-[#6a7285] dark:text-[#8e96a8]">{s.label}</span>
                        <span className="text-xs">{s.username}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-[rgba(10,10,10,0.1)] dark:border-white/12 text-[#6a7285] dark:text-[#8e96a8] text-[11px] flex justify-between">
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
