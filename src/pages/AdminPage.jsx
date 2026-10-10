import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  isSupabaseConfigured, 
  supabase, 
  fetchAdminProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  uploadPortfolioMedia,
  loginAdmin, 
  logoutAdmin, 
  getCurrentAdmin,
  getAdminSessionRemainingMs 
} from '../lib/supabase';
import SwissLogo from '../components/ui/SwissLogo';
import { getLocalProject } from '../hooks/useProjects';

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

  // Fetch admin projects when authenticated
  const loadProjects = useCallback(async () => {
    if (!adminUser) return;
    try {
      setProjectsLoading(true);
      const data = await fetchAdminProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load admin projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  }, [adminUser]);

  useEffect(() => {
    if (!adminUser) return;
    let isMounted = true;

    fetchAdminProjects()
      .then((data) => {
        if (isMounted) setProjects(data);
      })
      .catch((err) => {
        console.error('Failed to load admin projects:', err);
      })
      .finally(() => {
        if (isMounted) setProjectsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [adminUser]);

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
      if (editingProject) {
        await updateProject(editingProject.id, payload);
        showToast('Commission updated successfully.');
      } else {
        await createProject(payload);
        showToast('New commission published to live portfolio!');
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
      await deleteProject(id);
      showToast('Commission deleted.');
      loadProjects();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // Quick Toggle Published
  const handleTogglePublish = async (proj) => {
    try {
      await updateProject(proj.id, { published: !proj.published });
      showToast(proj.published ? 'Set to draft.' : 'Published live.');
      loadProjects();
    } catch (err) {
      alert(`Update error: ${err.message}`);
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
          
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#0A0A0A] pb-5 mb-8">
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

    </div>
  );
}
