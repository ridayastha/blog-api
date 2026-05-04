import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function EditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // State Management
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    status: 'draft'
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // READ: Hydrating the form with existing data
    Promise.all([
      api.get(`posts/${slug}/`),
      api.get('categories/')
    ]).then(([postRes, catRes]) => {
      const post = postRes.data;
      setForm({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        category: post.category?.id || '',
        status: post.status,
      });
      setExistingImage(post.featured_image);
      setCategories(catRes.data.results || catRes.data);
    }).catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // UPDATE: Using FormData to prevent "Unsupported Media Type" and image errors
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    formData.append('excerpt', form.excerpt);
    formData.append('status', form.status);

    if (form.category) {
      formData.append('category_id', form.category);
    }

    // Only append image if a new one is selected
    if (imageFile) {
      formData.append('featured_image', imageFile);
    }

    try {
      // PATCH allows us to update only the modified fields
      const res = await api.patch(`posts/${slug}/`, formData);
      navigate(`/post/${res.data.slug}`);
    } catch (err) {
      setError(typeof err.response?.data === 'object'
        ? JSON.stringify(err.response.data)
        : 'SYSTEM_FAILURE: Unable to patch log entry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="font-mono text-blue-500 animate-pulse tracking-[0.3em]">RECOVERING_LOG_DATA...</div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter uppercase font-mono">EDIT_LOG_ENTRY</h1>
        <p className="text-[10px] font-mono text-gray-500 mt-1">SLUG_ID: {slug}</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono">
          [ERROR_REPORT]: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IMAGE PREVIEW HUD */}
        <div className="group relative w-full h-48 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden hover:border-blue-500/50 transition-all bg-white/[0.02]">
          {preview || existingImage ? (
            <img src={preview || existingImage} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center font-mono text-[10px] text-gray-500">NO_MEDIA_DETECTED</div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <p className="text-white font-mono text-xs uppercase tracking-widest">Update_Image_Stream</p>
          </div>
          <input type="file" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        {/* TITLE */}
        <div>
          <label className="block text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">Entry_Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-bold placeholder:text-gray-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CATEGORY */}
          <div>
            <label className="block text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">Category_Target</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none bg-slate-900 font-mono text-xs"
            >
              <option value="">UNCATEGORIZED</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">System_Status</label>
            <div className="flex gap-6 h-full items-center px-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="status" value="draft" checked={form.status === 'draft'} onChange={handleChange} className="accent-blue-500" />
                <span className="text-[10px] font-mono text-gray-500 group-hover:text-white">DRAFT</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="status" value="published" checked={form.status === 'published'} onChange={handleChange} className="accent-blue-500" />
                <span className="text-[10px] font-mono text-gray-500 group-hover:text-emerald-400">PUBLISH</span>
              </label>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div>
          <label className="block text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">Body_Payload</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={12}
            className="w-full p-5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none font-mono text-sm leading-relaxed"
          />
        </div>

        {/* SUBMIT */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 border border-white/10 rounded-xl font-mono text-[10px] uppercase hover:bg-white/5 transition-all"
          >
            Abort
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            {submitting ? 'TRANSMITTING_PATCH...' : 'CONFIRM_PATCH_ENTRY'}
          </button>
        </div>
      </form>
    </div>
  );
}