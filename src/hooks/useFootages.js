import { useState, useEffect, useCallback } from 'react';
import { MOTION_FOOTAGES } from '../data/portfolioData';
import { fetchLiveFootages, isSupabaseConfigured } from '../lib/supabase';

export const localFootagesMap = new Map();
MOTION_FOOTAGES.forEach((f) => {
  localFootagesMap.set(f.id, f);
  if (f.title) {
    localFootagesMap.set(f.title.toLowerCase(), f);
  }
});

export function getLocalFootage(idOrTitle) {
  if (!idOrTitle) return null;
  return localFootagesMap.get(idOrTitle) || localFootagesMap.get(String(idOrTitle).toLowerCase());
}

function mapDatabaseFootages(data) {
  return data.map((item, idx) => {
    const slug = item.slug || item.id;
    const local = localFootagesMap.get(slug) || localFootagesMap.get(item.title?.toLowerCase());

    const video = (item.video_url && item.video_url.startsWith('http'))
      ? item.video_url
      : (local?.video || item.video_url);

    return {
      id: slug,
      rawId: item.id,
      title: item.title,
      subtitle: item.subtitle || '',
      category: item.category || 'Motion Direction',
      year: item.year || '2026',
      video,
      hasAudio: item.has_audio ?? local?.hasAudio ?? true,
      tag: item.tag || local?.tag || 'REEL',
      duration: item.duration || local?.duration || '00:30',
      aspect: item.aspect || local?.aspect || '16/9',
      description: item.description || local?.description || '',
      thumbnail: item.thumbnail_url || local?.thumbnail || null,
      thumbnail_url: item.thumbnail_url || local?.thumbnail || null,
      displayOrder: item.display_order ?? idx + 1,
      published: item.published !== false,
    };
  });
}

export function useFootages() {
  const [footages, setFootages] = useState(MOTION_FOOTAGES);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const loadFootages = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setFootages(MOTION_FOOTAGES);
      setLoading(false);
      setIsLive(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchLiveFootages();
      if (data && Array.isArray(data) && data.length > 0) {
        setFootages(mapDatabaseFootages(data));
        setIsLive(true);
      } else {
        setFootages(MOTION_FOOTAGES);
        setIsLive(false);
      }
    } catch (err) {
      console.warn('Fallback to local footages:', err);
      setFootages(MOTION_FOOTAGES);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialFetch() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setFootages(MOTION_FOOTAGES);
          setLoading(false);
          setIsLive(false);
        }
        return;
      }

      try {
        const data = await fetchLiveFootages();
        if (isMounted) {
          if (data && Array.isArray(data) && data.length > 0) {
            setFootages(mapDatabaseFootages(data));
            setIsLive(true);
          } else {
            setFootages(MOTION_FOOTAGES);
            setIsLive(false);
          }
        }
      } catch (err) {
        console.warn('Fallback to local footages:', err);
        if (isMounted) {
          setFootages(MOTION_FOOTAGES);
          setIsLive(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initialFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    footages,
    loading,
    isLive,
    refreshFootages: loadFootages,
  };
}
