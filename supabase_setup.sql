-- ==============================================================================
-- ABERUU PORTFOLIO CMS - SUPABASE DATABASE & STORAGE INITIALIZATION
-- ==============================================================================
-- Instructions:
-- 1. Create a free project at https://supabase.com
-- 2. Go to the SQL Editor in your Supabase Dashboard
-- 3. Paste and run this entire script
-- 4. Go to Storage -> Create a new public bucket named: portfolio-media
-- ==============================================================================

-- 1. Create projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  category text not null,
  role text not null,
  year text not null default '2026',
  featured boolean default false,
  display_order int default 0,
  thumbnail_url text not null,
  hero_image_url text,
  video_url text,
  summary text not null,
  tags text[] default '{}',
  metrics jsonb default '[]'::jsonb,
  challenge text,
  solution text,
  process text,
  results text,
  links jsonb default '[]'::jsonb,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.projects enable row level security;

-- 3. Policies: Public can read published projects
drop policy if exists "Public can view published projects" on public.projects;
create policy "Public can view published projects"
  on public.projects for select
  using (published = true);

-- 4. Policies: Authenticated Admin can perform all CRUD actions
drop policy if exists "Admin can view all projects" on public.projects;
create policy "Admin can view all projects"
  on public.projects for select
  to authenticated
  using (true);

drop policy if exists "Admin can insert projects" on public.projects;
create policy "Admin can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

drop policy if exists "Admin can update projects" on public.projects;
create policy "Admin can update projects"
  on public.projects for update
  to authenticated
  using (true);

drop policy if exists "Admin can delete projects" on public.projects;
create policy "Admin can delete projects"
  on public.projects for delete
  to authenticated
  using (true);

-- 5. Seed Initial Projects (Aberuu Creative Director Archive)
insert into public.projects (
  slug, title, subtitle, category, role, year, featured, display_order,
  thumbnail_url, summary, tags, metrics, challenge, solution, process, results, published
) values
(
  'lumen-os',
  'Lumen OS',
  'Spatial Design System & Workspace for Creative Leads',
  'Creative Direction & System Architecture',
  'Creative Director & Product Architect',
  '2025',
  true,
  1,
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
  'An intentional spatial workspace system built with real-time sync, modular OKLCH design tokens, and tactile motion primitives.',
  array['Creative Direction', 'Design Systems', 'React', 'Motion Primitives', 'Brutalism'],
  '[{"label": "Lighthouse Score", "value": "98/100"}, {"label": "Sync Latency", "value": "< 50ms"}, {"label": "Design System", "value": "Zero-dep Tokens"}]'::jsonb,
  'Creative teams frequently juggle disconnected tools for asset reviews, motion specs, and token definitions, creating severe visual drift between design intent and production code.',
  'Directed the holistic visual language and technical architecture for Lumen OS, unifying real-time token inspection with spatial component staging in a single brutalist interface.',
  'Formulated the visual grammar around Swiss grid constraints and OKLCH color science. Iterated from interactive wireframes to a lightweight WebSocket state layer, validating typography scale across viewports.',
  'Delivered an ultra-responsive interface with sub-50ms sync speed and a 98+ Google Lighthouse performance score. The system is currently in daily use for staging design prototypes.',
  true
),
(
  'quiet-mornings',
  'Quiet Mornings',
  'Cinematic Visual Study in Urban Stillness',
  'Art Direction & Cinematic Color Science',
  'Director, Cinematographer & Colorist',
  '2025',
  true,
  2,
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
  'A meditative short film exploring urban solitude through disciplined framing, natural light exposure, and bespoke Kodak color science.',
  array['Art Direction', 'Cinematography', 'DaVinci Resolve', 'Sound Design'],
  '[{"label": "Runtime", "value": "3m 42s"}, {"label": "Production Format", "value": "4K DCI"}, {"label": "Color Space", "value": "DaVinci Wide Gamut"}]'::jsonb,
  'Capturing dawn transitions in high-contrast urban landscapes while preserving natural shadow roll-off and emotional quietness without digital sharpening or artificial lighting.',
  'Shot across 14 consecutive dawn sessions using fixed prime lenses and manual exposure pacing. Developed a bespoke Kodak 2383-inspired film emulation print curve in DaVinci Resolve.',
  'Carefully timed shoots around civil twilight (05:00 to 06:15 WIB). Post-production focused on subtended contrast curves and spatial sound design composed from binaural urban field recordings.',
  'Featured in regional creative showcases, praised by peers for visual restraint, tonal consistency, and deep emotional resonance.',
  true
),
(
  'sed-expression',
  'Expressive Day #7',
  'Commercial Event Film & Motion Direction',
  'Commercial Motion Direction & Kinetic Identity',
  'Motion Director & Visual Lead',
  '2025',
  true,
  3,
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
  'A fast-paced recap film combining kinetic typography, rhythmic sound design, and live performance cinematography.',
  array['Motion Direction', 'Kinetic Typography', 'Premiere Pro', 'After Effects'],
  '[{"label": "Footage Ingested", "value": "40+ Hours"}, {"label": "Turnaround Time", "value": "48 Hours"}, {"label": "Platform Reach", "value": "25K+ Views"}]'::jsonb,
  'Distilling over 40 hours of multi-stage festival footage into a punchy, 90-second social-first recap while maintaining narrative momentum and sponsor branding obligations.',
  'Constructed a rhythm-locked cut structured around dynamic bass transients, custom kinetic title cards, and seamless speed-ramped transitions.',
  'Established an on-site ingest station for immediate daily rushes backup. Edited rough cuts each evening and delivered the finalized master 48 hours post-event for maximum social velocity.',
  'Generated over 25,000 views within 48 hours on event social channels, setting an all-time engagement record for the festival community.',
  true
),
(
  'cadence-audio',
  'Cadence',
  'Tactile Audio Journaling Interface',
  'Interaction Design & Creative Technology',
  'Design Director & Interaction Lead',
  '2024',
  true,
  4,
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
  'A client-side audio journaling tool featuring real-time waveform visualization, tactile typography, and on-device recording privacy.',
  array['Interaction Design', 'Web Audio API', 'Next.js', 'Typography'],
  '[{"label": "Server Dependency", "value": "Zero Cloud Audio"}, {"label": "Bundle Footprint", "value": "Sub-45KB JS"}, {"label": "Accessibility", "value": "WCAG AAA Compliant"}]'::jsonb,
  'Voice journaling applications frequently require cloud transcription, raising privacy concerns for users who want a secure personal space for uninhibited voice reflection.',
  'Directed and built an entirely client-side web application leveraging the browser Web Audio API and IndexedDB for local audio storage, paired with an uncluttered, focus-oriented UI.',
  'Designed an interactive SVG waveform visualizer running smoothly on requestAnimationFrame. Implemented full keyboard navigation and high-contrast color themes.',
  'Delivered an ultra-lightweight web application with zero external API dependencies, immediate audio playback, and complete user data sovereignty.',
  true
)
on conflict (slug) do nothing;

