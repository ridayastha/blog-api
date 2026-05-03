import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function MyPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('posts/', { params: { author: user.id } })
        .then(res => setPosts(res.data.results || res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handlePublish = async (slug) => {
    try {
      await api.post(`posts/${slug}/publish/`);
      setPosts(posts.map(p => p.slug === slug ? { ...p, status: 'published' } : p));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to publish');
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`posts/${slug}/`);
      setPosts(posts.filter(p => p.slug !== slug));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">My Posts</h1>
        <Link to="/create" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all text-sm">
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">You haven't written any posts yet.</p>
          <Link to="/create" className="text-blue-400 hover:text-blue-300 font-medium">Write your first post →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="glass-card p-5 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <Link to={`/post/${post.slug}`} className="font-bold hover:text-blue-400 transition-colors truncate block">
                  {post.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded-full ${
                    post.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' :
                    post.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {post.status}
                  </span>
                  <span>{post.views} views</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {post.status === 'draft' && (
                  <button onClick={() => handlePublish(post.slug)}
                    className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                    Publish
                  </button>
                )}
                <Link to={`/edit/${post.slug}`}
                  className="px-3 py-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                  Edit
                </Link>
                <button onClick={() => handleDelete(post.slug)}
                  className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
