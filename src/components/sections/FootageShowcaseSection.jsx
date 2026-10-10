import { useState, useRef, useEffect, useCallback } from 'react';
import { MOTION_FOOTAGES } from '../../data/portfolioData';

const AUTOPLAY_CYCLE_SECONDS = 30;

export default function FootageShowcaseSection() {
  const sectionRef = useRef(null);
  const videoRefs = useRef({});

  // Playback & Timing state
  const [inView, setInView] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cycleCompleted, setCycleCompleted] = useState(false);
  const [activeHoverId, setActiveHoverId] = useState(null);
  const [unmutedId, setUnmutedId] = useState(null);
  const [playingMap, setPlayingMap] = useState({});

  // Cinema modal state
  const [modalVideo, setModalVideo] = useState(null);

  // Refs for timer and cycle management
  const hasStartedRef = useRef(false);
  const cycleDoneRef = useRef(false);
  const intervalRef = useRef(null);
  const inViewRef = useRef(false);

  // Keep inViewRef updated for callbacks
  useEffect(() => {
    inViewRef.current = inView;
  }, [inView]);

  // ─── Timer Helper Functions ───
  const startAutoplayTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= AUTOPLAY_CYCLE_SECONDS) {
          clearInterval(intervalRef.current);
          cycleDoneRef.current = true;
          setCycleCompleted(true);

          // Pause all videos at cycle completion
          Object.values(videoRefs.current).forEach((vid) => {
            if (vid) vid.pause();
          });
          return AUTOPLAY_CYCLE_SECONDS;
        }
        return next;
      });
    }, 1000);
  }, []);

  const pauseGridVideos = useCallback(() => {
    clearInterval(intervalRef.current);
    Object.values(videoRefs.current).forEach((vid) => {
      if (vid && !vid.paused) {
        vid.pause();
      }
    });
  }, []);

  const playGridVideos = useCallback(() => {
    Object.values(videoRefs.current).forEach((vid) => {
      if (vid && vid.paused) {
        vid.play().catch(() => {});
      }
    });
    startAutoplayTimer();
  }, [startAutoplayTimer]);

  // ─── 1. Intersection Observer (Scroll-Aware) ───
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ─── 2. Smart 30-Second Autoplay Cycle ───
  useEffect(() => {
    // If cycle is done or modal is open, do not trigger background autoplay
    if (cycleDoneRef.current || modalVideo) return;

    if (inView) {
      hasStartedRef.current = true;
      playGridVideos();
    } else {
      // User scrolled out of view: pause to save CPU and battery
      if (hasStartedRef.current && !cycleDoneRef.current) {
        pauseGridVideos();
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [inView, modalVideo, playGridVideos, pauseGridVideos]);

  // ─── 3. Card Playback Interactions ───
  // Inline toggle play on card click (desktop or mobile)
  const handleToggleCardPlay = (id) => {
    const vid = videoRefs.current[id];
    if (!vid) return;

    if (vid.paused) {
      vid.play().catch(() => {});
      setActiveHoverId(id);
    } else {
      vid.pause();
    }
  };

  // Hover to play after 30s cycle
  const handleCardMouseEnter = (id) => {
    setActiveHoverId(id);
    if (cycleDoneRef.current && !modalVideo) {
      const vid = videoRefs.current[id];
      if (vid && vid.paused) {
        vid.play().catch(() => {});
      }
    }
  };

  const handleCardMouseLeave = (id) => {
    setActiveHoverId((prev) => (prev === id ? null : prev));
    if (cycleDoneRef.current && !modalVideo) {
      const vid = videoRefs.current[id];
      if (vid && !vid.paused) {
        vid.pause();
      }
    }
  };

  // ─── 4. Audio Toggle (Single active audio at a time) ───
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

  // ─── 5. Cinema Modal Handler ───
  const openModal = (item) => {
    // Pause background grid and timer while modal is open
    pauseGridVideos();
    setModalVideo(item);
  };

  const closeModal = useCallback(() => {
    setModalVideo(null);

    // If 30s cycle is still running and section is in view, resume background autoplay!
    if (!cycleDoneRef.current && inViewRef.current) {
      playGridVideos();
    }
  }, [playGridVideos]);

  // Keyboard accessibility: ESC closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalVideo) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalVideo, closeModal]);

  const progressPercent = Math.min(100, (elapsedSeconds / AUTOPLAY_CYCLE_SECONDS) * 100);

  return (
    <section 
      ref={sectionRef} 
      id="motion" 
      className="mb-28 sm:mb-36 scroll-mt-24 font-sans"
    >
      {/* ─── Section Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#0A0A0A] pb-5 mb-10 sm:mb-14">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#e0492a] font-bold mb-1">
            <span>[02 // MOTION &amp; REEL VAULT]</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] uppercase">
            Directed Motion &amp; Footage Archive
          </h2>
        </div>

        {/* Studio Status & Monitor Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 font-mono text-xs">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[rgba(10,10,10,0.15)] rounded-md shadow-sm">
            <span className={`w-2 h-2 rounded-full ${!cycleCompleted && inView ? 'bg-[#e0492a] animate-pulse' : 'bg-[#5e6677]'}`} />
            <span className="font-bold text-[#0A0A0A]">
              {!cycleCompleted 
                ? `[REC 00:${String(elapsedSeconds).padStart(2, '0')} / 00:30]` 
                : '[CYCLE COMPLETED // STANDBY]'}
            </span>
          </div>
          <span className="text-[#5e6677] uppercase text-[11px] font-semibold">
            04 MASTER REELS &bull; 1080P/4K
          </span>
        </div>
      </div>

      {/* Progress Bar of the 30-Second Autoplay Cycle (Desktop Only) */}
      {!cycleCompleted && (
        <div className="hidden sm:block w-full bg-[rgba(10,10,10,0.08)] h-1 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-[#e0492a] h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* ─── 2x2 High-Contrast Brutalist Video Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {MOTION_FOOTAGES.map((item, idx) => {
          const isHovered = activeHoverId === item.id;
          const isUnmuted = unmutedId === item.id;
          const isPlaying = !!playingMap[item.id];

          return (
            <article 
              key={item.id}
              className="group bg-white border-2 border-[rgba(10,10,10,0.12)] hover:border-[#0A0A0A] rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              onMouseEnter={() => handleCardMouseEnter(item.id)}
              onMouseLeave={() => handleCardMouseLeave(item.id)}
            >
              <div>
                {/* Card Top Metadata Pill */}
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
                    onPlay={() => setPlayingMap((prev) => ({ ...prev, [item.id]: true }))}
                    onPause={() => setPlayingMap((prev) => ({ ...prev, [item.id]: false }))}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />

                  {/* Top Left Status Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <div className="px-2.5 py-1 bg-black/80 backdrop-blur-md rounded border border-white/20 font-mono text-[10px] tracking-widest uppercase font-bold text-white flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#e0492a] animate-ping' : 'bg-white/40'}`} />
                      <span>
                        {isPlaying
                          ? (!cycleCompleted ? 'AUTOPLAY' : 'PLAYING') 
                          : 'STANDBY'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Right Controls (Desktop Only: hidden on mobile to keep frame clean) */}
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

                  {/* Replay Overlay Hint when cycle finished and video is paused (Desktop Only) */}
                  {cycleCompleted && !isPlaying && !isHovered && (
                    <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] hidden sm:flex items-center justify-center pointer-events-none transition-opacity">
                      <div className="px-3 py-1.5 bg-black/85 border border-white/30 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                        HOVER / CLICK TO PLAY
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

      {/* ─── 6. Cinema Lightbox Modal ─── */}
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
    </section>
  );
}