-- ==============================================================================
-- 6. Storage Bucket & Storage RLS Policies for portfolio-media
-- ==============================================================================
-- Creates the bucket if it does not exist and ensures it is public
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = true;

-- Policy 1: Allow public read access to uploaded media
drop policy if exists "Public media view" on storage.objects;
create policy "Public media view"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');

-- Policy 2: Allow authenticated admins to upload files
drop policy if exists "Authenticated admin media upload" on storage.objects;
create policy "Authenticated admin media upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-media');

-- Policy 3: Allow authenticated admins to update files
drop policy if exists "Authenticated admin media update" on storage.objects;
create policy "Authenticated admin media update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-media');

-- Policy 4: Allow authenticated admins to delete files
drop policy if exists "Authenticated admin media delete" on storage.objects;
create policy "Authenticated admin media delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-media');

-- ==============================================================================
-- 7. Showcase Videos Table (Motion & Footage Archive)
-- ==============================================================================
create table if not exists public.showcase_videos (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  subtitle text,
  category text not null,
  year text not null default '2026',
  video_url text not null,
  thumbnail_url text,
  tag text not null default 'REEL',
  has_audio boolean default true,
  aspect text default '16/9',
  description text,
  display_order int default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.showcase_videos enable row level security;

-- Policies: Public can read published showcase videos
drop policy if exists "Public can view published showcase videos" on public.showcase_videos;
create policy "Public can view published showcase videos"
  on public.showcase_videos for select
  using (published = true);

-- Policies: Authenticated Admin can perform all CRUD actions
drop policy if exists "Admin can view all showcase videos" on public.showcase_videos;
create policy "Admin can view all showcase videos"
  on public.showcase_videos for select
  to authenticated
  using (true);

drop policy if exists "Admin can insert showcase videos" on public.showcase_videos;
create policy "Admin can insert showcase videos"
  on public.showcase_videos for insert
  to authenticated
  with check (true);

drop policy if exists "Admin can update showcase videos" on public.showcase_videos;
create policy "Admin can update showcase videos"
  on public.showcase_videos for update
  to authenticated
  using (true);

drop policy if exists "Admin can delete showcase videos" on public.showcase_videos;
create policy "Admin can delete showcase videos"
  on public.showcase_videos for delete
  to authenticated
  using (true);

