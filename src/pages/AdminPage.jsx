import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  isSupabaseConfigured, 
  supabase, 
  fetchAdminProjects, 
  updateProject, 
  deleteProject, 
  upsertProject,
  fetchAdminFootages,
  updateFootage,
  deleteFootage,
  upsertFootage,
  updateFootagesOrder,
  uploadPortfolioMedia,
  loginAdmin, 
  logoutAdmin, 
  getCurrentAdmin,
  getAdminSessionRemainingMs,
  isValidUUID
} from '../lib/supabase';
import SwissLogo from '../components/ui/SwissLogo';
import { getLocalProject } from '../hooks/useProjects';
import { FEATURED_PROJECTS, MOTION_FOOTAGES } from '../data/portfolioData';

function sanitizeSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/#/g, '-')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionRemainingSec, setSessionRemainingSec] = useState(0);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Dashboard tab: 'projects' | 'footages'
  const [adminTab, setAdminTab] = useState('projects');

  // Footages state
  const [footages, setFootages] = useState([]);
  const [footagesLoading, setFootagesLoading] = useState(false);
  const [activeFootageModal, setActiveFootageModal] = useState(false);
  const [editingFootage, setEditingFootage] = useState(null);
  const [footageFormData, setFootageFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    category: 'Aftermovie & Motion Direction',
    year: '2026',
    tag: 'AFTERMOVIE',
    aspect: '16/9',
    has_audio: true,
    description: '',
    video_url: '',
    thumbnail_url: '',
    published: true,
  });
  const [uploadingFootageMedia, setUploadingFootageMedia] = useState(false);
  const modalVideoRef = useRef(null);
  const [videoScrubTime, setVideoScrubTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [capturingThumbnail, setCapturingThumbnail] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    category: '',
    role: '',
    year: '2026',
    featured: false,
    published: true,
    thumbnail_url: '',
    hero_image_url: '',
    video_url: '',
    summary: '',
    tags: '',
    metrics: [{ label: '', value: '' }],
    challenge: '',
    solution: '',
    process: '',
    results: '',
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Check auth session on mount
  useEffect(() => {
    async function checkAuth() {
      if (!isSupabaseConfigured || !supabase) {
        setAuthLoading(false);
        return;
      }
      try {
        const user = await getCurrentAdmin();
        setAdminUser(user);
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  const mergeProjectsWithFallback = useCallback((dbProjects) => {
    if (!dbProjects || !Array.isArray(dbProjects)) return [];
    const existingSlugs = new Set(dbProjects.map((p) => (p.slug || '').toLowerCase()));
    const missingLocals = FEATURED_PROJECTS.filter(
      (fp) => !existingSlugs.has(fp.id.toLowerCase()) && 
              !existingSlugs.has((fp.slug || '').toLowerCase()) &&
              !(fp.id === 'cadence-audio' && existingSlugs.has('cadence')) &&
              !(fp.id === 'sed-8' && (existingSlugs.has('lumen-os') || existingSlugs.has('sed#8'))) &&
              !(fp.id === 'Skyrace' && (existingSlugs.has('quiet-mornings') || existingSlugs.has('merbabu-skyrace')))
    ).map((fp, i) => ({
      ...fp,
      slug: fp.slug || fp.id,
      display_order: dbProjects.length + i + 1,
      published: true,
      thumbnail_url: typeof fp.thumbnail === 'string' ? fp.thumbnail : '',
      isLocalDraft: true,
    }));
    return [...dbProjects, ...missingLocals];
  }, []);

  // Fetch admin projects when authenticated
  const loadProjects = useCallback(async () => {
    if (!adminUser) return;
    try {
      setProjectsLoading(true);
      const data = await fetchAdminProjects();
      setProjects(mergeProjectsWithFallback(data));
    } catch (err) {
      console.error('Failed to load admin projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  }, [adminUser, mergeProjectsWithFallback]);

  // Fetch admin footages when authenticated
  const loadFootages = useCallback(async () => {
    if (!adminUser) return;
    try {
      setFootagesLoading(true);
      const data = await fetchAdminFootages();
      if (data && Array.isArray(data) && data.length > 0) {
        setFootages(data);
      } else {
        // Fallback / initial seed from local archive
        setFootages(MOTION_FOOTAGES.map((m, idx) => ({
          ...m,
          display_order: idx + 1,
          published: true,
          video_url: m.video,
          has_audio: m.hasAudio,
        })));
      }
    } catch (err) {
      console.warn('Failed to load admin footages from DB, using local:', err);
      setFootages(MOTION_FOOTAGES.map((m, idx) => ({
        ...m,
        display_order: idx + 1,
        published: true,
        video_url: m.video,
        has_audio: m.hasAudio,
      })));
    } finally {
      setFootagesLoading(false);
    }
  }, [adminUser]);

  useEffect(() => {
    if (!adminUser) return;
    let isMounted = true;

    async function initialLoad() {
      try {
        const [projectsData, footagesData] = await Promise.all([
          fetchAdminProjects().catch((err) => {
            console.error('Failed to load admin projects:', err);
            return [];
          }),
          fetchAdminFootages().catch((err) => {
            console.warn('Failed to load admin footages from DB, using local:', err);
            return null;
          }),
        ]);

        if (!isMounted) return;

        if (projectsData) {
          setProjects(mergeProjectsWithFallback(projectsData));
        }

        if (footagesData && Array.isArray(footagesData) && footagesData.length > 0) {
          setFootages(footagesData);
        } else {
          setFootages(MOTION_FOOTAGES.map((m, idx) => ({
            ...m,
            display_order: idx + 1,
            published: true,
            video_url: m.video,
            has_audio: m.hasAudio,
          })));
        }
      } finally {
        if (isMounted) {
          setProjectsLoading(false);
          setFootagesLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, [adminUser, mergeProjectsWithFallback]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  // Handle Session Expiry (15-Minute Timeout)
  const handleSessionExpiry = useCallback(async () => {
    try {
      await logoutAdmin();
    } catch {
      // ignore
    }
    setAdminUser(null);
    setActiveModal(false);
    setSessionRemainingSec(0);
    setLoginError('Sesi login telah berakhir (15 menit). Silakan login kembali demi keamanan.');
    showToast('Sesi 15 menit telah habis. Silakan login kembali.');
  }, [showToast]);

  // Live 15-Minute Countdown Timer
  useEffect(() => {
    if (!adminUser) return;

    const checkTimer = () => {
      const ms = getAdminSessionRemainingMs();
      const sec = Math.ceil(ms / 1000);
      setSessionRemainingSec(sec);

      if (ms <= 0) {
        handleSessionExpiry();
      }
    };

    const timeout = setTimeout(checkTimer, 0);
    const interval = setInterval(checkTimer, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [adminUser, handleSessionExpiry]);

  const formatSessionTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    try {
      const data = await loginAdmin(loginEmail, loginPassword);
      setAdminUser(data.user);
      showToast('Authenticated successfully.');
    } catch (err) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setAdminUser(null);
      showToast('Logged out.');
    } catch (err) {
      console.error(err);
    }
  };

  // Open Create/Edit Modal
  const openModal = (proj = null) => {
    if (proj) {
      setEditingProject(proj);
      const local = getLocalProject(proj.slug || proj.id);
      const initialMetrics = (Array.isArray(proj.metrics) && proj.metrics.length > 0)
        ? proj.metrics
        : (local?.metrics && local.metrics.length > 0
            ? local.metrics
            : [{ label: '', value: '' }]);

      setFormData({
        title: proj.title || '',
        slug: proj.slug || '',
        subtitle: proj.subtitle || '',
        category: proj.category || '',
        role: proj.role || '',
        year: proj.year || '2026',
        featured: Boolean(proj.featured),
        published: proj.published !== false,
        thumbnail_url: proj.thumbnail_url || '',
        hero_image_url: proj.hero_image_url || '',
        video_url: proj.video_url || '',
        summary: proj.summary || '',
        tags: Array.isArray(proj.tags) && proj.tags.length > 0 
          ? proj.tags.join(', ') 
          : (local?.tags ? local.tags.join(', ') : ''),
        metrics: initialMetrics,
        challenge: proj.challenge || local?.challenge || '',
        solution: proj.solution || local?.solution || '',
        process: proj.process || local?.process || '',
        results: proj.results || local?.results || '',
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        slug: '',
        subtitle: '',
        category: 'Creative Direction & System Architecture',
        role: 'Creative Director',
        year: '2026',
        featured: false,
        published: true,
        thumbnail_url: '',
        hero_image_url: '',
        video_url: '',
        summary: '',
        tags: '',
        metrics: [{ label: 'Performance Metric', value: 'Key Outcome' }],
        challenge: '',
        solution: '',
        process: '',
        results: '',
      });
    }
    setActiveModal(true);
  };

  // Auto-slugify title
  const handleTitleChange = (e) => {
    const title = e.target.value;
    if (!editingProject) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, title, slug }));
    } else {
      setFormData((prev) => ({ ...prev, title }));
    }
  };

  // Handle Media File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingMedia(true);
      const publicUrl = await uploadPortfolioMedia(file);
      setFormData((prev) => ({
        ...prev,
        thumbnail_url: publicUrl,
        hero_image_url: prev.hero_image_url || publicUrl,
      }));
      showToast('Media uploaded to Supabase Storage!');
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadingMedia(false);
    }
  };

  // Metrics Helpers
  const addMetricRow = () => {
    setFormData((prev) => ({
      ...prev,
      metrics: [...prev.metrics, { label: '', value: '' }],
    }));
  };

  const updateMetric = (idx, field, val) => {
    setFormData((prev) => {
      const updated = [...prev.metrics];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, metrics: updated };
    });
  };

  const removeMetric = (idx) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== idx),
    }));
  };

  // Save Project
  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.thumbnail_url) {
      alert('Please provide Title, Slug, and Thumbnail URL.');
      return;
    }

    const payload = {
      title: formData.title,
      slug: sanitizeSlug(formData.slug),
      subtitle: formData.subtitle,
      category: formData.category,
      role: formData.role,
      year: formData.year,
      featured: formData.featured,
      published: formData.published,
      thumbnail_url: formData.thumbnail_url,
      hero_image_url: formData.hero_image_url || formData.thumbnail_url,
      video_url: formData.video_url || null,
      summary: formData.summary,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      metrics: formData.metrics.filter((m) => m.label && m.value),
      challenge: formData.challenge,
      solution: formData.solution,
      process: formData.process,
      results: formData.results,
    };

    try {
      setIsSubmitting(true);
      if (editingProject && isValidUUID(editingProject.id)) {
        await updateProject(editingProject.id, payload);
        showToast('Commission updated successfully.');
      } else {
        await upsertProject(payload);
        showToast('Commission saved to database!');
      }
      setActiveModal(false);
      loadProjects();
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Project
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete commission "${title}"?`)) return;

    try {
      if (isValidUUID(id)) {
        await deleteProject(id);
      } else if (typeof id === 'string') {
        await deleteProject(id).catch(() => {});
      }
      showToast('Commission deleted.');
      loadProjects();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // Quick Toggle Published
  const handleTogglePublish = async (proj) => {
    try {
      const targetId = isValidUUID(proj.id) ? proj.id : (proj.slug || proj.id);
      await updateProject(targetId, { published: !proj.published });
      showToast(proj.published ? 'Set to draft.' : 'Published live.');
      loadProjects();
    } catch (err) {
      alert(`Update error: ${err.message}`);
    }
  };

  // ─── Footage Reorder and Management Handlers ───
  const handleMoveFootage = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= footages.length) return;

    const reordered = [...footages];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    // Instant optimistic update (zero lag for user!)
    setFootages(reordered);
    showToast(`Posisi disetel: #${index + 1} ditukar ke #${targetIndex + 1}.`);

    // Async update to Supabase
    try {
      await updateFootagesOrder(reordered);
    } catch (err) {
      console.warn('Gagal menyimpan urutan ke Supabase:', err);
    }
  };

  const openFootageModal = (item = null) => {
    setVideoScrubTime(0);
    setVideoDuration(0);
    if (item) {
      setEditingFootage(item);
      setFootageFormData({
        title: item.title || '',
        slug: item.slug || sanitizeSlug(item.title),
        subtitle: item.subtitle || '',
        category: item.category || 'Aftermovie & Motion Direction',
        year: item.year || '2026',
        tag: item.tag || 'AFTERMOVIE',
        aspect: item.aspect || '16/9',
        has_audio: item.has_audio ?? item.hasAudio ?? true,
        description: item.description || '',
        video_url: item.video_url || item.video || '',
        thumbnail_url: item.thumbnail_url || item.thumbnail || '',
        published: item.published !== false,
      });
    } else {
      setEditingFootage(null);
      setFootageFormData({
        title: '',
        slug: '',
        subtitle: '',
        category: 'Aftermovie & Motion Direction',
        year: '2026',
        tag: 'AFTERMOVIE',
        aspect: '16/9',
        has_audio: true,
        description: '',
        video_url: '',
        thumbnail_url: '',
        published: true,
      });
    }
    setActiveFootageModal(true);
  };

  const handleSeekVideo = (newTime) => {
    const clamped = Math.max(0, Math.min(newTime, videoDuration || 600));
    setVideoScrubTime(clamped);
    if (modalVideoRef.current) {
      modalVideoRef.current.currentTime = clamped;
    }
  };

  const handleCaptureFrame = async () => {
    const video = modalVideoRef.current;
    if (!video) {
      alert('Video belum dimuat.');
      return;
    }

    try {
      setCapturingThumbnail(true);
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Gagal mengambil frame dari video.');
          setCapturingThumbnail(false);
          return;
        }

        try {
          const file = new File([blob], `thumb-frame-${Date.now()}.webp`, { type: 'image/webp' });
          const publicUrl = await uploadPortfolioMedia(file);
          setFootageFormData((prev) => ({ ...prev, thumbnail_url: publicUrl }));
          showToast(`Frame pada detik ${video.currentTime.toFixed(1)}s berhasil dijadikan thumbnail!`);
        } catch (uploadErr) {
          console.warn('Upload frame ke storage gagal, menggunakan data URL:', uploadErr);
          const dataUrl = canvas.toDataURL('image/webp', 0.85);
          setFootageFormData((prev) => ({ ...prev, thumbnail_url: dataUrl }));
          showToast(`Frame pada detik ${video.currentTime.toFixed(1)}s disetel sebagai thumbnail.`);
        } finally {
          setCapturingThumbnail(false);
        }
      }, 'image/webp', 0.85);
    } catch (err) {
      alert(`Gagal mengambil frame: ${err.message}`);
      setCapturingThumbnail(false);
    }
  };

  const handleSaveFootage = async (e) => {
    e.preventDefault();
    if (!footageFormData.title) {
      alert('Judul video wajib diisi.');
      return;
    }
    if (!footageFormData.video_url) {
      alert('Harap upload file video (.mp4) atau cantumkan URL video.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: footageFormData.title.trim(),
        slug: sanitizeSlug(footageFormData.slug || footageFormData.title),
        subtitle: footageFormData.subtitle.trim(),
        category: footageFormData.category.trim(),
        year: footageFormData.year.trim() || '2026',
        tag: footageFormData.tag.trim().toUpperCase() || 'REEL',
        aspect: footageFormData.aspect || '16/9',
        has_audio: Boolean(footageFormData.has_audio),
        description: footageFormData.description.trim(),
        video_url: footageFormData.video_url.trim(),
        thumbnail_url: footageFormData.thumbnail_url ? footageFormData.thumbnail_url.trim() : null,
        published: Boolean(footageFormData.published),
      };

      if (editingFootage && isValidUUID(editingFootage.id)) {
        await updateFootage(editingFootage.id, payload);
        showToast('Footage video berhasil diperbarui.');
      } else {
        // Fallback item atau item baru: simpan/upsert berdasarkan slug
        payload.display_order = editingFootage?.display_order || footages.length + 1;
        await upsertFootage(payload);
        showToast('Footage video berhasil disimpan ke database.');
      }

      setActiveFootageModal(false);
      loadFootages();
    } catch (err) {
      if (err.message && (err.message.includes('showcase_videos') || err.message.includes('schema cache'))) {
        alert('Tabel "public.showcase_videos" belum dibuat di database Supabase Anda.\n\nSolusi: Buka Supabase Dashboard > SQL Editor, lalu jalankan script SQL untuk membuat tabel showcase_videos (lihat panduan/file supabase_setup.sql).');
      } else {
        alert(`Error menyimpan video: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFootage = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus video "${title}"?`)) return;
    try {
      if (isValidUUID(id)) {
        await deleteFootage(id);
      } else if (typeof id === 'string') {
        await deleteFootage(id).catch(() => {});
      }
      setFootages((prev) => prev.filter((f) => f.id !== id && f.slug !== id));
      showToast('Footage dihapus dari koleksi.');
    } catch (err) {
      alert(`Error menghapus video: ${err.message}`);
    }
  };

  const handleToggleFootagePublish = async (item) => {
    try {
      const nextPublished = !item.published;
      const targetKey = isValidUUID(item.id) ? item.id : (item.slug || item.id);
      await updateFootage(targetKey, { published: nextPublished }).catch((err) => {
        console.warn('Draft toggle local sync:', err);
      });
      setFootages((prev) => prev.map((f) => (f.id === item.id ? { ...f, published: nextPublished } : f)));
      showToast(nextPublished ? 'Footage LIVE di galeri.' : 'Footage diubah ke DRAFT.');
    } catch (err) {
      alert(`Update error: ${err.message}`);
    }
  };

  const handleFootageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFootageMedia(true);
      const publicUrl = await uploadPortfolioMedia(file);
      setFootageFormData((prev) => ({ ...prev, video_url: publicUrl }));
      showToast('Video terunggah ke Supabase Storage.');
    } catch (err) {
      alert(`Gagal mengunggah video: ${err.message}`);
    } finally {
      setUploadingFootageMedia(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fbfbfa] flex items-center justify-center font-mono text-xs uppercase tracking-wider text-[#0A0A0A]">
        <span>INITIALIZING STUDIO ACCESS...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#0A0A0A] font-sans pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#0A0A0A] text-white rounded-lg shadow-xl font-mono text-xs font-bold uppercase tracking-wider animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Top Studio Bar */}
      <nav className="w-full border-b border-[rgba(10,10,10,0.12)] bg-white/90 backdrop-blur-md px-6 sm:px-10 py-3.5 flex items-center justify-between font-mono text-xs uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <Link to="/" className="outline-none">
            <SwissLogo size="sm" />
          </Link>
          <span className="text-[#8b8b8b]">//</span>
          <span className="font-bold text-[#0A0A0A]">STUDIO ADMIN PORTAL</span>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="hidden sm:inline hover:text-[#e0492a] transition-colors"
          >
            &larr; LIVE SITE
          </Link>

          {adminUser && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 15-Minute Session Indicator */}
              <div 
                title="Sesi admin otomatis berakhir dalam 15 menit untuk keamanan"
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded border font-mono text-[10px] sm:text-[11px] font-bold tracking-wider transition-colors ${
                  sessionRemainingSec <= 180
                    ? 'bg-[#fff1f0] border-[#ff4d4f] text-[#cf1322]'
                    : 'bg-[#f4f5f8] border-[rgba(10,10,10,0.12)] text-[#0A0A0A]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${sessionRemainingSec <= 180 ? 'bg-[#ff4d4f] animate-ping' : 'bg-[#52c41a]'}`} />
                <span className="hidden sm:inline">SESSION:</span>
                <span>{formatSessionTime(sessionRemainingSec)}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 bg-[#f4f5f8] hover:bg-[#e8ebf0] border border-[rgba(10,10,10,0.15)] rounded font-bold transition-all text-[#0A0A0A]"
              >
                LOGOUT
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ─── Unauthenticated / Login View ─── */}
      {!adminUser ? (
        <main className="max-w-md mx-auto px-6 pt-20">
          <div className="bg-white border-2 border-[#0A0A0A] rounded-2xl p-8 sm:p-10 shadow-lg">
            <div className="flex items-center gap-2 text-[#e0492a] font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <span>[AUTHENTICATION REQUIRED]</span>
            </div>

            <h1 className="text-2xl font-bold uppercase text-[#0A0A0A] tracking-tight mb-2">
              Director&apos;s Studio
            </h1>

            <p className="text-xs text-[#5a6275] leading-relaxed mb-4">
              Enter your Supabase admin credentials to manage live portfolio commissions, upload media, and orchestrate case studies.
            </p>

            <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-[#f4f5f8] border border-[rgba(10,10,10,0.08)] rounded text-[11px] font-mono text-[#5a6275]">
              <span className="text-[#e0492a] font-bold">ℹ</span>
              <span>Security Policy: Sesi admin dibatasi maksimal 15 menit per login.</span>
            </div>

            {!isSupabaseConfigured && (
              <div className="p-4 mb-6 bg-[#fff7ed] border border-[#ffedd5] rounded-lg text-[11px] font-mono text-[#9a3412]">
                <strong className="block mb-1 font-bold">SETUP REQUIRED:</strong>
                Supabase credentials not detected in <code>.env.local</code>. Please follow the instructions in <code>supabase_setup.sql</code> to link your database.
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block uppercase text-[10px] font-bold text-[#6a7285] mb-1">
                  ADMIN EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[rgba(10,10,10,0.15)] focus:border-[#0A0A0A] outline-none rounded font-sans text-sm"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold text-[#6a7285] mb-1">
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[rgba(10,10,10,0.15)] focus:border-[#0A0A0A] outline-none rounded font-sans text-sm"
                />
              </div>

              {loginError && (
                <p className="text-xs text-[#e0492a] font-mono font-bold">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !isSupabaseConfigured}
                style={{ color: '#ffffff' }}
                className="w-full py-3 bg-[#0A0A0A] !text-white hover:bg-[#e0492a] disabled:bg-[#8b8b8b] rounded font-bold uppercase tracking-wider transition-all mt-4"
              >
                {isSubmitting ? 'VERIFYING...' : 'ENTER STUDIO →'}
              </button>
            </form>
          </div>
        </main>
      ) : (
        /* ─── Authenticated Dashboard View ─── */
        <main className="max-w-[1440px] mx-auto px-6 sm:px-10 pt-10">
          
          {/* Studio Tab Switcher */}
          <div className="flex flex-wrap items-center gap-3 border-b-2 border-[#0A0A0A] pb-4 mb-8 font-mono text-xs uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setAdminTab('projects')}
              className={`px-4 py-2.5 rounded-lg font-bold transition-all ${
                adminTab === 'projects'
                  ? 'bg-[#0A0A0A] !text-white shadow-sm'
                  : 'bg-white border border-[rgba(10,10,10,0.15)] text-[#434b5c] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
              }`}
            >
              [01 // COMMISSIONS &amp; CASE STUDIES ({projects.length})]
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('footages')}
              className={`px-4 py-2.5 rounded-lg font-bold transition-all ${
                adminTab === 'footages'
                  ? 'bg-[#0A0A0A] !text-white shadow-sm'
                  : 'bg-white border border-[rgba(10,10,10,0.15)] text-[#434b5c] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
              }`}
            >
              [02 // MOTION &amp; FOOTAGE ARCHIVE ({footages.length})]
            </button>
          </div>

          {/* ─── TAB 1: COMMISSIONS & CASE STUDIES ─── */}
          {adminTab === 'projects' && (
            <>
              {/* Action Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(10,10,10,0.1)] pb-5 mb-8">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#e0492a] font-bold block mb-1">
                    [PORTFOLIO DATABASE CONTROL]
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold uppercase text-[#0A0A0A] tracking-tight">
                    Curated Commissions ({projects.length})
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => openModal()}
                  style={{ color: '#ffffff' }}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#0A0A0A] !text-white hover:bg-[#e0492a] rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                >
                  <span>+ NEW COMMISSION</span>
                </button>
              </div>

              {/* Project Cards List */}
              {projectsLoading ? (
                <div className="py-20 text-center font-mono text-xs uppercase text-[#8b8b8b]">
                  LOADING COMMISSIONS FROM DATABASE...
                </div>
              ) : projects.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[rgba(10,10,10,0.2)] rounded-2xl p-12 text-center">
                  <p className="font-mono text-sm uppercase text-[#434b5c] mb-4">
                    NO COMMISSIONS FOUND IN DATABASE.
                  </p>
                  <button
                    type="button"
                    onClick={() => openModal()}
                    style={{ color: '#ffffff' }}
                    className="px-6 py-2.5 bg-[#0A0A0A] !text-white hover:bg-[#e0492a] rounded font-mono text-xs font-bold uppercase"
                  >
                    CREATE YOUR FIRST COMMISSION
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((proj) => (
                    <article
                      key={proj.id}
                      className="bg-white border-2 border-[rgba(10,10,10,0.12)] rounded-2xl p-5 shadow-sm hover:border-[#0A0A0A] transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Media Thumbnail */}
                        <div className="relative w-full aspect-[16/10] bg-[#111318] rounded-lg overflow-hidden border border-[rgba(10,10,10,0.1)] mb-4">
                          <img
                            src={proj.thumbnail_url}
                            alt={proj.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white/95 rounded font-mono text-[9px] font-bold text-[#0A0A0A] uppercase">
                            {proj.year}
                          </div>

                          <div className="absolute top-2.5 right-2.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(proj)}
                              className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase transition-colors ${
                                proj.published
                                  ? 'bg-[#d8ff00] text-[#0A0A0A]'
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              {proj.published ? 'LIVE' : 'DRAFT'}
                            </button>
                          </div>
                        </div>

                        <div className="font-mono text-[10px] text-[#e0492a] font-bold uppercase mb-1">
                          {proj.category}
                        </div>

                        <h2 className="text-xl font-bold uppercase text-[#0A0A0A] mb-1">
                          {proj.title}
                        </h2>

                        <p className="text-xs text-[#555d70] line-clamp-2 mb-3">
                          {proj.subtitle || proj.summary}
                        </p>

                        {/* Metrics preview */}
                        {Array.isArray(proj.metrics) && proj.metrics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {proj.metrics.map((m, mIdx) => (
                              <span key={mIdx} className="px-2 py-0.5 bg-[#f0f2f5] border border-[rgba(10,10,10,0.08)] rounded font-mono text-[9px] text-[#242938]">
                                <strong>{m.value}</strong> &bull; {m.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-[rgba(10,10,10,0.08)] flex items-center justify-between font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => openModal(proj)}
                          className="px-3 py-1.5 bg-[#f4f5f8] hover:bg-[#0A0A0A] hover:text-white rounded font-bold uppercase transition-all"
                        >
                          EDIT
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(proj.id, proj.title)}
                          className="text-[#e0492a] hover:underline font-bold uppercase text-[11px]"
                        >
                          DELETE
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── TAB 2: MOTION & FOOTAGE ARCHIVE ─── */}
          {adminTab === 'footages' && (
            <>
              {/* Action Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(10,10,10,0.1)] pb-5 mb-6">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#e0492a] font-bold block mb-1">
                    [MOTION VAULT &amp; SHOWCASE CONTROL]
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold uppercase text-[#0A0A0A] tracking-tight">
                    Directed Footage Vault ({footages.length})
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/showcase"
                    target="_blank"
                    className="px-4 py-3 bg-white border border-[rgba(10,10,10,0.15)] hover:border-[#0A0A0A] rounded-lg font-mono text-xs font-bold uppercase tracking-wider text-[#0A0A0A] transition-all"
                  >
                    PREVIEW GALLERY &nearr;
                  </Link>

                  <button
                    type="button"
                    onClick={() => openFootageModal()}
                    style={{ color: '#ffffff' }}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#0A0A0A] !text-white hover:bg-[#e0492a] rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                  >
                    <span>+ NEW VIDEO FOOTAGE</span>
                  </button>
                </div>
              </div>

              {/* Reorder Instructional Guide Banner */}
              <div className="p-4 sm:p-5 bg-[#f6f7f9] border border-[rgba(10,10,10,0.12)] rounded-xl font-mono text-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-[#e0492a] text-lg font-bold">ℹ</span>
                  <div className="leading-relaxed">
                    <span className="font-bold text-[#0A0A0A]">PENGATURAN TATA LETAK:</span>
                    <span className="text-[#555d70] ml-1.5">
                      Gunakan tombol panah <strong>[▲ NAIK]</strong> dan <strong>[▼ TURUN]</strong> untuk menyetel urutan video. Posisi <strong>#01 &ndash; #03</strong> tampil normal di HomePage, <strong>#04</strong> menjadi kartu bertumpuk menuju galeri, dan seluruh koleksi tampil di <code>/showcase</code>.
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-white border rounded text-[10px] uppercase font-bold text-[#0A0A0A] whitespace-nowrap">
                  AUTO-SAVED
                </span>
              </div>

              {/* Footage Cards List */}
              {footagesLoading ? (
                <div className="py-20 text-center font-mono text-xs uppercase text-[#8b8b8b]">
                  LOADING FOOTAGE VAULT...
                </div>
              ) : footages.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[rgba(10,10,10,0.2)] rounded-2xl p-12 text-center">
                  <p className="font-mono text-sm uppercase text-[#434b5c] mb-4">
                    BELUM ADA FOOTAGE DI DATABASE.
                  </p>
                  <button
                    type="button"
                    onClick={() => openFootageModal()}
                    style={{ color: '#ffffff' }}
                    className="px-6 py-2.5 bg-[#0A0A0A] !text-white hover:bg-[#e0492a] rounded font-mono text-xs font-bold uppercase"
                  >
                    TAMBAH FOOTAGE PERTAMA
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {footages.map((item, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === footages.length - 1;
                    const isFeaturedOnHome = idx < 4;

                    return (
                      <article
                        key={item.id || idx}
                        className="bg-white border-2 border-[rgba(10,10,10,0.12)] rounded-2xl p-5 shadow-sm hover:border-[#0A0A0A] transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Top Rank Badge & Reorder Arrows */}
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(10,10,10,0.08)] font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-[#0A0A0A] text-white rounded font-bold text-[11px]">
                                #{String(idx + 1).padStart(2, '0')}
                              </span>
                              {isFeaturedOnHome && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  idx === 3 
                                    ? 'bg-[#e0492a] text-white' 
                                    : 'bg-[#f0f2f5] text-[#242938]'
                                }`}>
                                  {idx === 3 ? 'HOME: STACK DECK' : 'HOME: SLOT ' + (idx + 1)}
                                </span>
                              )}
                            </div>

                            {/* Easy Reorder Buttons */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => handleMoveFootage(idx, -1)}
                                title="Pindahkan posisi ke atas"
                                className="px-2 py-1 bg-[#f4f5f8] hover:bg-[#0A0A0A] hover:text-white disabled:opacity-30 disabled:hover:bg-[#f4f5f8] disabled:hover:text-inherit rounded font-bold transition-all text-[11px]"
                              >
                                ▲ NAIK
                              </button>

                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() => handleMoveFootage(idx, 1)}
                                title="Pindahkan posisi ke bawah"
                                className="px-2 py-1 bg-[#f4f5f8] hover:bg-[#0A0A0A] hover:text-white disabled:opacity-30 disabled:hover:bg-[#f4f5f8] disabled:hover:text-inherit rounded font-bold transition-all text-[11px]"
                              >
                                ▼ TURUN
                              </button>
                            </div>
                          </div>

                          {/* Video Thumbnail Frame */}
                          <div className="relative w-full aspect-[16/10] bg-[#111318] rounded-lg overflow-hidden border border-[rgba(10,10,10,0.1)] mb-4">
                            <video
                              src={item.video_url || item.video}
                              poster={item.thumbnail_url || item.thumbnail}
                              muted
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover"
                            />

                            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white/95 rounded font-mono text-[9px] font-bold text-[#0A0A0A] uppercase">
                              {item.year || '2026'} &bull; {item.tag || 'REEL'}
                            </div>

                            <div className="absolute top-2.5 right-2.5">
                              <button
                                type="button"
                                onClick={() => handleToggleFootagePublish(item)}
                                className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase transition-colors ${
                                  item.published
                                    ? 'bg-[#d8ff00] text-[#0A0A0A]'
                                    : 'bg-red-500 text-white'
                                }`}
                              >
                                {item.published ? 'LIVE' : 'DRAFT'}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[10px] text-[#e0492a] font-bold uppercase mb-1">
                            <span>{item.category}</span>
                            <span className="text-[#8b8b8b]">&bull;</span>
                            <span className="text-[#555d70]">{item.has_audio ? 'SOUND' : 'MUTED'}</span>
                          </div>

                          <h2 className="text-xl font-bold uppercase text-[#0A0A0A] mb-1">
                            {item.title}
                          </h2>

                          <p className="text-xs text-[#555d70] line-clamp-2 mb-3">
                            {item.subtitle || item.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-[rgba(10,10,10,0.08)] flex items-center justify-between font-mono text-xs">
                          <button
                            type="button"
                            onClick={() => openFootageModal(item)}
                            className="px-3 py-1.5 bg-[#f4f5f8] hover:bg-[#0A0A0A] hover:text-white rounded font-bold uppercase transition-all"
                          >
                            EDIT
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteFootage(item.id, item.title)}
                            className="text-[#e0492a] hover:underline font-bold uppercase text-[11px]"
                          >
                            HAPUS
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </main>
      )}

      {/* ─── Commission Editor Modal ─── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border-2 border-[#0A0A0A] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative my-auto">
            
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h2 className="text-xl font-bold uppercase text-[#0A0A0A]">
                {editingProject ? 'Edit Commission' : 'New Commission'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(false)}
                className="font-mono text-xs font-bold text-[#8b8b8b] hover:text-[#0A0A0A] p-1"
              >
                [CLOSE &times;]
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-6 font-mono text-xs">
              
              {/* Media File Upload Area */}
              <div className="p-5 bg-[#f6f7f9] border-2 border-dashed border-[rgba(10,10,10,0.2)] rounded-xl text-center">
                <span className="block font-bold uppercase text-[11px] mb-2 text-[#0A0A0A]">
                  UPLOAD COVER PHOTO / MEDIA
                </span>
                
                {formData.thumbnail_url ? (
                  <div className="relative w-48 aspect-[16/10] mx-auto rounded overflow-hidden border border-[#0A0A0A] mb-3">
                    <img
                      src={formData.thumbnail_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}

                <input
                  type="file"
                  accept="image/*,video/mp4"
                  onChange={handleFileUpload}
                  disabled={uploadingMedia}
                  className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-mono file:font-bold file:bg-[#0A0A0A] file:text-white hover:file:bg-[#e0492a]"
                />
                
                {uploadingMedia && (
                  <p className="text-[11px] text-[#e0492a] font-bold mt-2">
                    UPLOADING TO SUPABASE STORAGE...
                  </p>
                )}

                <div className="mt-3">
                  <input
                    type="url"
                    placeholder="Or paste external image URL directly..."
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[rgba(10,10,10,0.15)] rounded text-xs font-sans"
                  />
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    COMMISSION TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Lumen OS"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    SLUG (URL PATH) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ 
                      ...prev, 
                      slug: e.target.value.toLowerCase().replace(/#/g, '-').replace(/\s+/g, '-') 
                    }))}
                    placeholder="e.g. sed-8"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm font-mono"
                  />
                  <p className="text-[10px] text-[#8b8b8b] mt-1 font-mono">
                    Huruf kecil &amp; tanda hubung (-). Contoh: sed-8 (jangan gunakan # atau spasi).
                  </p>
                </div>
              </div>

              {/* Subtitle & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    SUBTITLE
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. Spatial Design System for Creative Leads"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    DIRECTORIAL ROLE
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Creative Director & Product Architect"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>
              </div>

              {/* Category & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    CATEGORY
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. Creative Direction & System Architecture"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    YEAR
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                  BRIEF SUMMARY
                </label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Concise 1-2 sentence overview of the commission..."
                  className="w-full px-3.5 py-2 bg-[#f8f9fa] border rounded font-sans text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                  TAGS (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="Creative Direction, Brutalism, React, Motion"
                  className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm"
                />
              </div>

              {/* Metrics Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#6a7285] uppercase block">
                      PERFORMANCE METRICS
                    </label>
                    <span className="text-[10px] text-[#8b8b8b]">
                      Value = teks besar (hasil/pencapaian), Label = keterangan di bawahnya.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addMetricRow}
                    className="text-[#e0492a] font-bold text-[10px] hover:underline"
                  >
                    + ADD METRIC
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.metrics.map((m, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="w-1/2">
                        <input
                          type="text"
                          placeholder="Value (e.g. End-to-End Campaign Strategy)"
                          value={m.value}
                          onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                          className="w-full px-3 py-2 bg-[#f8f9fa] border rounded text-xs font-sans font-semibold text-[#0A0A0A]"
                        />
                      </div>
                      <div className="w-1/2">
                        <input
                          type="text"
                          placeholder="Label (e.g. Integrated Visual System)"
                          value={m.label}
                          onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                          className="w-full px-3 py-2 bg-[#f8f9fa] border rounded text-xs font-sans text-[#555d70]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMetric(idx)}
                        className="text-[#8b8b8b] hover:text-[#e0492a] px-2 font-bold"
                        title="Remove metric"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Narrative Panels */}
              <div className="space-y-4 pt-4 border-t">
                <span className="block font-bold uppercase text-[11px] text-[#0A0A0A]">
                  CASE STUDY NARRATIVE
                </span>

                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    01 // THE CHALLENGE
                  </label>
                  <textarea
                    rows={3}
                    value={formData.challenge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, challenge: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    02 // THE ARCHITECTURAL SOLUTION
                  </label>
                  <textarea
                    rows={3}
                    value={formData.solution}
                    onChange={(e) => setFormData((prev) => ({ ...prev, solution: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    03 // EXECUTION &amp; PROCESS
                  </label>
                  <textarea
                    rows={3}
                    value={formData.process}
                    onChange={(e) => setFormData((prev) => ({ ...prev, process: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    04 // RESULTS &amp; OUTCOME
                  </label>
                  <textarea
                    rows={3}
                    value={formData.results}
                    onChange={(e) => setFormData((prev) => ({ ...prev, results: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                    className="w-4 h-4 accent-[#0A0A0A]"
                  />
                  <span className="font-bold uppercase text-[11px]">PUBLISHED (VISIBLE ON SITE)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 accent-[#0A0A0A]"
                  />
                  <span className="font-bold uppercase text-[11px]">FEATURED FLAGSHIP</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setActiveModal(false)}
                  className="px-5 py-2.5 border border-[rgba(10,10,10,0.2)] rounded font-bold uppercase"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ color: '#ffffff' }}
                  className="px-6 py-2.5 bg-[#0A0A0A] !text-white hover:bg-[#e0492a] rounded font-bold uppercase tracking-wider transition-all"
                >
                  {isSubmitting ? 'SAVING...' : 'SAVE COMMISSION →'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── Footage Video Editor Modal ─── */}
      {activeFootageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border-2 border-[#0A0A0A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative my-auto">
            
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div>
                <span className="font-mono text-[10px] text-[#e0492a] font-bold uppercase tracking-wider block">
                  [ARCHIVE MANAGER]
                </span>
                <h2 className="text-xl font-bold uppercase text-[#0A0A0A]">
                  {editingFootage ? 'Edit Footage Reel' : 'Tambah Footage Baru'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveFootageModal(false)}
                className="font-mono text-xs font-bold text-[#8b8b8b] hover:text-[#0A0A0A] p-1"
              >
                [CLOSE &times;]
              </button>
            </div>

            <form onSubmit={handleSaveFootage} className="space-y-5 font-mono text-xs">
              
              {/* Video File Upload / URL Area */}
              <div className="p-5 bg-[#f6f7f9] border-2 border-dashed border-[rgba(10,10,10,0.2)] rounded-xl text-center">
                <span className="block font-bold uppercase text-[11px] mb-2 text-[#0A0A0A]">
                  UPLOAD VIDEO FILE (.MP4 / .WEBM)
                </span>
                
                {footageFormData.video_url ? (
                  <div className="mb-4">
                    <div className="relative w-full aspect-[16/9] max-w-md mx-auto rounded-lg overflow-hidden border border-[#0A0A0A] bg-black">
                      <video
                        ref={modalVideoRef}
                        src={footageFormData.video_url}
                        controls
                        playsInline
                        preload="auto"
                        crossOrigin="anonymous"
                        onLoadedMetadata={(e) => setVideoDuration(e.target.duration || 0)}
                        onTimeUpdate={(e) => setVideoScrubTime(e.target.currentTime)}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Frame Scrubber & Thumbnail Studio */}
                    <div className="mt-3 p-3.5 bg-white border border-[rgba(10,10,10,0.14)] rounded-xl text-left max-w-md mx-auto shadow-sm">
                      <div className="flex items-center justify-between mb-2 font-mono text-[10px]">
                        <span className="font-bold text-[#0A0A0A] uppercase flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#e0492a] animate-pulse"></span>
                          <span>DETIK: {videoScrubTime.toFixed(1)}s / {videoDuration.toFixed(1)}s</span>
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSeekVideo(videoScrubTime - 1)}
                            className="px-1.5 py-0.5 bg-[#f0f2f5] hover:bg-[#0A0A0A] hover:text-white rounded font-mono font-bold transition-colors"
                            title="Mundur 1 detik"
                          >
                            -1s
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSeekVideo(videoScrubTime - 0.1)}
                            className="px-1.5 py-0.5 bg-[#f0f2f5] hover:bg-[#0A0A0A] hover:text-white rounded font-mono font-bold transition-colors"
                            title="Mundur 0.1 detik"
                          >
                            -0.1s
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSeekVideo(videoScrubTime + 0.1)}
                            className="px-1.5 py-0.5 bg-[#f0f2f5] hover:bg-[#0A0A0A] hover:text-white rounded font-mono font-bold transition-colors"
                            title="Maju 0.1 detik"
                          >
                            +0.1s
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSeekVideo(videoScrubTime + 1)}
                            className="px-1.5 py-0.5 bg-[#f0f2f5] hover:bg-[#0A0A0A] hover:text-white rounded font-mono font-bold transition-colors"
                            title="Maju 1 detik"
                          >
                            +1s
                          </button>
                        </div>
                      </div>

                      {/* Timeline Slider */}
                      <input
                        type="range"
                        min="0"
                        max={videoDuration || 30}
                        step="0.1"
                        value={videoScrubTime}
                        onChange={(e) => handleSeekVideo(parseFloat(e.target.value))}
                        className="w-full accent-[#0A0A0A] cursor-pointer h-2 bg-[#e4e7ec] rounded-lg"
                      />

                      {/* Capture Frame Button */}
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={handleCaptureFrame}
                          disabled={capturingThumbnail}
                          className="min-h-[36px] px-3.5 py-1.5 bg-[#0A0A0A] hover:bg-[#e0492a] disabled:opacity-50 text-white rounded font-mono text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                        >
                          <span>📸 AMBIL FRAME DETIK {videoScrubTime.toFixed(1)}s</span>
                        </button>
                        {capturingThumbnail && (
                          <span className="text-[10px] text-[#e0492a] font-bold animate-pulse">
                            MEMPROSES THUMBNAIL...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Active Thumbnail Preview */}
                {footageFormData.thumbnail_url ? (
                  <div className="mb-4 p-3 bg-white border-2 border-[#0A0A0A] rounded-xl flex items-center justify-between gap-4 text-left max-w-md mx-auto">
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 aspect-[16/10] bg-[#111318] rounded overflow-hidden border border-[#0A0A0A]">
                        <img
                          src={footageFormData.thumbnail_url}
                          alt="Thumbnail poster preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="block font-mono text-[10px] font-bold text-[#e0492a] uppercase">
                          THUMBNAIL POSTER AKTIF
                        </span>
                        <span className="text-[11px] text-[#555d70] line-clamp-1 max-w-[200px] font-sans">
                          {footageFormData.thumbnail_url.startsWith('data:') ? 'Tangkapan Frame Canvas' : footageFormData.thumbnail_url}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFootageFormData((prev) => ({ ...prev, thumbnail_url: '' }))}
                      className="text-xs text-red-600 hover:underline font-mono font-bold uppercase p-1"
                    >
                      [HAPUS]
                    </button>
                  </div>
                ) : null}

                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFootageFileUpload}
                  disabled={uploadingFootageMedia}
                  className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-mono file:font-bold file:bg-[#0A0A0A] file:text-white hover:file:bg-[#e0492a] cursor-pointer"
                />
                
                {uploadingFootageMedia && (
                  <p className="text-[11px] text-[#e0492a] font-bold mt-2 animate-pulse">
                    MENGUNGGAH VIDEO KE SUPABASE STORAGE...
                  </p>
                )}

                <div className="mt-3">
                  <input
                    type="url"
                    placeholder="Atau tempel URL video (.mp4) langsung..."
                    value={footageFormData.video_url}
                    onChange={(e) => setFootageFormData((prev) => ({ ...prev, video_url: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[rgba(10,10,10,0.15)] rounded text-xs font-sans"
                  />
                </div>

                <div className="mt-2 text-left">
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    URL POSTER THUMBNAIL (OPSIONAL / OTOMATIS TERISI SAAT AMBIL FRAME)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... atau klik Ambil Frame di atas"
                    value={footageFormData.thumbnail_url}
                    onChange={(e) => setFootageFormData((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-white border border-[rgba(10,10,10,0.15)] rounded text-[11px] font-sans"
                  />
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    JUDUL VIDEO *
                  </label>
                  <input
                    type="text"
                    required
                    value={footageFormData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFootageFormData((prev) => ({
                        ...prev,
                        title,
                        slug: prev.slug || sanitizeSlug(title),
                      }));
                    }}
                    placeholder="e.g. Kinetic Brand Pulse"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    SLUG (URL PATH) *
                  </label>
                  <input
                    type="text"
                    required
                    value={footageFormData.slug}
                    onChange={(e) => setFootageFormData((prev) => ({ 
                      ...prev, 
                      slug: sanitizeSlug(e.target.value) 
                    }))}
                    placeholder="e.g. kinetic-brand-pulse"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm font-mono"
                  />
                </div>
              </div>

              {/* Subtitle & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    SUBTITLE
                  </label>
                  <input
                    type="text"
                    value={footageFormData.subtitle}
                    onChange={(e) => setFootageFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. Aftermovie & Sound Design Experiment"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    CATEGORY
                  </label>
                  <input
                    type="text"
                    value={footageFormData.category}
                    onChange={(e) => setFootageFormData((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. Aftermovie & Motion Direction"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>
              </div>

              {/* Year, Tag & Aspect Ratio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    TAHUN
                  </label>
                  <input
                    type="text"
                    value={footageFormData.year}
                    onChange={(e) => setFootageFormData((prev) => ({ ...prev, year: e.target.value }))}
                    placeholder="2026"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    TAG LABEL
                  </label>
                  <input
                    type="text"
                    value={footageFormData.tag}
                    onChange={(e) => setFootageFormData((prev) => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                    placeholder="AFTERMOVIE"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                    ASPECT RATIO
                  </label>
                  <select
                    value={footageFormData.aspect}
                    onChange={(e) => setFootageFormData((prev) => ({ ...prev, aspect: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border rounded font-sans text-sm"
                  >
                    <option value="16/9">16:9 (Widescreen HD)</option>
                    <option value="4/3">4:3 (Classic Academy)</option>
                    <option value="16/10">16:10 (Display)</option>
                    <option value="9/16">9:16 (Vertical Story)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-[#6a7285] uppercase mb-1">
                  DESKRIPSI LENGKAP FOOTAGE
                </label>
                <textarea
                  rows={3}
                  value={footageFormData.description}
                  onChange={(e) => setFootageFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Catatan sutradara, sound design highlights, atau konteks sinematik..."
                  className="w-full px-3.5 py-2 bg-[#f8f9fa] border rounded font-sans text-sm"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={footageFormData.has_audio}
                    onChange={(e) => setFootageFormData((prev) => ({ ...prev, has_audio: e.target.checked }))}
                    className="w-4 h-4 accent-[#0A0A0A]"
                  />
                  <span className="font-bold uppercase text-[11px]">TREK SUARA AKTIF (HAS AUDIO)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={footageFormData.published}
                    onChange={(e) => setFootageFormData((prev) => ({ ...prev, published: e.target.checked }))}
                    className="w-4 h-4 accent-[#0A0A0A]"
                  />
                  <span className="font-bold uppercase text-[11px]">PUBLISHED (TAMPIL DI SITUS &amp; GALERI)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setActiveFootageModal(false)}
                  className="px-5 py-2.5 border border-[rgba(10,10,10,0.2)] rounded font-bold uppercase hover:bg-[#f4f5f8] transition-colors"
                >
                  BATAL
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || uploadingFootageMedia}
                  style={{ color: '#ffffff' }}
                  className="px-6 py-2.5 bg-[#0A0A0A] !text-white hover:bg-[#e0492a] disabled:opacity-50 rounded font-bold uppercase tracking-wider transition-all"
                >
                  {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN FOOTAGE →'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
