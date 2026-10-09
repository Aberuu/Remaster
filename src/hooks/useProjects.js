import { useState, useEffect, useCallback } from 'react';
import { FEATURED_PROJECTS } from '../data/portfolioData';
import { fetchLiveProjects, isSupabaseConfigured } from '../lib/supabase';

const localMap = new Map(FEATURED_PROJECTS.map((p) => [p.id, p]));

function mapDatabaseProjects(data) {
  return data.map((item) => {
    const slug = item.slug || item.id;
    const local = localMap.get(slug);

    // If database thumbnail is the initial seed Unsplash placeholder or empty,
    // preserve the authentic high-resolution local asset (pj1, pj2, pj3, pj4).
    // If user uploaded a custom image (e.g. Supabase Storage), use the uploaded media!
    const isUnsplashThumb = typeof item.thumbnail_url === 'string' && item.thumbnail_url.includes('images.unsplash.com');
    const thumbnail = (item.thumbnail_url && !isUnsplashThumb)
      ? item.thumbnail_url
      : (local?.thumbnail || item.thumbnail_url);

    const isUnsplashHero = typeof item.hero_image_url === 'string' && item.hero_image_url.includes('images.unsplash.com');
    const heroImage = (item.hero_image_url && !isUnsplashHero)
      ? item.hero_image_url
      : (local?.heroImage || local?.thumbnail || thumbnail);

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
}

export function useProjects() {
  const [projects, setProjects] = useState(FEATURED_PROJECTS);
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
