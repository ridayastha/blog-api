import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function CreatePost() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', category: '', status: 'draft' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    api.get('categories/')
      .then(res => setCategories(res.data.results || res.data))
      .catch(() => setError('FAILED_TO_FETCH_CATEGORIES'));
  }, []);

  // Memory cleanup for image previews
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    formData.append('excerpt', form.excerpt || '');
    formData.append('status', form.status);

    // Map 'category' state to 'category_id' for the PostListSerializer
    if (form.category) {
      formData.append('category_id', form.category);
    }

    if (imageFile) {
      formData.append('featured_image', imageFile);
    }

    try {
      // Axios handles multipart headers automatically since we're passing formData
      const res = await api.post('posts/', formData);

      // Redirect based on whether it was published or saved as a draft
      if (res.data.status === 'published') {
        navigate(`/post/${res.data.slug}`);
      } else {
        navigate('/my-posts');
      }
    } catch (err) {
      const errorData = err.response?.data;
      // Format DRF error objects into a string for your error HUD
      if (typeof errorData === 'object') {
        const msg = Object.entries(errorData)
          .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
          .join(' | ');
        setError(msg);
      } else {
        setError('CRITICAL_TRANSMISSION_FAILURE');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-8 tracking-tighter uppercase font-mono">CREATE_NEW_LOG</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono break-all">
          [ERROR_LOG]: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IMAGE UPLOAD HUD */}
        <div className="group relative w-full h-56 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden hover:border-blue-500/50 transition-all bg-white/[0.02]">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <p className="text-xs font-mono text-gray-500 mb-2">UPLOAD_FEATURED_IMAGE</p>
              <p className="text-[10px] text-gray-600 font-mono">JPG, PNG, WEBP (MAX 5MB)</p>
            </div>
          )}
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">Entry_Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700 font-bold"
            placeholder="POST_TITLE"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">Category_Target</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none text-gray-300"
            >
              <option value="">UNCATEGORIZED</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">System_Status</label>
            <div className="flex gap-6 h-full items-center px-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="status" value="draft" checked={form.status === 'draft'} onChange={handleChange} className="accent-blue-500" />
                <span className="text-[10px] font-mono text-gray-500 group-hover:text-white transition-colors">DRAFT</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="status" value="published" checked={form.status === 'published'} onChange={handleChange} className="accent-blue-500" />
                <span className="text-[10px] font-mono text-gray-500 group-hover:text-emerald-400 transition-colors">PUBLISH</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">Body_Payload</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={12}
            className="w-full p-5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none font-mono text-sm leading-relaxed"
            placeholder="INITIALIZING_CONTENT_STREAM..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-600/20 text-white"
        >
          {submitting ? 'TRANSMITTING_DATA...' : 'COMMIT_LOG_ENTRY'}
        </button>
      </form>
    </div>
  );
}