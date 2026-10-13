import { useEffect, useRef, useState } from 'react';

export default function PixelCursor() {
  const cursorRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }
    return true;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onMediaChange = (e) => setIsTouch(!e.matches);
    mediaQuery.addEventListener('change', onMediaChange);

    if (!mediaQuery.matches) return () => mediaQuery.removeEventListener('change', onMediaChange);

    const cursor = cursorRef.current;
    if (!cursor) return () => mediaQuery.removeEventListener('change', onMediaChange);

    let mouseX = -100;
    let mouseY = -100;
    let rafId = null;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) setVisible(true);

      // Direct zero-latency hardware transform
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);

    const onMouseOver = (e) => {
      const target = e.target.closest('a, button, [role="button"], input, textarea, select, .pxctl, [data-cursor-hover]');
      if (target) {
        setHovered(true);
      }
    };

    const onMouseOut = (e) => {
      const target = e.target.closest('a, button, [role="button"], input, textarea, select, .pxctl, [data-cursor-hover]');
      if (target) {
        setHovered(false);
      }
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      mediaQuery.removeEventListener('change', onMediaChange);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [visible]);

  if (isTouch) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-150 will-change-transform ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        // Align hotspot center exactly with coordinates
        marginLeft: '-6px',
        marginTop: '-6px',
      }}
    >
      {/* ─── Compact Modular Pixel Cursor Body ─── */}
      <div
        className={`relative flex items-center justify-center transition-all duration-150 ease-out select-none ${
          hovered
            ? 'w-5 h-5 -ml-1 -mt-1 bg-transparent'
            : clicked
            ? 'w-2.5 h-2.5 scale-90'
            : 'w-3 h-3'
        }`}
      >
        {hovered ? (
          /* ─── Hover State: Modular Pixel Crosshair Frame with Signature Red ─── */
          <div className="relative w-full h-full flex items-center justify-center animate-[spin_6s_linear_infinite]">
            {/* 4 Pixel Corner Brackets */}
            <span className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#e0492a]" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#e0492a]" />
            <span className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-[#e0492a]" />
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#e0492a]" />
            {/* Center Focal Pixel Dot */}
            <span className="w-1.5 h-1.5 bg-[#0A0A0A] dark:bg-[#FAF9F6] rounded-[0.5px]" />
          </div>
        ) : (
          /* ─── Default State: Sharp 10-12px Swiss Pixel Block ─── */
          <div
            className={`w-full h-full border-[1.5px] rounded-[1px] transition-colors duration-100 flex items-center justify-center ${
              clicked
                ? 'bg-[#d8ff00] border-[#0A0A0A]'
                : 'bg-white dark:bg-[#0A0A0A] border-[#0A0A0A] dark:border-[#FAF9F6] shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#FAF9F6]'
            }`}
          >
            {/* Center Micro Pixel Core */}
            <span
              className={`w-1 h-1 rounded-[0.5px] ${
                clicked ? 'bg-[#0A0A0A]' : 'bg-[#e0492a]'
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
