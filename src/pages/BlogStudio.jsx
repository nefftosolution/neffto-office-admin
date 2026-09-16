import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Edit3,
  Columns,
  Image as ImageIcon,
  Upload,
  Link2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading2,
  Heading3,
  Heading4,
  Tag,
  Calendar,
  Clock,
  Sparkles,
  Check,
  AlertCircle,
  X,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cloud,
  FileText,
  Settings,
  Maximize2,
  Sliders,
  LayoutTemplate,
  Bookmark,
  Table as TableIcon,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_BASE, WEBSITE_BASE, apiFetch } from '../utils/api';
import { blogTemplates } from '../utils/blogTemplates';

const defaultCategories = [
  'Web Development',
  'AI & Machine Learning',
  'SEO',
  'App Development',
  'Graphic Design',
  'Digital Marketing',
  'Software Architecture',
  'Tech Trends',
];

const quickInternalLinks = [
  { name: 'Web Development', url: '/services/web-development', desc: 'Custom web, full stack & SaaS builds', icon: '🌐' },
  { name: 'Shopify Custom Theme', url: '/services/web-development#shopify', desc: 'Shopify themes & e-commerce jump link', icon: '🛍️' },
  { name: 'Mobile App Development', url: '/services/app-development', desc: 'iOS, Android & cross-platform apps', icon: '📱' },
  { name: 'AI & Machine Learning', url: '/services/ai-machine-learning', desc: 'Chatbots, Python & intelligent automation', icon: '🧠' },
  { name: 'Graphic Designing', url: '/services/graphic-designing', desc: 'Logos, branding & UI/UX Figma design', icon: '🎨' },
  { name: 'Digital Marketing', url: '/services/digital-marketing', desc: 'Meta ads, Google Ads & marketing funnels', icon: '📈' },
  { name: 'SEO Services', url: '/services/seo', desc: 'On-page, technical SEO & link building', icon: '🔍' },
  { name: 'All Blog Articles', url: '/blogs', desc: 'Public tech journal & blog directory', icon: '📰' },
  { name: 'Contact & Free Quote', url: '/contact', desc: 'Project estimation & consultation inquiry', icon: '✉️' },
];

