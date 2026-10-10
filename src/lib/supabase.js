import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Strip trailing /rest/v1 or trailing slashes if accidentally included
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Fetch all published projects ordered by display_order
 */
export async function fetchLiveProjects() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Supabase query error, falling back to local archive:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Supabase network error, falling back to local archive:', err);
    return null;
  }
}

/**
 * Fetch all projects for admin (including unpublished)
 */
export async function fetchAdminProjects() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Upload a media file (image/video) directly to the portfolio-media bucket
 */
export async function uploadPortfolioMedia(file) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Please add your credentials in .env.local.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('portfolio-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from('portfolio-media')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Insert a new project
 */
export async function createProject(project) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing project
 */
export async function updateProject(id, updates) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a project
 */
export async function deleteProject(id) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ==============================================================================
// Showcase Videos (Motion & Footage Archive) API
// ==============================================================================

/**
 * Fetch all published showcase videos ordered by display_order
 */
export async function fetchLiveFootages() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('showcase_videos')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Supabase query error on showcase_videos, falling back to local:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Supabase network error on showcase_videos:', err);
    return null;
  }
}

/**
 * Fetch all showcase videos for admin (including drafts)
 */
export async function fetchAdminFootages() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('showcase_videos')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export const isValidUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

/**
 * Insert a new showcase video
 */
export async function createFootage(footage) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('showcase_videos')
    .insert([footage])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Upsert a showcase video by slug
 */
export async function upsertFootage(footage) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('showcase_videos')
    .upsert([footage], { onConflict: 'slug' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a showcase video by UUID or slug
 */
export async function updateFootage(idOrSlug, updates) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');

  const query = supabase
    .from('showcase_videos')
    .update({ ...updates, updated_at: new Date().toISOString() });

  const { data, error } = isValidUUID(idOrSlug)
    ? await query.eq('id', idOrSlug).select().single()
    : await query.eq('slug', idOrSlug).select().single();

  if (error) throw error;
  return data;
}

/**
 * Delete a showcase video by UUID or slug
 */
export async function deleteFootage(idOrSlug) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');

  const query = supabase.from('showcase_videos').delete();
  const { error } = isValidUUID(idOrSlug)
    ? await query.eq('id', idOrSlug)
    : await query.eq('slug', idOrSlug);

  if (error) throw error;
  return true;
}

/**
 * Update display order of multiple showcase videos
 */
export async function updateFootagesOrder(orderedItems) {
  if (!isSupabaseConfigured || !supabase) return;

  const validItems = orderedItems.filter((item) => isValidUUID(item.id) || Boolean(item.slug));
  const updates = validItems.map((item, index) => {
    const query = supabase
      .from('showcase_videos')
      .update({ display_order: index + 1, updated_at: new Date().toISOString() });

    return isValidUUID(item.id)
      ? query.eq('id', item.id)
      : query.eq('slug', item.slug || item.id);
  });

  await Promise.all(updates);
}

// ==============================================================================
// 15-Minute Strict Admin Session Management
// ==============================================================================
export const ADMIN_SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
export const ADMIN_SESSION_KEY = 'aberuu_admin_session_expiry';

export function getAdminSessionRemainingMs() {
  const expiry = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!expiry) return 0;
  const remaining = parseInt(expiry, 10) - Date.now();
  return remaining > 0 ? remaining : 0;
}

export function resetAdminSessionTimer() {
  const expiry = Date.now() + ADMIN_SESSION_DURATION_MS;
  localStorage.setItem(ADMIN_SESSION_KEY, expiry.toString());
  return expiry;
}

export function clearAdminSessionTimer() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

/**
 * Sign in admin user with 15-minute strict session expiration
 */
export async function loginAdmin(email, password) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL in .env.local.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  
  // Initialize 15-minute timer
  resetAdminSessionTimer();
  return data;
}

/**
 * Sign out admin user and clear session timer
 */
export async function logoutAdmin() {
  clearAdminSessionTimer();
  if (!supabase) return;
  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn('Supabase signOut error:', error.message);
  } catch (err) {
    console.warn('Supabase signOut catch:', err);
  }
}

/**
 * Get current session user - validates against 15-minute expiration
 */
export async function getCurrentAdmin() {
  if (!isSupabaseConfigured || !supabase) return null;

  // Enforce 15-minute expiration limit
  const remaining = getAdminSessionRemainingMs();
  if (remaining <= 0) {
    // Session expired or not established, clean up and force re-login
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    clearAdminSessionTimer();
    return null;
  }

  const { data } = await supabase.auth.getSession();
  if (!data?.session?.user) {
    clearAdminSessionTimer();
    return null;
  }

  return data.session.user;
}
