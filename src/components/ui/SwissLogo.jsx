export default function SwissLogo({ size = 'md' }) {
  // Size variants
  const isSm = size === 'sm';

  return (
    <div className="flex items-center gap-3 group select-none">
      {/* ─── Architectural 3x3 Modular Pixel Glyphs (The "A" Monogram) ─── */}
      <div 
        className={`grid grid-cols-3 gap-[2px] p-[2.5px] bg-[#0A0A0A] rounded-[2px] transition-transform duration-300 group-hover:scale-105 ${
          isSm ? 'w-5 h-5' : 'w-6 h-6'
        }`}
        aria-hidden="true"
      >
        {/* Row 1: Top of 'A' */}
        <span className="bg-[#0A0A0A] rounded-[0.5px]" />
        <span className="bg-[#FFFFFF] rounded-[0.5px]" />
        <span className="bg-[#e0492a] rounded-[0.5px] group-hover:bg-[#d8ff00] transition-colors" />

        {/* Row 2: Middle crossbar of 'A' */}
        <span className="bg-[#FFFFFF] rounded-[0.5px]" />
        <span className="bg-[#FFFFFF] rounded-[0.5px]" />
        <span className="bg-[#FFFFFF] rounded-[0.5px]" />

        {/* Row 3: Legs of 'A' */}
        <span className="bg-[#FFFFFF] rounded-[0.5px]" />
        <span className="bg-[#0A0A0A] rounded-[0.5px]" />
        <span className="bg-[#FFFFFF] rounded-[0.5px]" />
      </div>

      {/* ─── Monospace Wordmark & Studio Tag ─── */}
      <div className="flex flex-col font-mono uppercase leading-tight">
        <span className="font-bold tracking-[0.2em] text-[#0A0A0A] text-xs transition-colors group-hover:text-[#e0492a]">
          ABERUU
        </span>
        <span className="text-[9px] tracking-[0.14em] text-[#71788a] font-medium hidden sm:inline">
          CREATIVE DIRECTION
        </span>
      </div>
    </div>
  );
}
