import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Tag,
  Layers,
  TrendingUp,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_BASE, WEBSITE_BASE, apiFetch } from '../utils/api';

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ open: false, blog: null });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/blogs');
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error('Failed to load blogs:', err);
      showToast('Could not connect to backend server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Compute metrics
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === 'published').length;
    const drafts = blogs.filter((b) => b.status === 'draft').length;
    const categoriesSet = new Set(blogs.map((b) => b.category).filter(Boolean));
    return { total, published, drafts, categories: categoriesSet.size };
  }, [blogs]);

  // Unique categories for filter dropdown & pills
  const categoriesList = useMemo(() => {
    const set = new Set(blogs.map((b) => b.category).filter(Boolean));
    return Array.from(set);
  }, [blogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesStatus =
        statusFilter === 'all' || blog.status === statusFilter;
      const matchesCat =
        categoryFilter === 'all' ||
        (blog.category || '').toLowerCase() === categoryFilter.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (blog.title || '').toLowerCase().includes(q) ||
        (blog.slug || '').toLowerCase().includes(q) ||
        (blog.excerpt || '').toLowerCase().includes(q) ||
        (blog.author?.name || '').toLowerCase().includes(q);

      return matchesStatus && matchesCat && matchesSearch;
    });
  }, [blogs, statusFilter, categoryFilter, searchQuery]);

  // Toggle status (Draft <-> Published)
  const handleToggleStatus = async (blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      const res = await apiFetch(`/api/blogs/${blog.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, status: newStatus } : b))
        );
        showToast(`Article marked as ${newStatus}`);
      } else {
        showToast('Failed to update status');
      }
    } catch (e) {
      showToast('Error updating status');
    }
  };

  // Delete post
  const handleDeleteConfirm = async () => {
    if (!deleteModal.blog) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/blogs/${deleteModal.blog.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== deleteModal.blog.id));
        showToast('Blog article deleted successfully');
        setDeleteModal({ open: false, blog: null });
      } else {
        showToast('Failed to delete post');
      }
    } catch (e) {
      showToast('Error deleting post');
    } finally {
      setDeleting(false);
    }
  };

  const copySlugUrl = (slug, id) => {
    const url = `${WEBSITE_BASE}/blogs/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast('Live article URL copied to clipboard');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="min-h-screen bg-[#020e24] text-white flex flex-col selection:bg-[#5482b4]/30 selection:text-white">
      <Navbar />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#042558] border border-[#5482b4]/50 text-[#c3e9fe] text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#5482b4]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Header & CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/95 to-[#c3e9fe] bg-clip-text text-transparent">
                Blog Publishing Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5482b4]/20 text-[#c3e9fe] border border-[#5482b4]/30">
                {blogs.length} {blogs.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/60">
              Manage, compose, upload images to Cloudinary, and publish live content seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBlogs}
              className="p-2.5 rounded-xl border border-white/10 bg-[#042558]/40 hover:bg-[#042558] text-white/70 hover:text-white transition shadow-sm"
              title="Refresh article list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#5482b4]' : ''}`} />
            </button>
            <Link
              to="/blogs/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5482b4] to-[#082d6b] hover:from-[#5482b4]/90 hover:to-[#082d6b]/90 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#5482b4]/25 transition hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Article</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#042558]/30 hover:bg-[#042558]/45 border border-white/10 hover:border-[#5482b4]/40 p-5 rounded-2xl backdrop-blur-md space-y-2 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60 font-medium">Total Articles</span>
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#c3e9fe] group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {stats.total}
            </div>
            <div className="text-[11px] text-white/40">In MongoDB Atlas database</div>
          </div>

          <div className="bg-[#042558]/30 hover:bg-[#042558]/45 border border-white/10 hover:border-emerald-500/40 p-5 rounded-2xl backdrop-blur-md space-y-2 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-medium">Published Live</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {stats.published}
            </div>
            <div className="text-[11px] text-emerald-400/60">Visible to public visitors</div>
          </div>

          <div className="bg-[#042558]/30 hover:bg-[#042558]/45 border border-white/10 hover:border-amber-500/40 p-5 rounded-2xl backdrop-blur-md space-y-2 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-medium">Drafts</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-400">
              {stats.drafts}
            </div>
            <div className="text-[11px] text-amber-400/60">Unpublished work in progress</div>
          </div>

          <div className="bg-[#042558]/30 hover:bg-[#042558]/45 border border-white/10 hover:border-[#5482b4]/40 p-5 rounded-2xl backdrop-blur-md space-y-2 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#c3e9fe] font-medium">Categories</span>
              <div className="w-8 h-8 rounded-xl bg-[#5482b4]/10 flex items-center justify-center text-[#c3e9fe] group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#c3e9fe]">
              {stats.categories}
            </div>
            <div className="text-[11px] text-[#c3e9fe]/60">Active topics covered</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-[#042558]/30 border border-white/10 p-4 sm:p-5 rounded-2xl backdrop-blur-md space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, slug, topic, or author..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#020e24]/70 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#5482b4] focus:ring-2 focus:ring-[#5482b4]/20 transition"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Status Filter */}
              <div className="flex rounded-xl bg-[#020e24]/70 p-1 border border-white/10 text-xs">
                {['all', 'published', 'draft'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg capitalize text-xs font-semibold transition ${
                      statusFilter === s
                        ? 'bg-[#5482b4] text-white shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-[#020e24]/80 border border-white/10 text-xs text-white/80 focus:outline-none focus:border-[#5482b4]"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Category Pills */}
          {categoriesList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-[11px] text-white/50 flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3 text-[#5482b4]" /> Quick Filter:
              </span>
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  categoryFilter === 'all'
                    ? 'bg-[#5482b4] text-white'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                All
              </button>
              {categoriesList.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    categoryFilter === c
                      ? 'bg-[#5482b4] text-white'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Blog Posts Table */}
        <div className="bg-[#042558]/20 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          {loading ? (
            <div className="p-20 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#5482b4] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-semibold text-white">Fetching articles from MongoDB Atlas...</div>
              <p className="text-xs text-white/40">Synchronizing database records</p>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-white/60 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-4 sm:px-6">Article & Slug</th>
                    <th className="py-4 px-4">Author</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Published</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBlogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className="hover:bg-white/5 transition-colors duration-150 group"
                    >
                      {/* Post Details */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-4 max-w-lg">
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-16 h-12 rounded-xl object-cover shrink-0 border border-white/10 shadow-sm"
                          />
                          <div className="space-y-1 min-w-0">
                            <Link
                              to={`/blogs/edit/${blog.id}`}
                              className="font-bold text-sm text-white group-hover:text-[#c3e9fe] transition line-clamp-1"
                            >
                              {blog.title}
                            </Link>
                            <div className="flex items-center gap-2 text-[11px] text-white/50">
                              <span className="font-mono text-white/40 truncate max-w-[200px]">
                                /{blog.slug}
                              </span>
                              <button
                                onClick={() => copySlugUrl(blog.slug, blog.id)}
                                className="hover:text-white transition"
                                title="Copy public link"
                              >
                                {copiedId === blog.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              blog.author?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                            }
                            alt={blog.author?.name || 'Author'}
                            className="w-7 h-7 rounded-full object-cover border border-white/20"
                          />
                          <div className="min-w-0">
                            <div className="text-white font-medium truncate max-w-[100px]">
                              {blog.author?.name || 'Neffto Team'}
                            </div>
                            <div className="text-[10px] text-white/40 truncate max-w-[100px]">
                              {blog.author?.role || 'Author'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#5482b4]/20 text-[#c3e9fe] border border-[#5482b4]/30">
                          {blog.category || 'General'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(blog)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                            blog.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                          }`}
                          title="Click to toggle between Published & Draft"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              blog.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                          <span>{blog.status === 'published' ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-white/50 text-[11px]">
                        {formatDate(blog.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Preview Button */}
                          <a
                            href={`${WEBSITE_BASE}/blogs/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition"
                            title="View live on public website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit Button */}
                          <Link
                            to={`/blogs/edit/${blog.id}`}
                            className="p-2 rounded-xl bg-[#5482b4]/20 hover:bg-[#5482b4]/40 text-[#c3e9fe] transition"
                            title="Edit in Studio"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteModal({ open: true, blog })}
                            className="p-2 rounded-xl bg-red-500/15 hover:bg-red-500/30 text-red-400 transition cursor-pointer"
                            title="Delete article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#5482b4]/20 to-[#042558]/50 border border-white/10 flex items-center justify-center mx-auto text-[#c3e9fe] shadow-lg">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="text-base sm:text-lg font-extrabold text-white">
                  {blogs.length === 0 ? 'No Articles in Database' : 'No Matching Articles Found'}
                </div>
                <p className="text-xs text-white/50 max-w-md mx-auto">
                  {blogs.length === 0
                    ? 'Your blog collection is completely clean with 0 default articles. Start writing your first masterpiece now.'
                    : 'No articles match your current search keywords or filters. Clear search to see all posts.'}
                </p>
              </div>
              <Link
                to="/blogs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5482b4] hover:bg-[#5482b4]/90 text-white text-xs font-bold shadow-lg shadow-[#5482b4]/25 transition hover:scale-102"
              >
                <Plus className="w-4 h-4" />
                <span>Compose First Article</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.blog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#042558] border border-white/15 p-6 sm:p-7 rounded-3xl max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Delete Blog Article?</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-white">"{deleteModal.blog.title}"</strong>?
                This will remove the article from MongoDB Atlas and cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, blog: null })}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-lg shadow-red-600/20"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
