import { useEffect, useRef, useState } from 'react';
import { PROFILE } from '../../data/portfolioData';

export default function WildHeroSection() {
  const canvasRef = useRef(null);
  const [cellSize, setCellSize] = useState(9); // S: 9, M: 14, L: 22
  const [brushSize, setBrushSize] = useState(10); // S: 6, M: 10, L: 16
  const [currentTime, setCurrentTime] = useState('');

  // Live time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(`${timeStr} WIB`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generative Pixel-Art Wave Canvas Simulation (Flank / Side-Constrained)
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let animId;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let cell = cellSize;
    let BRUSH = brushSize;
    let cols = 0;
    let rows = 0;
    let heat = null;
    let t = 0;
    const SEED = Math.random() * 1000;
    const waves = [];
    let shake = 0;
    let mx = -1;
    let my = -1;
    let pmx = -1;
    let pmy = -1;
    let hov = false;
    let introT = 0;
    let charging = false;
    let chT0 = 0;
    let chx = 0;
    let chy = 0;

    // Palette bands from DESIGN.md
    const BANDS = [
      [0.30, '#1c2541'], // ink navy
      [0.46, '#3b5bd9'], // electric cobalt
      [0.62, '#f5c518'], // warm yellow
      [0.78, '#e0492a'], // Wild red accent
    ];
    const NEON = '#d8ff00';

    const resize = () => {
      const parent = cv.parentElement;
      W = parent ? parent.clientWidth : window.innerWidth;
      H = parent ? parent.clientHeight : window.innerHeight;
      cv.width = Math.round(W * DPR);
      cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      cols = Math.ceil(W / cell) + 1;
      rows = Math.ceil(H / cell) + 1;
      heat = new Float32Array(cols * rows);
    };

    resize();
    window.addEventListener('resize', resize);

    function hsh(c, r) {
      const n = Math.sin(c * 127.1 + r * 311.7 + SEED * 0.13) * 43758.5453;
      return n - Math.floor(n);
    }

    function base(nx, ny, tt) {
      const s = SEED;
      nx += Math.sin(ny * 5 + tt * 0.5 + s) * 0.05;
      ny += Math.cos(nx * 5 - tt * 0.4) * 0.05;
      const v =
        Math.sin(nx * 5.6 + s * 1.3 + tt * 0.3) * Math.cos(ny * 4.7 - s * 0.7 + tt * 0.22) +
        Math.sin((nx * 1.4 + ny * 1.7) * 4.1 - s + tt * 0.16) +
        Math.sin(ny * 9 + s * 2.1 + nx * 3) * 0.5 +
        Math.sin(nx * 13 - s * 1.7) * 0.28;
      return 0.5 + 0.5 * (v / 2.55);
    }

    function region(nx, ny, tt) {
      return 0.5 + 0.5 * Math.sin(nx * 2.1 + tt * 0.12 + SEED * 0.7) * Math.cos(ny * 1.8 - tt * 0.09 + SEED * 0.3);
    }

    function dep(x, y, amt, sig) {
      const cc = x / cell;
      const cr = y / cell;
      const rad = Math.ceil(sig * 1.6);
      const inv = 1 / (2 * sig * sig * 0.18);
      for (let dr = -rad; dr <= rad; dr++) {
        for (let dc = -rad; dc <= rad; dc++) {
          const c = (cc + dc) | 0;
          const r = (cr + dr) | 0;
          if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
          const dx = c + 0.5 - cc;
          const dy = r + 0.5 - cr;
          const w = Math.exp(-(dx * dx + dy * dy) * inv);
          if (w < 0.02) continue;
          const id = r * cols + c;
          const vv = heat[id] + amt * w;
          heat[id] = vv > 1 ? 1 : vv;
        }
      }
    }

    function follow(x, y, sig) {
      if (pmx < 0) {
        pmx = x;
        pmy = y;
      }
      const dx = x - pmx;
      const dy = y - pmy;
      const dl = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.min(48, Math.round(dl / (cell * 0.8))));
      for (let s = 1; s <= steps; s++) {
        const f = s / steps;
        dep(pmx + dx * f, pmy + dy * f, 0.18, sig);
      }
      pmx = x;
      pmy = y;
    }

    // Pointer listeners
    const onPointerMove = (e) => {
      const rect = cv.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      hov = true;
    };

    const onPointerDown = (e) => {
      if (e.target.closest('button, a, input, .pxctl')) return;
      const rect = cv.getBoundingClientRect();
      charging = true;
      chT0 = performance.now() / 1000;
      chx = e.clientX - rect.left;
      chy = e.clientY - rect.top;
    };

    const release = () => {
      if (!charging) return;
      charging = false;
      const ns = performance.now() / 1000;
      const ch = Math.min((ns - chT0) / 2.2, 1);
      waves.push({ x: chx, y: chy, t0: ns, pow: 0.35 + ch * 2.1 });
      dep(chx, chy, 1, BRUSH * (2.5 + ch * 18));
      shake = 0.45 + ch * 1.9;
    };

    const onDblClick = (e) => {
      if (e.target.closest('button, a, input, .pxctl')) return;
      const rect = cv.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      waves.push({ x: clickX, y: clickY, t0: performance.now() / 1000, pow: 2.8 });
      dep(clickX, clickY, 1, BRUSH * 22);
      shake = 2.4;
    };

    const heroEl = cv.parentElement;
    if (heroEl) {
      heroEl.addEventListener('pointermove', onPointerMove);
      heroEl.addEventListener('pointerdown', onPointerDown);
      heroEl.addEventListener('dblclick', onDblClick);
    }
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    // Frame rendering
    let lastTs = performance.now();
    const render = (ts) => {
      const dt = ts - lastTs;
      lastTs = ts;
      t += dt;
      introT += dt / 1000;
      const tt = t * 0.001;
      const ns = performance.now() / 1000;

      // Dissolve & decay heat
      for (let i = 0; i < heat.length; i++) {
        heat[i] *= 0.88;
        if (heat[i] < 0.003) heat[i] = 0;
      }

      // Cursor tracking
      if (hov && mx > 0 && my > 0 && mx < W && my < H) {
        follow(mx, my, BRUSH);
      }

      // Charging pulse
      if (charging) {
        const chg = Math.min((ns - chT0) / 2.2, 1);
        dep(chx, chy, 0.45 + chg * 0.5, BRUSH * (2 + chg * 8));
        if (shake < 0.12 + chg * 0.35) shake = 0.12 + chg * 0.35;
      }

      // Expanding wave shockwaves
      for (let wi = waves.length - 1; wi >= 0; wi--) {
        const wv = waves[wi];
        const age = ns - wv.t0;
        if (age > 1.5) {
          waves.splice(wi, 1);
          continue;
        }
        const pw = wv.pow || 1;
        const R = age * Math.hypot(W, H) * 1.7;
        const sig = cell * 5.5 * pw;
        const amp = Math.max(0, 1 - age / 1.5) * 1.2 * pw;
        const inv = 1 / (2 * sig * sig);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const dx = (c + 0.5) * cell - wv.x;
            const dy = (r + 0.5) * cell - wv.y;
            const dd = Math.sqrt(dx * dx + dy * dy);
            const g = amp * Math.exp(-((dd - R) * (dd - R)) * inv);
            if (g > 0.02) {
              const id = r * cols + c;
              if (g > heat[id]) heat[id] = g;
            }
          }
        }
      }

      // Drawing to canvas
      ctx.save();
      if (shake > 0.01) {
        shake *= 0.9;
        ctx.translate((Math.random() - 0.5) * shake * 16, (Math.random() - 0.5) * shake * 16);
      } else {
        shake = 0;
      }

      ctx.clearRect(0, 0, W, H);

      // Grid background lines
      ctx.strokeStyle = '#f3f3f5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = 0; gx <= W; gx += cell) {
        ctx.moveTo(gx + 0.5, 0);
        ctx.lineTo(gx + 0.5, H);
      }
      for (let gy = 0; gy <= H; gy += cell) {
        ctx.moveTo(0, gy + 0.5);
        ctx.lineTo(W, gy + 0.5);
      }
      ctx.stroke();

      // Render pixels (SIDE FLANKS ONLY - pixels on the sides, center kept 100% clean!)
      const intro = introT / 1.5;
      const s = cell - 1;
      for (let r = 0; r < rows; r++) {
        const ny = (r * cell) / H;
        for (let c = 0; c < cols; c++) {
          const nx = (c * cell) / W;
          let v = heat[r * cols + c] * 0.9;

          // SIDE FLANK MASK:
          // nx: 0 is far-left, 0.5 is middle, 1.0 is far-right.
          // edgeDist: 0 at edges, 0.5 at center.
          const edgeDist = Math.min(nx, 1 - nx);
          
          // Generative pixels only spawn within outer 26% margins (left and right sides only!)
          // Smooth falloff towards the center so the middle stays pristine.
          const isSide = edgeDist < 0.26;
          const sideIntensity = isSide ? Math.pow(1 - (edgeDist / 0.26), 1.4) : 0;

          if (sideIntensity > 0 && region(nx, ny, tt) > 0.20 && hsh(c * 1.7 + 11.3, r * 1.3 + 5.1) < intro) {
            const ambient = base(nx, ny, tt) + (hsh(c, r) - 0.5) * 0.12 + Math.sin(c * 0.6 + r * 0.8 + tt * 1.7) * 0.045;
            v += ambient * sideIntensity;
          }

          if (v < 0.3) continue;

          let col = BANDS[0][1];
          if (v >= BANDS[1][0]) col = BANDS[1][1];
          if (v >= BANDS[2][0]) col = BANDS[2][1];
          if (v >= BANDS[3][0]) col = BANDS[3][1];
          if (v >= 0.86 && v < 1.02) col = NEON;

          ctx.fillStyle = col;
          ctx.fillRect(c * cell, r * cell, s, s);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      if (heroEl) {
        heroEl.removeEventListener('pointermove', onPointerMove);
        heroEl.removeEventListener('pointerdown', onPointerDown);
        heroEl.removeEventListener('dblclick', onDblClick);
      }
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, [cellSize, brushSize]);

  return (
    <div className="relative w-full overflow-hidden bg-white text-[#0A0A0A] font-sans select-none border-b border-[rgba(10,10,10,0.12)] min-h-[calc(100vh-52px)] h-[calc(100vh-52px)] flex flex-col justify-between">
      
      {/* ─── Generative Pixel Art Canvas Keyvisual (Scoped to Hero, Pixels on Sides) ─── */}
      <canvas
        ref={canvasRef}
        id="hero-kv"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-0 block"
      />

      {/* ─── Technical Masthead Sub-Bar ─── */}
      <div className="relative z-10 w-full shrink-0 border-b border-[rgba(10,10,10,0.08)] bg-white/80 backdrop-blur-sm px-6 sm:px-10 lg:px-14 py-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#434b5c]">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0A0A0A]">{PROFILE.name.toUpperCase()}</span>
            <span className="text-[rgba(10,10,10,0.3)]">//</span>
            <span className="font-bold text-[#0A0A0A]">{PROFILE.handle.toUpperCase()}</span>
            <span className="text-[rgba(10,10,10,0.3)]">//</span>
            <span className="text-[#3b4252] hidden sm:inline">{PROFILE.title}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline tabular-nums text-[#616a7d]">
              LOCATION // INDONESIA (LAT -7.33°, LONG 110.5°)
            </span>
            <span className="font-bold tabular-nums text-[#0A0A0A] bg-[rgba(10,10,10,0.05)] px-2 py-0.5 rounded border border-[rgba(10,10,10,0.08)]">
              {currentTime || 'LOCAL TIME'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Hero Core Content Block (.hhead & .hgrid) ─── */}
      <section className="relative z-10 w-full flex-grow flex items-center bg-white/70 backdrop-blur-[2px] px-6 sm:px-10 lg:px-14 py-6 sm:py-8">
        <div className="max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Massive High-Contrast Swiss Typography */}
          <div className="flex flex-col justify-between">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[rgba(10,10,10,0.04)] border border-[rgba(10,10,10,0.12)] rounded font-mono text-[11px] tracking-widest text-[#e0492a] font-bold uppercase mb-4">
                <span>[00 // INTRODUCTION]</span>
              </div>
              
              <h1 className="text-[clamp(44px,7.8vw,110px)] font-bold tracking-[-0.04em] leading-[0.91] uppercase text-[#0A0A0A]">
                <span className="block overflow-hidden">
                  <span className="inline-block animate-[heroLine_0.95s_steps(6)_both_0.1s]">CRAFT,</span>
                </span>
                <span className="block overflow-hidden text-[#0A0A0A]">
                  <span className="inline-block animate-[heroLine_0.95s_steps(6)_both_0.22s]">& ENGINEERED.</span>
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-[#333a48] uppercase tracking-wider mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0492a]" />
              <span>CREATIVE DIRECTION</span>
              <span className="text-[rgba(10,10,10,0.3)]">/</span>
              <span>VISUAL SYSTEMS</span>
              <span className="text-[rgba(10,10,10,0.3)]">/</span>
              <span>FRONT-END ENGINEERING</span>
            </div>
          </div>

          {/* Right Column: Technical Description & Actions */}
          <div className="relative flex flex-col justify-between gap-8 lg:pl-12 lg:border-l lg:border-[rgba(10,10,10,0.14)]">
            <div>
              <p className="text-[clamp(18px,1.9vw,26px)] font-semibold uppercase leading-[1.22] tracking-[-0.015em] text-[#0A0A0A] mb-5">
                BRIDGING TECHNOLOGY AND CREATIVITY THROUGH COHESIVE DIGITAL EXPERIENCES.
              </p>
              
              <p className="text-sm sm:text-base text-[#2e3442] leading-relaxed max-w-[44ch] font-normal">
                Synthesizing modern editorial design with front-end engineering rigor. Orchestrating visual identities, interactive web architectures, and strategic narratives that communicate clear messages.
              </p>
            </div>

            {/* Technical Button & Identity Cluster */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t border-[rgba(10,10,10,0.12)]">
              <a
                href="#work"
                style={{ color: '#ffffff' }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider bg-[#0A0A0A] !text-white hover:bg-[#e0492a] transition-all shadow-sm hover:shadow"
              >
                <span style={{ color: '#ffffff' }}>EXPLORE COMMISSIONS</span>
                <span style={{ color: '#ffffff' }}>&darr;</span>
              </a>

              <a
                href="#contact"
                style={{ color: '#0A0A0A' }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider border-2 border-[rgba(10,10,10,0.2)] !text-[#0A0A0A] hover:border-[#0A0A0A] hover:bg-black/5 transition-all"
              >
                <span style={{ color: '#0A0A0A' }}>INITIATE DIALOGUE</span>
                <span style={{ color: '#0A0A0A' }}>&rarr;</span>
              </a>

              <span className="font-mono text-[10px] text-[#4b5262] uppercase tracking-wider sm:ml-auto self-center font-medium">
                EST. 2022 // ID
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Running Kinetic Marquee Strip (Clear High Contrast) ─── */}
      <div className="relative z-10 w-full shrink-0 bg-[#0A0A0A] py-3 overflow-hidden border-t border-[rgba(10,10,10,0.2)]">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.2em] px-4" style={{ color: '#ffffff' }}>
              <span style={{ color: '#ffffff' }}>CREATIVE DIRECTION</span>
              <span className="text-[#e0492a] font-bold">&lowast;</span>
              <span style={{ color: '#ffffff' }}>SWISS SYSTEM ARCHITECTURE</span>
              <span className="text-[#d8ff00] font-bold">&lowast;</span>
              <span style={{ color: '#ffffff' }}>MOTION &amp; COLOR DIRECTION</span>
              <span className="text-[#e0492a] font-bold">&lowast;</span>
              <span style={{ color: '#ffffff' }}>TACTILE DIGITAL CRAFT</span>
              <span className="text-[#d8ff00] font-bold">&lowast;</span>
              <span style={{ color: '#ffffff' }}>ABERUU // 2026</span>
              <span className="text-[#e0492a] font-bold">&lowast;</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Interactive Pixel Controls Floating Toolbar (.pxctl) ─── */}
      <div
        className="fixed left-4 bottom-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/95 backdrop-blur-md border border-[rgba(10,10,10,0.15)] shadow-lg font-mono text-[10px] uppercase tracking-wider text-[#0A0A0A]"
        aria-label="Generative Canvas Controls"
      >
        <span className="text-[#687082] text-[9px] font-bold">GRID:</span>
        <button
          type="button"
          onClick={() => setCellSize(22)}
          style={{ color: cellSize === 22 ? '#ffffff' : '#0A0A0A' }}
          className={`w-6 h-6 flex items-center justify-center rounded border text-[10px] font-bold transition-all ${
            cellSize === 22
              ? 'bg-[#0A0A0A] !text-white border-[#0A0A0A]'
              : 'bg-white !text-[#0A0A0A] border-[rgba(10,10,10,0.15)] hover:border-black'
          }`}
          title="Large Cells (22px)"
        >
          L
        </button>
        <button
          type="button"
          onClick={() => setCellSize(14)}
          style={{ color: cellSize === 14 ? '#ffffff' : '#0A0A0A' }}
          className={`w-6 h-6 flex items-center justify-center rounded border text-[10px] font-bold transition-all ${
            cellSize === 14
              ? 'bg-[#0A0A0A] !text-white border-[#0A0A0A]'
              : 'bg-white !text-[#0A0A0A] border-[rgba(10,10,10,0.15)] hover:border-black'
          }`}
          title="Medium Cells (14px)"
        >
          M
        </button>
        <button
          type="button"
          onClick={() => setCellSize(9)}
          style={{ color: cellSize === 9 ? '#ffffff' : '#0A0A0A' }}
          className={`w-6 h-6 flex items-center justify-center rounded border text-[10px] font-bold transition-all ${
            cellSize === 9
              ? 'bg-[#0A0A0A] !text-white border-[#0A0A0A]'
              : 'bg-white !text-[#0A0A0A] border-[rgba(10,10,10,0.15)] hover:border-black'
          }`}
          title="Small Cells (9px)"
        >
          S
        </button>

        <span className="w-px h-3.5 bg-[rgba(10,10,10,0.15)] mx-1" />

        <span className="text-[#687082] text-[9px] font-bold">BRUSH:</span>
        <button
          type="button"
          onClick={() => setBrushSize(16)}
          style={{ color: brushSize === 16 ? '#ffffff' : '#0A0A0A' }}
          className={`w-6 h-6 flex items-center justify-center rounded border text-[10px] font-bold transition-all ${
            brushSize === 16
              ? 'bg-[#0A0A0A] !text-white border-[#0A0A0A]'
              : 'bg-white !text-[#0A0A0A] border-[rgba(10,10,10,0.15)] hover:border-black'
          }`}
          title="Large Brush (16px)"
        >
          L
        </button>
        <button
          type="button"
          onClick={() => setBrushSize(10)}
          style={{ color: brushSize === 10 ? '#ffffff' : '#0A0A0A' }}
          className={`w-6 h-6 flex items-center justify-center rounded border text-[10px] font-bold transition-all ${
            brushSize === 10
              ? 'bg-[#0A0A0A] !text-white border-[#0A0A0A]'
              : 'bg-white !text-[#0A0A0A] border-[rgba(10,10,10,0.15)] hover:border-black'
          }`}
          title="Medium Brush (10px)"
        >
          M
        </button>
        <button
          type="button"
          onClick={() => setBrushSize(6)}
          style={{ color: brushSize === 6 ? '#ffffff' : '#0A0A0A' }}
          className={`w-6 h-6 flex items-center justify-center rounded border text-[10px] font-bold transition-all ${
            brushSize === 6
              ? 'bg-[#0A0A0A] !text-white border-[#0A0A0A]'
              : 'bg-white !text-[#0A0A0A] border-[rgba(10,10,10,0.15)] hover:border-black'
          }`}
          title="Small Brush (6px)"
        >
          S
        </button>
      </div>

    </div>
  );
}
