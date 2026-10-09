import VideoFinal from '../assets/footages/final.mp4';
import VideoSed from '../assets/footages/sed.mp4';
import pj1 from '../assets/images/pj1.webp';
import pj2 from '../assets/images/pj2.webp';
import pj3 from '../assets/images/pj3.webp';
import pj4 from '../assets/images/pj4.webp';

export const PROFILE = {
  name: 'Agaphe Abel',
  handle: 'Aberuu',
  title: 'Creative Director & Design Technologist',
  headline: 'Directing high-contrast visual systems, brutalist digital architecture, and cinematic web experiences.',
  bio: 'Directing at the intersection of Swiss typographic discipline, generative code, and cinematic storytelling. Leading brand systems, digital spatial design, and tactile web experiences for culture-defining brands globally.',
  status: 'Open for Creative Direction & Design Advisory',
  email: 'abelagaphe@gmail.com',
  resumeUrl: '#resume',
  socials: [
    { label: 'GitHub', href: 'https://github.com/Aberuu', username: '@Aberuu' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/abelagaphe', username: 'Agaphe Abel' },
    { label: 'Instagram', href: 'https://instagram.com/abelagaphe', username: '@abelagaphe' },
    { label: 'Email', href: 'mailto:abelagaphe@gmail.com', username: 'abelagaphe@gmail.com' },
  ],
  skills: [
    {
      category: 'Creative & Art Direction',
      items: [
        'Brand Identity Architecture',
        'Swiss Typographic Systems',
        'Visual Pacing & Curation',
        'Editorial Layout Systems',
        'Creative Strategy',
        'Art Direction & Styling',
      ],
    },
    {
      category: 'Interactive & Spatial Design',
      items: [
        'Brutalist & Modern UI/UX',
        'Design Tokens & Design Systems',
        'Motion Primitives & Physics',
        'Generative Canvas & Creative Code',
        'Tactile Prototyping',
        'Accessibility (WCAG AAA)',
      ],
    },
    {
      category: 'Cinematics & Media Direction',
      items: [
        'Film & Commercial Direction',
        'DaVinci Resolve Color Science',
        'Kinetic Typography & Motion',
        'Spatial Sound Architecture',
        'Visual Narrative Pacing',
        'Commercial Post-Production',
      ],
    },
  ],
};

export const FEATURED_PROJECTS = [
  {
    id: 'lumen-os',
    title: 'Lumen OS',
    subtitle: 'Spatial Design System & Workspace for Creative Leads',
    category: 'Creative Direction & System Architecture',
    role: 'Creative Director & Product Architect',
    year: '2025',
    featured: true,
    thumbnail: pj1,
    summary: 'An intentional spatial workspace system built with real-time sync, modular OKLCH design tokens, and tactile motion primitives.',
    tags: ['Creative Direction', 'Design Systems', 'React', 'Motion Primitives', 'Brutalism'],
    metrics: [
      { label: 'Lighthouse Score', value: '98/100' },
      { label: 'Sync Latency', value: '< 50ms' },
      { label: 'Design System', value: 'Zero-dep Tokens' },
    ],
    challenge: 'Creative teams frequently juggle disconnected tools for asset reviews, motion specs, and token definitions, creating severe visual drift between design intent and production code.',
    solution: 'Directed the holistic visual language and technical architecture for Lumen OS, unifying real-time token inspection with spatial component staging in a single brutalist interface.',
    process: 'Formulated the visual grammar around Swiss grid constraints and OKLCH color science. Iterated from interactive wireframes to a lightweight WebSocket state layer, validating typography scale across viewports.',
    results: 'Delivered an ultra-responsive interface with sub-50ms sync speed and a 98+ Google Lighthouse performance score. The system is currently in daily use for staging design prototypes.',
    links: [
      { label: 'View Source', href: 'https://github.com/Aberuu' },
      { label: 'Live Demo', href: 'https://github.com/Aberuu' },
    ],
  },
  {
    id: 'quiet-mornings',
    title: 'Quiet Mornings',
    subtitle: 'Cinematic Visual Study in Urban Stillness',
    category: 'Art Direction & Cinematic Color Science',
    role: 'Director, Cinematographer & Colorist',
    year: '2025',
    featured: true,
    thumbnail: pj3,
    video: VideoFinal,
    summary: 'A meditative short film exploring urban solitude through disciplined framing, natural light exposure, and bespoke Kodak color science.',
    tags: ['Art Direction', 'Cinematography', 'DaVinci Resolve', 'Sound Design'],
    metrics: [
      { label: 'Runtime', value: '3m 42s' },
      { label: 'Production Format', value: '4K DCI' },
      { label: 'Color Space', value: 'DaVinci Wide Gamut' },
    ],
    challenge: 'Capturing dawn transitions in high-contrast urban landscapes while preserving natural shadow roll-off and emotional quietness without digital sharpening or artificial lighting.',
    solution: 'Shot across 14 consecutive dawn sessions using fixed prime lenses and manual exposure pacing. Developed a bespoke Kodak 2383-inspired film emulation print curve in DaVinci Resolve.',
    process: 'Carefully timed shoots around civil twilight (05:00 to 06:15 WIB). Post-production focused on subtended contrast curves and spatial sound design composed from binaural urban field recordings.',
    results: 'Featured in regional creative showcases, praised by peers for visual restraint, tonal consistency, and deep emotional resonance.',
    links: [
      { label: 'Watch Full Film', href: 'https://instagram.com/abelagaphe' },
    ],
  },
  {
    id: 'sed-expression',
    title: 'Expressive Day #7',
    subtitle: 'Commercial Event Film & Motion Direction',
    category: 'Commercial Motion Direction & Kinetic Identity',
    role: 'Motion Director & Visual Lead',
    year: '2025',
    featured: true,
    thumbnail: pj4,
    video: VideoSed,
    summary: 'A fast-paced recap film combining kinetic typography, rhythmic sound design, and live performance cinematography.',
    tags: ['Motion Direction', 'Kinetic Typography', 'Premiere Pro', 'After Effects'],
    metrics: [
      { label: 'Footage Ingested', value: '40+ Hours' },
      { label: 'Turnaround Time', value: '48 Hours' },
      { label: 'Platform Reach', value: '25K+ Views' },
    ],
    challenge: 'Distilling over 40 hours of multi-stage festival footage into a punchy, 90-second social-first recap while maintaining narrative momentum and sponsor branding obligations.',
    solution: 'Constructed a rhythm-locked cut structured around dynamic bass transients, custom kinetic title cards, and seamless speed-ramped transitions.',
    process: 'Established an on-site ingest station for immediate daily rushes backup. Edited rough cuts each evening and delivered the finalized master 48 hours post-event for maximum social velocity.',
    results: 'Generated over 25,000 views within 48 hours on event social channels, setting an all-time engagement record for the festival community.',
    links: [
      { label: 'Watch Video', href: 'https://instagram.com/abelagaphe' },
    ],
  },
  {
    id: 'cadence-audio',
    title: 'Cadence',
    subtitle: 'Tactile Audio Journaling Interface',
    category: 'Interaction Design & Creative Technology',
    role: 'Design Director & Interaction Lead',
    year: '2024',
    featured: true,
    thumbnail: pj2,
    summary: 'A client-side audio journaling tool featuring real-time waveform visualization, tactile typography, and on-device recording privacy.',
    tags: ['Interaction Design', 'Web Audio API', 'Next.js', 'Typography'],
    metrics: [
      { label: 'Server Dependency', value: 'Zero Cloud Audio' },
      { label: 'Bundle Footprint', value: 'Sub-45KB JS' },
      { label: 'Accessibility', value: 'WCAG AAA Compliant' },
    ],
    challenge: 'Voice journaling applications frequently require cloud transcription, raising privacy concerns for users who want a secure personal space for uninhibited voice reflection.',
    solution: 'Directed and built an entirely client-side web application leveraging the browser Web Audio API and IndexedDB for local audio storage, paired with an uncluttered, focus-oriented UI.',
    process: 'Designed an interactive SVG waveform visualizer running smoothly on requestAnimationFrame. Implemented full keyboard navigation and high-contrast color themes.',
    results: 'Delivered an ultra-lightweight web application with zero external API dependencies, immediate audio playback, and complete user data sovereignty.',
    links: [
      { label: 'View Source', href: 'https://github.com/Aberuu' },
      { label: 'Live Demo', href: 'https://github.com/Aberuu' },
    ],
  },
];
