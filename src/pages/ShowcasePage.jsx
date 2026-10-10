import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFootages } from '../hooks/useFootages';

export default function ShowcasePage() {
  const { footages, loading } = useFootages();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [unmutedId, setUnmutedId] = useState(null);
  const [activePlayingMap, setActivePlayingMap] = useState({});
  const [modalVideo, setModalVideo] = useState(null);
  const videoRefs = useRef({});

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter categories
  const categories = ['ALL', 'AFTERMOVIE', 'CAMPAIGN', 'COMMERCIAL', 'BRAND REEL'];

  const filteredFootages = footages.filter((item) => {
    if (activeFilter === 'ALL') return true;
    const tag = (item.tag || '').toUpperCase();
    const cat = (item.category || '').toUpperCase();
    if (activeFilter === 'AFTERMOVIE') return tag.includes('AFTER') || cat.includes('AFTER');
    if (activeFilter === 'CAMPAIGN') return tag.includes('CAMPAIGN') || cat.includes('CAMPAIGN');
    if (activeFilter === 'COMMERCIAL') return tag.includes('COMMERCIAL') || cat.includes('COMMERCIAL');
    if (activeFilter === 'BRAND REEL') return tag.includes('BRAND') || cat.includes('BRAND');
    return true;
  });

  const handleToggleCardPlay = (id) => {
    const vid = videoRefs.current[id];
    if (!vid) return;

    if (vid.paused) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  };

  const toggleAudio = (id, e) => {
    e.stopPropagation();
    setUnmutedId((prev) => {
      const next = prev === id ? null : id;
      Object.entries(videoRefs.current).forEach(([vId, vid]) => {
        if (vid) {
          vid.muted = vId !== next;
        }
      });
      return next;
    });
  };

  const openModal = (item) => {
    Object.values(videoRefs.current).forEach((vid) => {
      if (vid && !vid.paused) vid.pause();
    });
    setModalVideo(item);
  };

  const closeModal = useCallback(() => {
    setModalVideo(null);
  }, []);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalVideo) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalVideo, closeModal]);

  return (
    <div className="w-full bg-[#fbfbfa] text-[#0A0A0A] min-h-screen font-sans">
      <main className="w-full px-6 sm:px-10 md:px-16 lg:px-20 pt-8 sm:pt-12 pb-32 max-w-[1440px] mx-auto">
        
        {/* Top Breadcrumb & Return Bar */}
        <div className="flex items-center justify-between border-b border-[rgba(10,10,10,0.12)] pb-4 mb-10 sm:mb-14">
          <Link 
            to="/#motion" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[rgba(10,10,10,0.15)] hover:border-[#0A0A0A] rounded-lg font-mono text-xs font-bold text-[#0A0A0A] uppercase tracking-wider transition-all shadow-sm"
          >
            <span>&larr;</span>
            <span>RETURN TO OVERVIEW</span>
          </Link>

          <span className="font-mono text-xs text-[#5e6677] uppercase tracking-wider font-semibold">
            GALLERY VAULT // ARCHIVE 2024-2026
          </span>
        </div>

        {/* Gallery Title & Header Card */}
        <header className="bg-white border-2 border-[#0A0A0A] rounded-3xl p-8 sm:p-12 lg:p-14 shadow-sm mb-12 sm:mb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e0492a] font-bold mb-3">
                <span>[VAULT COMPLETE ARCHIVE]</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A0A0A] uppercase leading-[1.05] mb-4">
                Directed Motion &amp; Footage Gallery
              </h1>

              <p className="text-base sm:text-lg text-[#383f4f] leading-relaxed max-w-3xl font-normal">
                Explore the complete collection of commercial reels, event aftermovies, and kinetic brand stories. Every cut is edited with surgical rhythm, bespoke color grading, and intentional sound pacing.
              </p>
            </div>

            {/* Total Counter Badge */}
            <div className="flex flex-col items-start lg:items-end font-mono">
              <span className="text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
                {String(footages.length).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-wider text-[#5e6677] font-semibold">
                MASTER REELS ARCHIVED
              </span>
            </div>
          </div>

          {/* Interactive Category Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-8 mt-8 border-t border-[rgba(10,10,10,0.1)] font-mono text-xs uppercase tracking-wider">
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
                {cat} {cat === 'ALL' ? `[${footages.length}]` : ''}
              </button>
            ))}
          </div>
        </header>

        {/* Video Cards Grid */}
        {loading ? (
          <div className="py-24 text-center font-mono text-xs uppercase tracking-wider text-[#8b8b8b]">
            LOADING MOTION VAULT...
          </div>
        ) : filteredFootages.length === 0 ? (
          <div className="py-24 bg-white border-2 border-dashed border-[rgba(10,10,10,0.2)] rounded-2xl text-center font-mono">
            <p className="text-sm uppercase text-[#434b5c] mb-4">NO FOOTAGE FOUND IN THIS CATEGORY.</p>
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className="px-4 py-2 bg-[#0A0A0A] text-white rounded text-xs font-bold uppercase"
            >
              RESET FILTER
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {filteredFootages.map((item, idx) => {
              const isUnmuted = unmutedId === item.id;
              const isPlaying = !!activePlayingMap[item.id];

              return (
                <article
                  key={item.id}
                  className="group bg-white border-2 border-[rgba(10,10,10,0.12)] hover:border-[#0A0A0A] rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Metadata */}
                    <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider mb-4 pb-3 border-b border-[rgba(10,10,10,0.08)]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#e0492a]">REEL 0{idx + 1}</span>
                        <span className="text-[#8b8b8b]">&bull;</span>
                        <span className="font-semibold text-[#0A0A0A]">{item.year}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-[#f0f2f5] text-[#1c2230] rounded font-bold text-[10px]">
                        {item.tag}
                      </span>
                    </div>

                    {/* Video Container Frame */}
                    <div 
                      className="relative w-full aspect-[16/10] bg-[#101217] rounded-xl overflow-hidden border border-[rgba(10,10,10,0.14)] mb-6 shadow-inner cursor-pointer"
                      onClick={() => handleToggleCardPlay(item.id)}
                      title="Click to toggle playback"
                    >
                      <video
                        ref={(el) => {
                          if (el) videoRefs.current[item.id] = el;
                        }}
                        src={item.video}
                        muted={!isUnmuted}
                        loop
                        playsInline
                        preload="metadata"
                        onPlay={() => setActivePlayingMap((prev) => ({ ...prev, [item.id]: true }))}
                        onPause={() => setActivePlayingMap((prev) => ({ ...prev, [item.id]: false }))}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                      />

                      {/* Top Left Status Badge */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                        <div className="px-2.5 py-1 bg-black/80 backdrop-blur-md rounded border border-white/20 font-mono text-[10px] tracking-widest uppercase font-bold text-white flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#e0492a] animate-ping' : 'bg-white/40'}`} />
                          <span>{isPlaying ? 'PLAYING' : 'STANDBY'}</span>
                        </div>
                      </div>

                      {/* Bottom Right Controls (Desktop Only) */}
                      <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-2">
                        {item.hasAudio && (
                          <button
                            type="button"
                            onClick={(e) => toggleAudio(item.id, e)}
                            aria-label={isUnmuted ? 'Mute audio' : 'Unmute audio'}
                            className={`min-h-[36px] px-3 py-1.5 rounded font-mono text-[10px] font-bold tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5 ${
                              isUnmuted
                                ? 'bg-[#e0492a] text-white border border-[#e0492a]'
                                : 'bg-black/80 hover:bg-black text-white/90 border border-white/20 hover:border-white'
                            }`}
                          >
                            <span>{isUnmuted ? 'VOL ON' : 'MUTED'}</span>
                            <span aria-hidden="true">{isUnmuted ? '\u{1F50A}' : '\u{1F507}'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(item);
                          }}
                          aria-label={`Open ${item.title} in cinema view`}
                          className="min-h-[36px] px-3 py-1.5 bg-black/80 hover:bg-black text-white rounded font-mono text-[10px] font-bold tracking-wider uppercase border border-white/20 hover:border-white transition-all shadow-md flex items-center gap-1"
                        >
                          <span>CINEMA VIEW</span>
                          <span aria-hidden="true">&nearr;</span>
                        </button>
                      </div>

                      {/* Replay Overlay Hint when video is paused (Desktop Only) */}
                      {!isPlaying && (
                        <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] hidden sm:flex items-center justify-center pointer-events-none transition-opacity">
                          <div className="px-3 py-1.5 bg-black/85 border border-white/30 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                            CLICK TO PLAY
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content & Metadata */}
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider text-[#e0492a] font-bold mb-1.5">
                        {item.category}
                      </div>

                      <h3 className="text-2xl font-bold tracking-tight text-[#0A0A0A] group-hover:text-[#e0492a] transition-colors uppercase mb-2">
                        {item.title}
                      </h3>

                      <p className="text-sm sm:text-base text-[#383f4f] leading-relaxed font-normal mb-4">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Bar */}
                  <div className="pt-4 border-t border-[rgba(10,10,10,0.08)] flex items-center justify-between font-mono text-xs">
                    <span className="text-[#6a7285] text-[11px]">
                      ASPECT RATIO: {item.aspect}
                    </span>

                    <button
                      type="button"
                      onClick={() => openModal(item)}
                      className="min-h-[44px] px-3 py-2 font-bold uppercase tracking-wider text-[#0A0A0A] group-hover:text-[#e0492a] inline-flex items-center gap-1.5 hover:underline underline-offset-4 rounded-lg transition-colors"
                    >
                      <span>WATCH MASTER</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </main>

      {/* Cinema Lightbox Modal */}
      {modalVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={`Cinema View: ${modalVideo.title}`}
        >
          <div 
            className="relative w-full max-w-5xl bg-[#111317] border-2 border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-black/70 border-b border-white/10 flex items-center justify-between font-mono text-xs text-white">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-[#e0492a] text-white font-bold rounded text-[10px]">
                  CINEMA MASTER
                </span>
                <span className="font-bold tracking-wide uppercase">
                  {modalVideo.title} ({modalVideo.year})
                </span>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="min-h-[44px] px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 rounded font-bold uppercase tracking-wider transition-colors"
              >
                [ESC // CLOSE]
              </button>
            </div>

            {/* Modal Player */}
            <div className="relative w-full aspect-[16/9] bg-black">
              <video
                src={modalVideo.video}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 bg-black/90 text-white font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
              <p className="text-white/80 font-sans text-sm">
                {modalVideo.description}
              </p>
              <span className="text-white/50 text-[11px] whitespace-nowrap">
                {modalVideo.category}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
