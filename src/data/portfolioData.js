import VideoFinal from '../assets/footages/final.mp4';
import VideoSed from '../assets/footages/sed.mp4';
import VideoMotion from '../assets/footages/motion.mp4';
import VideoOrteca from '../assets/footages/orteca.mp4';
import pj1 from '../assets/images/pj1.webp';
import pj2 from '../assets/images/pj2.webp';
import pj4 from '../assets/images/pj4.webp';

export const PROFILE = {  
  name: 'Agaphe Abel',
  handle: 'Aberuu',
  title: 'Creative Director',
  headline: 'Directing high-contrast visual systems, brutalist digital architecture, and cinematic web experiences.',
  bio: 'Directing at the intersection of Swiss typographic discipline, generative code, and cinematic storytelling. Leading brand systems, digital spatial design, and tactile web experiences for culture-defining brands globally.',
  status: 'Open for Creative Direction & Design Advisory',
  email: 'abelagaphe@gmail.com',
  gmailUrl: 'https://mail.google.com/mail/?view=cm&fs=1&to=abelagaphe@gmail.com&su=Project%20Inquiry%20//%20Aberuu%20Direction',
  resumeUrl: '#resume',
  socials: [
    { label: 'GitHub', href: 'https://github.com/Aberuu', username: '@Aberuu' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/abelagaphe', username: 'Agaphe Abel' },
    { label: 'Instagram', href: 'https://instagram.com/abelagaphe', username: '@abelagaphe' },
    { label: 'Gmail', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=abelagaphe@gmail.com&su=Project%20Inquiry%20//%20Aberuu%20Direction', username: 'abelagaphe@gmail.com' },
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
    id: 'sed-8',
    title: 'SMUQ Expressive Day #8',
    subtitle: 'Comprehensive Visual Identity & Campaign Strategy',
    category: 'Creative Direction, Event Branding',
    role: 'Creative Director',
    year: '2025',
    featured: true,
    thumbnail: pj4,
    summary: 'A comprehensive visual identity and social media campaign for SMA Kristen 1 Salatiga\'s annual music festival. Built around the "Everland" theme to create a cohesive digital ecosystem and audience engagement strategy across all event phases.',
    tags: ['Creative Direction', 'Event Branding', 'Social Media Campaign', 'Content Strategy'],
    metrics: [
      { label: 'Integrated Visual System', value: 'End-to-End Campaign Strategy' },
    ],
    challenge: 'Establishing a distinct visual identity for an annual festival that bridges youthful energy with professional execution, while organizing complex communication flows into a unified digital experience.',
    solution: 'Developed the "Everland" concept featuring bold color palettes, playful typography, and retro textures. Crafted individual social media assets as interconnected components of a single Instagram grid system.',
    process: 'Structured the audience journey across four distinct phases: pre-event teasers, informational guidelines, live event coverage, and post-event documentation recaps.',
    results: 'Successfully delivered a recognizable and visually consistent festival campaign, maintaining continuous crowd engagement and digital momentum.',
    links: [
      { label: 'Instagram Archive', href: 'https://instagram.com/abelagaphe' },
    ],
  },
  {
    id: 'Skyrace',
    title: 'Merbabu Skyrace',
    subtitle: 'High-Endurance Trail Run Visual Documentation',
    category: 'Sports, Videography',
    role: 'Videographer & Sports Photographer',
    year: '2026',
    featured: false,
    thumbnail: pj2,
    summary: 'A visual documentation project capturing the intensity, grit, and emotional high points of high-altitude trail running during Merbabu Skyrace 2026 through dynamic camera movement and natural light exposure.',
    tags: ['Videography', 'Sports Photography', 'Trail Run', 'Color Grading'],
    metrics: [
      { label: 'High-Motion Capture', value: 'Natural Light Grading' },
    ],
    challenge: 'Documenting fast-moving athletes across unpredictable mountain terrain and fluctuating high-altitude weather, while maintaining cinematic framing and sharp focus.',
    solution: 'Employed lightweight, agile camera rigs to navigate steep trail sections alongside runners. Developed a custom warm-toned color profile designed to enhance organic textures.',
    process: 'Strategic positioning at key altitude checkpoints and high-intensity trail segments. Post-production focused on rhythmic editing matched with dynamic sound design.',
    results: 'Delivered high-impact video highlights and sports photography assets used for social media coverage and post-event recaps.',
    links: [
      { label: 'View Documentation', href: 'https://instagram.com/abelagaphe' },
    ],
  },
  {
    id: 'sed-expression',
    title: 'Expressive Day #7',
    subtitle: 'Commercial Event Film & Motion Direction',
    category: 'Motion Direction, Videography',
    role: 'Videographer & Video Editor',
    year: '2024',
    featured: false,
    thumbnail: pj1,
    video: VideoSed,
    summary: 'A fast-paced recap film and stage performance cinematography combining kinetic typography, rhythmic sound design, and live performance documentation for Expressive Day #7.',
    tags: ['Motion Direction', 'Videography', 'Video Editing', 'Kinetic Typography'],
    metrics: [
      { label: 'Multi-Stage Ingest', value: 'Commercial Event Cut' },
    ],
    challenge: 'Capturing diverse stage acts and crowd moments under dynamic, rapidly changing concert lighting while maintaining narrative momentum throughout post-production.',
    solution: 'Constructed a rhythm-locked cut structured around dynamic bass transients, custom kinetic title cards, and seamless speed-ramped transitions.',
    process: 'Executed on-site video capture across various festival zones, followed by structured post-production including color correction and motion graphics.',
    results: 'Produced a high-energy recap film and promotional media assets that effectively captured the spirit of the event.',
    links: [
      { label: 'Watch Video', href: 'https://instagram.com/abelagaphe' },
    ],
  },
];

export const MOTION_FOOTAGES = [
  {
    id: 'footage-sed7',
    title: 'SMUQ Expressive Day #7',
    subtitle: 'Commercial Event Aftermovie & Multi-Stage Edit',
    category: 'Aftermovie & Motion Direction',
    year: '2024',
    video: VideoFinal,
    hasAudio: false,
    tag: 'AFTERMOVIE',
    duration: '00:30',
    aspect: '16/9',
    description: 'Rhythm-driven festival recap capturing concert momentum, bass transients, and dynamic multi-angle stage cuts.',
  },
  {
    id: 'footage-sed8',
    title: 'SMUQ Expressive Day #8',
    subtitle: 'Everland Concept Teaser & Social Campaign',
    category: 'Event Campaign & Concept Reel',
    year: '2025',
    video: VideoSed,
    hasAudio: true,
    tag: 'CAMPAIGN REEL',
    duration: '00:29',
    aspect: '16/9',
    description: 'Kinetic social campaign teaser establishing the Everland visual universe with synchronized sound design.',
  },
  {
    id: 'footage-motion',
    title: '31Studio Salatiga',
    subtitle: 'Commercial Motion Design & Kinetic Identity',
    category: 'Commercial Use & Motion Graphics',
    year: '2026',
    video: VideoMotion,
    hasAudio: false,
    tag: 'COMMERCIAL',
    duration: '00:30',
    aspect: '4/3',
    description: 'Commercial motion design engineered for high digital retention, graphic pacing, and studio branding.',
  },
  {
    id: 'footage-orteca',
    title: 'Orteca Company',
    subtitle: 'Short-Form Brand Film & Narrative Pacing',
    category: 'Brand Film & Short-Form Motion',
    year: '2026',
    video: VideoOrteca,
    hasAudio: true,
    tag: 'BRAND REEL',
    duration: '00:30',
    aspect: '4/3',
    description: 'Short-form brand cuts combining intentional sound pacing, typographic hierarchy, and sharp color grading.',
  },
];