const slugify = (text) => {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const calculateWordStats = (content) => {
  if (!content) return { words: 0, readTime: '1 min read' };
  const text = content.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { words, readTime: `${minutes} min read` };
};

const BlogStudio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Core Blog State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [manualSlug, setManualSlug] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('published');
  const [featured, setFeatured] = useState(false);
  const [wordStats, setWordStats] = useState({ words: 0, readTime: '1 min read' });

  // Author Details & Avatar
  const [authorName, setAuthorName] = useState('Neffto Tech Team');
  const [authorRole, setAuthorRole] = useState('Full Stack Specialists');
  const [authorAvatar, setAuthorAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [showSeo, setShowSeo] = useState(false);

  // UI States
  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'split', 'preview'
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor', 'settings'
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(false);

  // Template Modal State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Link & Anchor Tag Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkTab, setLinkTab] = useState('internal'); // 'internal', 'custom', 'anchor'
  const [anchorText, setAnchorText] = useState('');
  const [targetUrl, setTargetUrl] = useState('/services/web-development');
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [isCtaButton, setIsCtaButton] = useState(false);
  const [inPageAnchorId, setInPageAnchorId] = useState('');
  const [anchorTargetType, setAnchorTargetType] = useState('jump'); // 'jump' or 'target'

  const contentTextareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const avatarFileInputRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Load existing blog if editing
  useEffect(() => {
    if (isEditing) {
      const loadBlog = async () => {
        try {
          const res = await apiFetch(`/api/blogs`);
          if (res.ok) {
            const data = await res.json();
            const found = (data.blogs || []).find((b) => b.id === id || b.slug === id);
            if (found) {
              setTitle(found.title || '');
              setSlug(found.slug || '');
              setManualSlug(true);
              setExcerpt(found.excerpt || '');
              if (defaultCategories.includes(found.category)) {
                setCategory(found.category);
                setIsCustomCat(false);
              } else {
                setIsCustomCat(true);
                setCustomCategory(found.category || '');
              }
              setTags(found.tags || []);
              setCoverImage(found.coverImage || '');
              setContent(found.content || '');
              setStatus(found.status || 'published');
              setFeatured(Boolean(found.featured));
              if (found.author) {
                setAuthorName(found.author.name || 'Neffto Tech Team');
                setAuthorRole(found.author.role || 'Contributor');
                setAuthorAvatar(found.author.avatar || '');
              }
              if (found.seo) {
                setMetaTitle(found.seo.metaTitle || '');
                setMetaDescription(found.seo.metaDescription || '');
                setKeywords(found.seo.keywords || '');
              }
            } else {
              showToast('Blog post not found in database');
            }
          }
        } catch (e) {
          console.error('Error fetching blog:', e);
          showToast('Failed to load blog post from server');
        }
      };
      loadBlog();
    }
  }, [id, isEditing]);

  // Real-time word count & read time
  useEffect(() => {
    setWordStats(calculateWordStats(content));
  }, [content]);

  // Title change with auto-slug
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!manualSlug) {
      setSlug(slugify(val));
    }
  };

  // Tag Management
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/,/g, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Cloudinary Image Upload
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
        showToast('Image uploaded to Cloudinary CDN successfully!');
      } else {
        showToast(data.message || 'Image upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      // Fallback base64
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImage(reader.result);
        showToast('Image loaded locally');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Cloudinary Avatar Image Upload
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setAuthorAvatar(data.url);
        showToast('Author avatar uploaded to Cloudinary CDN successfully!');
      } else {
        showToast(data.message || 'Avatar upload failed');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      // Fallback base64
      const reader = new FileReader();
      reader.onload = () => {
        setAuthorAvatar(reader.result);
        showToast('Avatar image loaded locally');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDragOver = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(true);
  };

  const handleAvatarDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
  };

  const handleAvatarDrop = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarUpload(e.dataTransfer.files[0]);
    }
  };

  // Content formatting toolbar
  const insertFormatting = (before, after = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);

    const replacement = `${before}${selectedText || 'Text here'}${after}`;
    const newContent =
      previousText.substring(0, start) +
      replacement +
      previousText.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selectedText.length || 9)
      );
    }, 50);
  };

  // Template Selection
  const handleApplyTemplate = (tmpl) => {
    if (content.trim() && !window.confirm('Loading this template will replace current content. Continue?')) {
      return;
    }
    setTitle(tmpl.title);
    setSlug(slugify(tmpl.title));
    setExcerpt(tmpl.excerpt);
    setCategory(tmpl.category);
    setIsCustomCat(false);
    setTags(tmpl.tags);
    setCoverImage(tmpl.coverImage);
    setContent(tmpl.content);
    setMetaTitle(tmpl.title);
    setMetaDescription(tmpl.excerpt);
    setKeywords(tmpl.tags.join(', '));
    setShowTemplateModal(false);
    showToast(`Loaded "${tmpl.name}" template successfully!`);
  };

  // Open Link Modal with selected text
  const handleOpenLinkModal = () => {
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      if (selected.trim()) {
        setAnchorText(selected.trim());
      } else {
        setAnchorText('');
      }
    }
    setShowLinkModal(true);
  };

  // Apply Anchor / Hyperlink insertion
  const handleInsertAnchorLink = () => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    let snippet = '';

    if (linkTab === 'anchor') {
      const cleanId = inPageAnchorId.trim().replace(/^#/, '').toLowerCase().replace(/\s+/g, '-');
      if (!cleanId) {
        showToast('Please enter an Anchor ID (e.g. key-features)');
        return;
      }
      if (anchorTargetType === 'target') {
        snippet = `<h2 id="${cleanId}">${anchorText || 'Section Heading'}</h2>`;
      } else {
        snippet = `<a href="#${cleanId}">${anchorText || 'Jump to Section'}</a>`;
      }
    } else {
      const url = targetUrl.trim();
      if (!url) {
        showToast('Please enter or select a destination URL');
        return;
      }
      const text = anchorText.trim() || url;
      const targetAttr = openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      const classAttr = isCtaButton ? ' class="cta-btn"' : '';
      snippet = `<a href="${url}"${classAttr}${targetAttr}>${text}</a>`;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prev = textarea.value;
    const nextContent = prev.substring(0, start) + snippet + prev.substring(end);
    setContent(nextContent);
    setShowLinkModal(false);
    showToast('Anchor link inserted into article!');

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  // Insert Table shortcut
  const handleInsertTable = () => {
    const tableHtml = `\n<table class="w-full">
  <thead>
    <tr>
      <th>Feature / Item</th>
      <th>Specification</th>
      <th>Key Benefit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Core Architecture</strong></td>
      <td>Microservices / API-first</td>
      <td>Independent scaling & zero downtime</td>
    </tr>
    <tr>
      <td><strong>Response Time</strong></td>
      <td>&lt; 100ms</td>
      <td>Exceptional Core Web Vitals score</td>
    </tr>
    <tr>
      <td><strong>SEO Readiness</strong></td>
      <td>Dynamic JSON-LD Schema</td>
      <td>Immediate Google first-page indexing</td>
    </tr>
  </tbody>
</table>\n`;
    insertFormatting(tableHtml);
    showToast('Comparison table inserted');
  };

  // Insert Callout Box
  const handleInsertCallout = (type = 'info') => {
    let calloutHtml = '';
    if (type === 'tip') {
      calloutHtml = `\n<div class="callout-box callout-tip">
  <strong>💡 Pro Tip:</strong> Always optimize Core Web Vitals and pair technical performance with targeted <a href="/services/seo">dedicated SEO services</a> for maximum organic growth.
</div>\n`;
    } else if (type === 'cta') {
      calloutHtml = `\n<div class="callout-box callout-cta text-center">
  <h3 class="text-xl font-bold text-white mb-2">Need an Expert Development Team?</h3>
  <p class="text-sm text-white/80 mb-4">Partner with NEFFTO IT Solution for custom full-stack web and mobile applications.</p>
  <a href="/contact" class="cta-btn">Book a Free Consultation &rarr;</a>
</div>\n`;
    } else {
      calloutHtml = `\n<div class="callout-box callout-info">
  <strong>📌 Important Note:</strong> Make sure all internal links point to canonical URL structures to preserve search engine authority.
</div>\n`;
    }
    insertFormatting(calloutHtml);
    showToast('Callout block inserted');
  };

  // Insert Metrics Grid
  const handleInsertMetrics = () => {
    const metricsHtml = `\n<div class="metrics-grid">
  <div class="metric-card">
    <div class="text-3xl font-black text-[#5482b4] mb-1">+240%</div>
    <div class="text-xs uppercase tracking-wider text-white/60">Revenue Growth</div>
  </div>
  <div class="metric-card">
    <div class="text-3xl font-black text-emerald-400 mb-1">1.1s</div>
    <div class="text-xs uppercase tracking-wider text-white/60">Average Load Time</div>
  </div>
  <div class="metric-card">
    <div class="text-3xl font-black text-cyan-400 mb-1">99+</div>
    <div class="text-xs uppercase tracking-wider text-white/60">Core Web Vitals</div>
  </div>
</div>\n`;
    insertFormatting(metricsHtml);
    showToast('Metrics KPI grid inserted');
  };

  // Copy slug permalink
  const copyPermalink = () => {
    const fullUrl = `${WEBSITE_BASE}/blogs/${slug || slugify(title)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedSlug(true);
      setTimeout(() => setCopiedSlug(false), 2000);
      showToast('Live article URL copied to clipboard');
    }
  };

  // Save / Publish
  const handleSave = async (publishStatus = status) => {
    if (!title.trim()) {
      showToast('Please enter an article title');
      return;
    }

    if (!content.trim()) {
      showToast('Please write some content for the article');
      return;
    }

    setSaving(true);
    const finalCategory = isCustomCat ? customCategory : category;
    const finalSlug = slugify(slug || title);

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || title.trim(),
      category: finalCategory || 'Web Development',
      tags,
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1200&auto=format&fit=crop',
      content,
      status: publishStatus,
      featured,
      readTime: wordStats.readTime,
      author: {
        name: authorName.trim() || 'Neffto Tech Team',
        role: authorRole.trim() || 'Full Stack Specialists',
        avatar:
          authorAvatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      },
      seo: {
        metaTitle: metaTitle.trim() || title.trim(),
        metaDescription: metaDescription.trim() || excerpt.trim(),
        keywords: keywords.trim() || tags.join(', '),
      },
    };

    try {
      let res;
      if (isEditing) {
        res = await apiFetch(`/api/blogs/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch('/api/blogs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showToast(
          publishStatus === 'published'
            ? 'Article published live to MongoDB Atlas & CDN!'
            : 'Draft saved successfully!'
        );
        setTimeout(() => navigate('/'), 1200);
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Failed to save blog post');
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('Error communicating with backend');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020e24] text-white flex flex-col antialiased">
      <Navbar />

      {/* Floating Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#042558] border border-[#5482b4] text-[#c3e9fe] text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#5482b4] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ================= Sticky Studio Header ================= */}
      <div className="sticky top-[69px] z-40 bg-[#020e24]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          {/* Left: Back & Title Status */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {isEditing ? 'Modify Article' : 'Compose New Article'}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    status === 'published'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {status === 'published' ? '● Published' : '○ Draft'}
                </span>
              </div>
              <div className="text-[11px] text-white/50 flex items-center gap-2">
                <span>{wordStats.words} words</span>
                <span>•</span>
                <span>{wordStats.readTime}</span>
              </div>
            </div>
          </div>

          {/* Center: View Switcher & Templates (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Browse and load 5 professional ready-made blog templates"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Templates (5)</span>
            </button>

            <div className="flex items-center bg-[#042558]/50 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'edit'
                    ? 'bg-[#5482b4] text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'split'
                    ? 'bg-[#5482b4] text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'preview'
                    ? 'bg-[#5482b4] text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Full Page Simulation</span>
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-white/60" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#5482b4] to-[#042558] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#5482b4]/25 transition-all cursor-pointer border border-[#5482b4]/40"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isEditing ? 'Update & Live' : 'Publish Article'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-3 pt-3 border-t border-white/10">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-amber-500/40 bg-amber-500/10 text-amber-300"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
              mobileTab === 'editor'
                ? 'bg-[#5482b4] text-white'
                : 'bg-white/5 text-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Content</span>
          </button>
          <button
            onClick={() => setMobileTab('settings')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
              mobileTab === 'settings'
                ? 'bg-[#5482b4] text-white'
                : 'bg-white/5 text-white/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings & Media</span>
          </button>
        </div>
      </div>

      {/* ================= Main Studio Layout ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {/* Full Page Preview Mode */}
        {viewMode === 'preview' ? (
          <div className="bg-[#020e24] border border-white/10 rounded-3xl p-6 sm:p-12 shadow-2xl space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
              <span className="uppercase tracking-widest text-[#5482b4] font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Live Website Simulation
              </span>
              <button
                onClick={() => setViewMode('edit')}
                className="text-white/70 hover:text-white flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Back to Editor
              </button>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-[#5482b4] text-white shadow">
                  {isCustomCat ? customCategory : category}
                </span>
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#5482b4]" />
                  {wordStats.readTime}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight font-heading">
                {title || 'Untitled Article'}
              </h1>

              <p className="text-base sm:text-lg text-white/70 leading-relaxed">
                {excerpt || 'Article summary excerpt will be displayed here.'}
              </p>

              {coverImage && (
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-h-[460px]">
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className="blog-content prose prose-invert max-w-none text-white/80 space-y-5 leading-relaxed text-base sm:text-lg
                  [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:border-b [&>h2]:border-white/10 [&>h2]:pb-2
                  [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-6
                  [&>p]:my-4
                  [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2
                  [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2
                  [&>blockquote]:border-l-4 [&>blockquote]:border-[#5482b4] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#c3e9fe] [&>blockquote]:bg-[#042558]/40 [&>blockquote]:py-2 [&>blockquote]:rounded-r-lg
                  [&_a]:text-cyan-400 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-cyan-300
                  [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:border [&_table]:border-white/10
                  [&_th]:bg-[#042558]/80 [&_th]:p-3.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_th]:text-cyan-300 [&_th]:border-b [&_th]:border-white/10
                  [&_td]:p-3 [&_td]:text-xs [&_td]:sm:text-sm [&_td]:border-b [&_td]:border-white/5 [&_td]:bg-[#020e24]/40
                  [&_.callout-box]:p-4 [&_.callout-box]:my-6 [&_.callout-box]:rounded-2xl [&_.callout-box]:border
                  [&_.callout-info]:bg-[#042558]/40 [&_.callout-info]:border-[#5482b4]/40 [&_.callout-info]:text-[#c3e9fe]
                  [&_.callout-tip]:bg-amber-500/10 [&_.callout-tip]:border-amber-500/30 [&_.callout-tip]:text-amber-200
                  [&_.callout-cta]:bg-gradient-to-br [&_.callout-cta]:from-[#042558] [&_.callout-cta]:to-[#020e24] [&_.callout-cta]:border-[#5482b4]/50
                  [&_.cta-btn]:inline-block [&_.cta-btn]:px-5 [&_.cta-btn]:py-2.5 [&_.cta-btn]:my-2 [&_.cta-btn]:rounded-xl [&_.cta-btn]:bg-[#5482b4] [&_.cta-btn]:text-white [&_.cta-btn]:font-bold [&_.cta-btn]:no-underline hover:[&_.cta-btn]:bg-[#426a97]
                  [&_.metrics-grid]:grid [&_.metrics-grid]:grid-cols-1 [&_.metrics-grid]:sm:grid-cols-3 [&_.metrics-grid]:gap-3 [&_.metrics-grid]:my-6
                  [&_.metric-card]:p-4 [&_.metric-card]:rounded-xl [&_.metric-card]:bg-[#042558]/40 [&_.metric-card]:border [&_.metric-card]:border-white/10 [&_.metric-card]:text-center"
                dangerouslySetInnerHTML={{
                  __html:
                    content || '<p className="text-white/40 italic">Start writing in the editor to see your article here...</p>',
                }}
              />
            </div>
          </div>
        ) : (
          /* Responsive Grid (Editor + Sidebar) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Editor Column */}
            <div
              className={`space-y-6 ${
                viewMode === 'split'
                  ? 'lg:col-span-6'
                  : 'lg:col-span-8'
              } ${mobileTab === 'settings' ? 'hidden md:block' : 'block'}`}
            >
              {/* Title & Slug Card */}
              <div className="bg-[#042558]/30 border border-white/10 p-5 sm:p-6 rounded-2xl backdrop-blur-md space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Article Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter an engaging, SEO-rich title..."
                    className="w-full px-4 py-3 rounded-xl bg-[#020e24]/70 border border-white/10 text-base sm:text-xl font-bold text-white placeholder-white/30 focus:outline-none focus:border-[#5482b4] focus:ring-2 focus:ring-[#5482b4]/20 transition"
                  />
                </div>

                {/* Slug Permlink */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/70">
                      Permanent URL Slug
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setManualSlug(false);
                        setSlug(slugify(title));
                      }}
                      className="text-[11px] text-[#5482b4] hover:underline"
                    >
                      Regenerate from Title
                    </button>
                  </div>
                  <div className="flex items-center rounded-xl bg-[#020e24]/70 border border-white/10 overflow-hidden text-xs">
                    <span className="px-3 py-2.5 text-white/40 bg-white/5 border-r border-white/10 select-none hidden sm:inline">
                      /blogs/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setManualSlug(true);
                        setSlug(slugify(e.target.value));
                      }}
                      placeholder="custom-url-slug"
                      className="flex-1 px-3 py-2.5 bg-transparent text-white placeholder-white/30 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={copyPermalink}
                      className="px-3 py-2.5 text-white/50 hover:text-white bg-white/5 border-l border-white/10 transition"
                      title="Copy full URL"
                    >
                      {copiedSlug ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="text-[11px] text-white/40 truncate">
                    Live Link: <span className="text-[#c3e9fe]">https://nefftosolution.com/blogs/{slug || '...' }</span>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/70">
                      Short Summary Excerpt
                    </label>
                    <span className="text-[10px] text-white/40">
                      {excerpt.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short 1-2 sentence overview shown in blog cards, social cards, and Google snippets..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#020e24]/70 border border-white/10 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#5482b4] transition leading-relaxed"
                  />
                </div>
              </div>

              {/* Rich Content Editor */}
              <div className="bg-[#042558]/30 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden flex flex-col">
                {/* Formatting Toolbar */}
                <div className="bg-white/5 border-b border-white/10 p-2.5 flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => insertFormatting('<h2>', '</h2>')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition text-xs font-bold"
                      title="Heading 2"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<h3>', '</h3>')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition text-xs font-bold"
                      title="Heading 3"
                    >
                      <Heading3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<h4>', '</h4>')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition text-xs font-bold"
                      title="Heading 4"
                    >
                      <Heading4 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="h-4 w-px bg-white/15" />

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => insertFormatting('<strong>', '</strong>')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<em>', '</em>')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<u>', '</u>')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
                      title="Underline"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="h-4 w-px bg-white/15" />

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        insertFormatting('<ul>\n  <li>', '</li>\n  <li>Item 2</li>\n</ul>')
                      }
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertFormatting('<ol>\n  <li>', '</li>\n  <li>Item 2</li>\n</ol>')
                      }
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertFormatting('<blockquote>"', '"</blockquote>')
                      }
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
                      title="Blockquote"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertFormatting('<pre><code>\n', '\n</code></pre>')
                      }
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
                      title="Code Block"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="h-4 w-px bg-white/15" />

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleOpenLinkModal}
                      className="p-1.5 px-2.5 rounded-lg bg-[#5482b4]/20 hover:bg-[#5482b4]/40 text-[#c3e9fe] hover:text-white transition flex items-center gap-1.5 text-xs font-semibold border border-[#5482b4]/40 cursor-pointer"
                      title="Insert Hyperlink, Internal Service Link, or In-Page Anchor (#id)"
                    >
                      <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Link / Anchor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter image URL:');
                        if (url) {
                          insertFormatting(`<img src="${url}" alt="`, '" class="rounded-xl my-4 border border-white/10 max-h-96 w-full object-cover" />');
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                      title="Insert Image URL"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="h-4 w-px bg-white/15" />

                  {/* Pro Content Components */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleInsertTable}
                      className="p-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition flex items-center gap-1 text-xs font-medium cursor-pointer"
                      title="Insert Comparison Table"
                    >
                      <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Table</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInsertCallout('tip')}
                      className="p-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition flex items-center gap-1 text-xs font-medium cursor-pointer"
                      title="Insert Pro Tip / Callout Box"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Callout</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInsertMetrics}
                      className="p-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition flex items-center gap-1 text-xs font-medium cursor-pointer"
                      title="Insert 3-Column Metrics Grid"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">KPI Metrics</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const idVal = prompt('Enter section Anchor ID (e.g. key-features):');
                        if (idVal) {
                          const clean = idVal.trim().replace(/^#/, '').toLowerCase().replace(/\s+/g, '-');
                          insertFormatting(`<h2 id="${clean}">`, `</h2>`);
                        }
                      }}
                      className="p-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition flex items-center gap-1 text-xs font-medium cursor-pointer"
                      title="Set an anchor ID destination (<h2 id='...'>)"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                      <span className="hidden sm:inline">#Target</span>
                    </button>
                  </div>
                </div>

                {/* Main Textarea */}
                <textarea
                  ref={contentTextareaRef}
                  rows={22}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Compose your article using HTML formatting or the toolbar above..."
                  className="w-full p-5 bg-transparent text-sm sm:text-base text-white/90 placeholder-white/30 focus:outline-none font-mono leading-relaxed resize-y min-h-[420px]"
                />
              </div>
            </div>

            {/* Split View Live Rendering (Desktop) */}
            {viewMode === 'split' && (
              <div className="hidden lg:block lg:col-span-6 bg-[#042558]/20 border border-white/10 rounded-2xl p-6 backdrop-blur-md overflow-y-auto max-h-[850px] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-white/60">
                  <span className="font-bold text-[#5482b4] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Live Render
                  </span>
                  <span>{wordStats.readTime}</span>
                </div>

                <h1 className="text-2xl font-bold text-white">
                  {title || 'Article Title'}
                </h1>

                {coverImage && (
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-44 object-cover rounded-xl border border-white/10"
                  />
                )}

                <div
                  className="prose prose-invert max-w-none text-white/80 space-y-4 text-sm leading-relaxed
                    [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-6 [&>h2]:border-b [&>h2]:border-white/10 [&>h2]:pb-1
                    [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-white
                    [&>blockquote]:border-l-4 [&>blockquote]:border-[#5482b4] [&>blockquote]:pl-3 [&>blockquote]:text-[#c3e9fe] [&>blockquote]:bg-[#042558]/30 [&>blockquote]:py-1.5 [&>blockquote]:rounded-r
                    [&>code]:bg-white/10 [&>code]:text-[#c3e9fe] [&>code]:px-1 [&>code]:rounded
                    [&_a]:text-cyan-400 [&_a]:underline hover:[&_a]:text-cyan-300
                    [&_table]:w-full [&_table]:my-4 [&_table]:border-collapse [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:border [&_table]:border-white/10
                    [&_th]:bg-[#042558]/80 [&_th]:p-2.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_th]:text-cyan-300 [&_th]:border-b [&_th]:border-white/10
                    [&_td]:p-2.5 [&_td]:text-xs [&_td]:border-b [&_td]:border-white/5 [&_td]:bg-[#020e24]/40
                    [&_.callout-box]:p-3 [&_.callout-box]:my-4 [&_.callout-box]:rounded-xl [&_.callout-box]:border
                    [&_.callout-info]:bg-[#042558]/40 [&_.callout-info]:border-[#5482b4]/40 [&_.callout-info]:text-[#c3e9fe]
                    [&_.callout-tip]:bg-amber-500/10 [&_.callout-tip]:border-amber-500/30 [&_.callout-tip]:text-amber-200
                    [&_.callout-cta]:bg-gradient-to-br [&_.callout-cta]:from-[#042558] [&_.callout-cta]:to-[#020e24] [&_.callout-cta]:border-[#5482b4]/50
                    [&_.cta-btn]:inline-block [&_.cta-btn]:px-4 [&_.cta-btn]:py-2 [&_.cta-btn]:my-2 [&_.cta-btn]:rounded-lg [&_.cta-btn]:bg-[#5482b4] [&_.cta-btn]:text-white [&_.cta-btn]:font-bold [&_.cta-btn]:no-underline hover:[&_.cta-btn]:bg-[#426a97]
                    [&_.metrics-grid]:grid [&_.metrics-grid]:grid-cols-1 [&_.metrics-grid]:sm:grid-cols-3 [&_.metrics-grid]:gap-2 [&_.metrics-grid]:my-4
                    [&_.metric-card]:p-3 [&_.metric-card]:rounded-lg [&_.metric-card]:bg-[#042558]/40 [&_.metric-card]:border [&_.metric-card]:border-white/10 [&_.metric-card]:text-center"
                  dangerouslySetInnerHTML={{
                    __html:
                      content || '<p className="text-white/40 italic">Type on the left to see live rendering...</p>',
                  }}
                />
              </div>
            )}

            {/* Settings & Media Column (Col 4) */}
            <div
              className={`space-y-6 ${
                viewMode === 'split' ? 'hidden' : 'lg:col-span-4'
              } ${mobileTab === 'editor' ? 'hidden md:block' : 'block'}`}
            >
              {/* Cloudinary Cover Image Studio */}
              <div className="bg-[#042558]/30 border border-white/10 p-5 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-[#5482b4]" />
                    <span>Featured Cover Image</span>
                  </label>
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="text-[11px] text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Drag and Drop Zone */}
                {coverImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 ${
                      isDragging
                        ? 'border-[#5482b4] bg-[#5482b4]/20 scale-102'
                        : 'border-white/20 hover:border-[#5482b4] bg-[#020e24]/40'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-[#5482b4] mx-auto animate-pulse" />
                    <div className="text-xs font-bold text-white">
                      {uploadingImage
                        ? 'Uploading to Cloudinary...'
                        : 'Drag & Drop or Click to Upload'}
                    </div>
                    <div className="text-[10px] text-white/40">
                      Auto-optimized on Cloudinary CDN
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  className="hidden"
                />

                {/* Direct Image URL input */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] text-white/60">
                    Or Enter Image URL:
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#020e24]/70 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#5482b4]"
                  />
                </div>
              </div>

              {/* Category & Tags Card */}
              <div className="bg-[#042558]/30 border border-white/10 p-5 rounded-2xl backdrop-blur-md space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-white/80 block">
                  Category & Taxonomy
                </label>

                {/* Category Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/60">Category</span>
                    <button
                      type="button"
                      onClick={() => setIsCustomCat(!isCustomCat)}
                      className="text-[11px] text-[#5482b4] hover:underline"
                    >
                      {isCustomCat ? 'Choose Preset' : '+ Custom Category'}
                    </button>
                  </div>

                  {isCustomCat ? (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Cloud Computing..."
                      className="w-full px-3 py-2 rounded-xl bg-[#020e24]/70 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#5482b4]"
                    />
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#020e24]/80 border border-white/10 text-xs text-white focus:outline-none focus:border-[#5482b4]"
                    >
                      {defaultCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Tags input */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-white/60">
                    Tags (Press Enter or comma)
                  </span>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag and press Enter..."
                    className="w-full px-3 py-2 rounded-xl bg-[#020e24]/70 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#5482b4]"
                  />
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-[#5482b4]/20 border border-[#5482b4]/40 text-[#c3e9fe]"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Featured Story Checkbox */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Featured Story
                    </div>
                    <div className="text-[10px] text-white/40">
                      Spotlight at the top of the blog page
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#5482b4] cursor-pointer"
                  />
                </div>
              </div>

              {/* Author Profile & Avatar Studio */}
              <div className="bg-[#042558]/30 border border-white/10 p-5 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/80 block">
                    Author Profile & Avatar
                  </label>
                  {authorAvatar && (
                    <button
                      type="button"
                      onClick={() => setAuthorAvatar('')}
                      className="text-[11px] text-red-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Avatar Uploader / Drag Zone */}
                <div className="flex items-center gap-4">
                  {authorAvatar ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#5482b4] shadow-lg shrink-0 group">
                      <img
                        src={authorAvatar}
                        alt="Author Avatar"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => avatarFileInputRef.current?.click()}
                          className="text-[10px] text-white font-bold px-1.5 py-0.5 rounded bg-white/20 hover:bg-white/30 backdrop-blur-xs cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleAvatarDragOver}
                      onDragLeave={handleAvatarDragLeave}
                      onDrop={handleAvatarDrop}
                      onClick={() => avatarFileInputRef.current?.click()}
                      className={`w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 ${
                        isDraggingAvatar
                          ? 'border-[#5482b4] bg-[#5482b4]/20 scale-105'
                          : 'border-white/20 hover:border-[#5482b4] bg-[#020e24]/50'
                      }`}
                      title="Click or drop image to upload avatar"
                    >
                      <Upload className="w-5 h-5 text-[#5482b4] animate-pulse" />
                      <span className="text-[9px] text-white/60 font-semibold mt-1">Upload</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-semibold text-white">
                      {uploadingAvatar
                        ? 'Uploading to Cloudinary...'
                        : 'Upload Author Avatar'}
                    </div>
                    <div className="text-[10px] text-white/40">
                      Drag & drop image or click to upload to Cloudinary.
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="text-xs text-[#5482b4] hover:text-[#c3e9fe] font-medium underline cursor-pointer"
                    >
                      Browse file
                    </button>
                  </div>
                </div>

                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  className="hidden"
                />

                {/* Direct Avatar Image URL */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] text-white/60">
                    Or Enter Avatar Image URL:
                  </label>
                  <input
                    type="url"
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#020e24]/70 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#5482b4]"
                  />
                </div>

                {/* Author Name & Role inputs */}
                <div className="space-y-2 text-xs pt-2 border-t border-white/10">
                  <div>
                    <span className="text-[10px] text-white/50">Author Name</span>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Neffto Tech Team"
                      className="w-full px-3 py-2 rounded-xl bg-[#020e24]/70 border border-white/10 text-xs text-white focus:outline-none focus:border-[#5482b4]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50">Role / Position</span>
                    <input
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="e.g. Senior Software Architect"
                      className="w-full px-3 py-2 rounded-xl bg-[#020e24]/70 border border-white/10 text-xs text-white focus:outline-none focus:border-[#5482b4]"
                    />
                  </div>
                </div>

                {/* Live Author Card Preview */}
                <div className="p-3 rounded-xl bg-[#020e24]/50 border border-white/10 flex items-center gap-3">
                  <img
                    src={
                      authorAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                    }
                    alt="Author Preview"
                    className="w-9 h-9 rounded-full object-cover border border-[#5482b4]/50"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {authorName || 'Author Name'}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">
                      {authorRole || 'Author Role'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO & Search Engine Simulation */}
              <div className="bg-[#042558]/30 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSeo(!showSeo)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#5482b4]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Google Search Preview & SEO
                    </span>
                  </div>
                  {showSeo ? (
                    <ChevronUp className="w-4 h-4 text-white/60" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/60" />
                  )}
                </button>

                {showSeo && (
                  <div className="p-4 pt-0 space-y-4 border-t border-white/10 mt-1">
                    {/* Google SERP Snippet Preview */}
                    <div className="p-3.5 rounded-xl bg-[#020e24] border border-white/10 space-y-1">
                      <div className="text-[11px] text-gray-400 truncate">
                        https://nefftosolution.com &gt; blogs &gt; {slug || 'article-slug'}
                      </div>
                      <div className="text-sm font-semibold text-[#8ab4f8] hover:underline cursor-pointer truncate">
                        {metaTitle || title || 'Your Article Title'}
                      </div>
                      <div className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                        {metaDescription || excerpt || 'Search snippet summary description will show here on Google...'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-white/60">Meta Title</span>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder={title || 'Custom SEO title...'}
                        className="w-full px-3 py-1.5 rounded-xl bg-[#020e24]/70 border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-white/60">
                        Meta Description
                      </span>
                      <textarea
                        rows={2}
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder={excerpt || 'Targeted description for search engines...'}
                        className="w-full px-3 py-1.5 rounded-xl bg-[#020e24]/70 border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-white/60">Keywords</span>
                      <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full px-3 py-1.5 rounded-xl bg-[#020e24]/70 border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= Template Gallery Modal ================= */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#031538] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h3 className="text-xl font-black text-white">5 Ready-to-Use Blog Templates</h3>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Click any production-grade blueprint below to instantly populate title, meta, tags, and rich HTML with tables and anchor jumps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowTemplateModal(false);
                  setPreviewTemplate(null);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blogTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="bg-[#020e24]/70 border border-white/10 hover:border-[#5482b4]/60 rounded-2xl p-5 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-[#5482b4]/10"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#5482b4]/20 text-cyan-300 border border-[#5482b4]/30">
                          {tmpl.category}
                        </span>
                        <span className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md">
                          {tmpl.badge}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition line-clamp-2">
                        {tmpl.title}
                      </h4>

                      <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                        {tmpl.excerpt}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {tmpl.tags.slice(0, 3).map((tg) => (
                          <span key={tg} className="text-[10px] bg-white/5 text-white/50 px-2 py-0.5 rounded">
                            #{tg}
                          </span>
                        ))}
                        <span className="text-[10px] text-white/40 ml-auto">
                          ⏱ {tmpl.readTime}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(previewTemplate?.id === tmpl.id ? null : tmpl)}
                        className="text-xs font-semibold text-white/70 hover:text-white transition py-1.5 px-3 rounded-lg hover:bg-white/10"
                      >
                        {previewTemplate?.id === tmpl.id ? 'Close Outline' : 'View Outline'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="text-xs font-bold text-white bg-gradient-to-r from-[#5482b4] to-[#042558] hover:opacity-90 px-4 py-2 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Load Template</span>
                      </button>
                    </div>

                    {/* Quick Outline Preview */}
                    {previewTemplate?.id === tmpl.id && (
                      <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white/80 space-y-2 animate-in fade-in duration-150">
                        <div className="font-bold text-amber-300 flex items-center gap-1">
                          <Bookmark className="w-3.5 h-3.5" /> Embedded Components & Anchors:
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-white/70">
                          <li>Interactive In-Page Navigation / Table of Contents</li>
                          <li>Styled Comparison Table with Technical Specs</li>
                          <li>Callout Tip & Attention Highlight Boxes</li>
                          <li>Internal Anchors connecting to Neffto Service Pages</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
              <span>All 5 templates include responsive tables, callout blocks, and verified anchor tags.</span>
              <button
                type="button"
                onClick={() => {
                  setShowTemplateModal(false);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Anchor Tag & Hyperlink Manager Modal ================= */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#031538] border border-[#5482b4]/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#5482b4]/20 text-cyan-300 border border-[#5482b4]/30">
                  <Link2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">Anchor Tag & Link Manager</h3>
                  <p className="text-xs text-white/60">
                    Insert exact anchor text, Neffto internal service links, or in-page jump targets.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Link Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#020e24] p-1 rounded-xl border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLinkTab('internal')}
                className={`py-2 rounded-lg transition ${
                  linkTab === 'internal'
                    ? 'bg-[#5482b4] text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                🌐 Neffto Services
              </button>
              <button
                type="button"
                onClick={() => setLinkTab('custom')}
                className={`py-2 rounded-lg transition ${
                  linkTab === 'custom'
                    ? 'bg-[#5482b4] text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                🔗 Custom URL
              </button>
              <button
                type="button"
                onClick={() => setLinkTab('anchor')}
                className={`py-2 rounded-lg transition ${
                  linkTab === 'anchor'
                    ? 'bg-[#5482b4] text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                ⚓ In-Page Anchor (#)
              </button>
            </div>

            {/* Tab 1: Internal Neffto Services */}
            {linkTab === 'internal' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">
                    Anchor Text (Phrase wrapped in link)
                  </label>
                  <input
                    type="text"
                    value={anchorText}
                    onChange={(e) => setAnchorText(e.target.value)}
                    placeholder="e.g. dedicated SEO services or Shopify custom theme"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#020e24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#5482b4]"
                  />
                  <span className="text-[11px] text-white/40">
                    Selected text from editor automatically populates this field.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">
                    Select Target Neffto Service:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {quickInternalLinks.map((item) => {
                      const isSelected = targetUrl === item.url;
                      return (
                        <button
                          key={item.url}
                          type="button"
                          onClick={() => {
                            setTargetUrl(item.url);
                            if (!anchorText) setAnchorText(item.name);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-500/15 text-white'
                              : 'border-white/10 bg-[#020e24]/60 hover:border-white/30 text-white/70'
                          }`}
                        >
                          <span className="text-base shrink-0">{item.icon}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate text-white">{item.name}</div>
                            <div className="text-[10px] text-white/50 truncate font-mono">{item.url}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                    <input
                      type="checkbox"
                      checked={openInNewTab}
                      onChange={(e) => setOpenInNewTab(e.target.checked)}
                      className="rounded bg-[#020e24] border-white/20 text-[#5482b4] focus:ring-0"
                    />
                    <span>Open in new tab</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                    <input
                      type="checkbox"
                      checked={isCtaButton}
                      onChange={(e) => setIsCtaButton(e.target.checked)}
                      className="rounded bg-[#020e24] border-white/20 text-[#5482b4] focus:ring-0"
                    />
                    <span>Style as CTA Button</span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 2: Custom URL */}
            {linkTab === 'custom' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">
                    Anchor Text
                  </label>
                  <input
                    type="text"
                    value={anchorText}
                    onChange={(e) => setAnchorText(e.target.value)}
                    placeholder="e.g. Visit Documentation or Read More"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#020e24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#5482b4]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com or /contact"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#020e24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#5482b4] font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                    <input
                      type="checkbox"
                      checked={openInNewTab}
                      onChange={(e) => setOpenInNewTab(e.target.checked)}
                      className="rounded bg-[#020e24] border-white/20 text-[#5482b4] focus:ring-0"
                    />
                    <span>Open in new tab</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                    <input
                      type="checkbox"
                      checked={isCtaButton}
                      onChange={(e) => setIsCtaButton(e.target.checked)}
                      className="rounded bg-[#020e24] border-white/20 text-[#5482b4] focus:ring-0"
                    />
                    <span>Style as CTA Button</span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 3: In-Page Anchor (#hash) */}
            {linkTab === 'anchor' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 bg-[#020e24] p-1 rounded-xl border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setAnchorTargetType('jump')}
                    className={`py-1.5 rounded-lg font-semibold transition ${
                      anchorTargetType === 'jump'
                        ? 'bg-[#5482b4] text-white shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    1. Jump Link (&lt;a href="#id"&gt;)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnchorTargetType('target')}
                    className={`py-1.5 rounded-lg font-semibold transition ${
                      anchorTargetType === 'target'
                        ? 'bg-[#5482b4] text-white shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    2. Target Section (&lt;h2 id="id"&gt;)
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">
                    Anchor ID (Slug without spaces)
                  </label>
                  <div className="flex items-center bg-[#020e24] rounded-xl border border-white/10 px-3 py-2 text-xs font-mono">
                    <span className="text-cyan-400 select-none mr-1 font-bold">#</span>
                    <input
                      type="text"
                      value={inPageAnchorId}
                      onChange={(e) => setInPageAnchorId(e.target.value)}
                      placeholder="e.g. database-scaling or shopify-setup"
                      className="bg-transparent text-white focus:outline-none flex-1 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-white/40">
                    Example: `#key-features` will jump smoothly to that section on the page.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">
                    {anchorTargetType === 'jump' ? 'Anchor Text for the Link' : 'Section Heading Text'}
                  </label>
                  <input
                    type="text"
                    value={anchorText}
                    onChange={(e) => setAnchorText(e.target.value)}
                    placeholder={anchorTargetType === 'jump' ? 'Jump to Key Features' : 'Key Architecture Features'}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#020e24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#5482b4]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                  💡 <strong>How Anchor Jumps Work:</strong> Place a <em>Target Section</em> at your heading (`&lt;h2 id="xyz"&gt;`), then create a <em>Jump Link</em> at the top (`&lt;a href="#xyz"&gt;`) so readers can jump straight to it.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertAnchorLink}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#5482b4] to-[#042558] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#5482b4]/25 transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insert Anchor Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogStudio;
