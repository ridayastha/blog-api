import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function EditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', category: '', status: 'draft' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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
      setCategories(catRes.data.results || catRes.data);
    }).catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.category) delete payload.category;
      else payload.category = parseInt(payload.category);
      const res = await api.put(`posts/${slug}/`, payload);
      navigate(`/post/${res.data.slug}`);
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-8">Edit Post</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Excerpt</label>
          <input name="excerpt" value={form.excerpt} onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-900">
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
          <textarea name="content" value={form.content} onChange={handleChange} required rows={15}
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value="draft" checked={form.status === 'draft'} onChange={handleChange} className="accent-blue-500" />
              <span className="text-sm">Draft</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value="published" checked={form.status === 'published'} onChange={handleChange} className="accent-blue-500" />
              <span className="text-sm">Published</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all disabled:opacity-50">
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
