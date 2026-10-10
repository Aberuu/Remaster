import { useState, useEffect, useCallback } from 'react';
import { FEATURED_PROJECTS } from '../data/portfolioData';
import { fetchLiveProjects, isSupabaseConfigured } from '../lib/supabase';

export const localMap = new Map();
FEATURED_PROJECTS.forEach((p) => {
  localMap.set(p.id, p);
  if (p.id === 'sed-8') {
    localMap.set('sed#8', p);
    localMap.set('lumes-os', p);
    localMap.set('lumen-os', p);
    localMap.set('smuq-8', p);
  }
  if (p.id === 'Skyrace') {
    localMap.set('quiet-mornings', p);
    localMap.set('merbabu-skyrace', p);
    localMap.set('skyrace', p);
  }
  if (p.id === 'cadence-audio') {
    localMap.set('cadence', p);
    localMap.set('cadence-audio', p);
  }
});

const DELETED_PROJECTS_KEY = 'aberuu_deleted_projects';

export function getDeletedProjects() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(DELETED_PROJECTS_KEY) : null;
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map((s) => String(s).toLowerCase()) : []);
  } catch {
    return new Set();
  }
}

export function markProjectDeleted(slugOrId) {
  if (!slugOrId || typeof window === 'undefined') return;
  try {
    const deleted = getDeletedProjects();
    deleted.add(String(slugOrId).toLowerCase());
    localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify([...deleted]));
  } catch (err) {
    console.warn('Failed to save deleted project to storage:', err);
  }
}

export function unmarkProjectDeleted(slugOrId) {
  if (!slugOrId || typeof window === 'undefined') return;
  try {
    const deleted = getDeletedProjects();
    deleted.delete(String(slugOrId).toLowerCase());
    localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify([...deleted]));
  } catch (err) {
    console.warn('Failed to remove deleted project from storage:', err);
  }
}

export function getLocalProject(slug) {
  if (!slug) return null;
  const target = String(slug).toLowerCase();
  const deleted = getDeletedProjects();
  if (deleted.has(target)) return null;
  return localMap.get(slug) || localMap.get(target);
}

function mapDatabaseProjects(data) {
  const deleted = getDeletedProjects();
  const dbProjects = data
    .filter((item) => {
      const slug = (item.slug || item.id || '').toLowerCase();
      const rawId = (item.id || '').toLowerCase();
      return !deleted.has(slug) && !deleted.has(rawId);
    })
    .map((item) => {
      const slug = item.slug || item.id;
      const local = localMap.get(slug);

      // If database thumbnail is the initial seed Unsplash placeholder or empty,
      // preserve the authentic high-resolution local asset (pj1, pj2, pj4).
      // If user uploaded a custom image (e.g. Supabase Storage), use the uploaded media!
      const isUnsplashThumb = typeof item.thumbnail_url === 'string' && item.thumbnail_url.includes('images.unsplash.com');
      const thumbnail = (item.thumbnail_url && !isUnsplashThumb)
        ? item.thumbnail_url
        : (local?.thumbnail || item.thumbnail_url);

      const isUnsplashHero = typeof item.hero_image_url === 'string' && item.hero_image_url.includes('images.unsplash.com');
      const heroImage = (item.hero_image_url && !isUnsplashHero)
        ? item.hero_image_url
        : (thumbnail || local?.heroImage || local?.thumbnail);

      const video = item.video_url || local?.video || null;

      return {
        id: slug,
        rawId: item.id,
        title: item.title,
        subtitle: item.subtitle,
        category: item.category,
        role: item.role,
        year: item.year,
        featured: item.featured,
        thumbnail,
        heroImage,
        video,
        summary: item.summary,
        tags: item.tags && item.tags.length > 0 ? item.tags : (local?.tags || []),
        metrics: Array.isArray(item.metrics) && item.metrics.length > 0 ? item.metrics : (local?.metrics || []),
        challenge: item.challenge || local?.challenge,
        solution: item.solution || local?.solution,
        process: item.process || local?.process,
        results: item.results || local?.results,
        links: Array.isArray(item.links) && item.links.length > 0 ? item.links : (local?.links || []),
      };
    });

  // Preserve any local projects that might not exist yet in Supabase
  const existingSlugs = new Set(dbProjects.map((p) => (p.id || '').toLowerCase()));
  const missingLocals = FEATURED_PROJECTS.filter(
    (fp) => {
      const fpId = fp.id.toLowerCase();
      const fpSlug = (fp.slug || '').toLowerCase();
      if (deleted.has(fpId) || deleted.has(fpSlug)) return false;
      return !existingSlugs.has(fpId) && 
             !existingSlugs.has(fpSlug) &&
             !(fp.id === 'cadence-audio' && existingSlugs.has('cadence')) &&
             !(fp.id === 'sed-8' && (existingSlugs.has('lumen-os') || existingSlugs.has('sed#8'))) &&
             !(fp.id === 'Skyrace' && (existingSlugs.has('quiet-mornings') || existingSlugs.has('merbabu-skyrace')));
    }
  );

  return [...dbProjects, ...missingLocals];
}

export function useProjects() {
  const [projects, setProjects] = useState(() => {
    const deleted = getDeletedProjects();
    return FEATURED_PROJECTS.filter(
      (p) => !deleted.has(p.id.toLowerCase()) && !deleted.has((p.slug || '').toLowerCase())
    );
  });
  const [loading, setLoading] = useState(Boolean(isSupabaseConfigured));
  const [isLive, setIsLive] = useState(false);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      const data = await fetchLiveProjects();
      if (data && data.length > 0) {
        setProjects(mapDatabaseProjects(data));
        setIsLive(true);
      }
    } catch (err) {
      console.warn('Error refreshing live projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    fetchLiveProjects()
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          setProjects(mapDatabaseProjects(data));
          setIsLive(true);
        }
      })
      .catch((err) => {
        console.warn('Live projects load error, using local fallback:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    projects,
    loading,
    isLive,
    refresh,
  };
}
