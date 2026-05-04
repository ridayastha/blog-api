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
      // Backend now allows drafts if the requester is the author
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
    if (!window.confirm('PROTOCOL_REQUEST: Confirm deletion of log entry?')) return;
    try {
      await api.delete(`posts/${slug}/`);
      setPosts(posts.filter(p => p.slug !== slug));
    } catch (err) {
      alert('DELETE_FAILED: Access denied or system error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="font-mono text-blue-500 animate-pulse tracking-[0.3em]">SYNCHRONIZING_DATABASE...</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter font-mono">MY_POSTS</h1>
          <p className="text-[10px] text-gray-500 font-mono">USER_ID: {user?.id || 'ANONYMOUS'}</p>
        </div>
        <Link to="/create" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20">
          + NEW_ENTRY
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
          <p className="text-gray-500 font-mono text-sm mb-4">NO_LOGS_FOUND_IN_SECTOR</p>
          <Link to="/create" className="text-blue-400 hover:text-blue-300 font-mono text-xs uppercase tracking-widest">Initalize_First_Post →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(postItem => (
            <div key={postItem.id} className="glass-card p-5 flex items-center justify-between border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[9px] text-blue-500/50 px-1.5 py-0.5 border border-blue-500/20 rounded">LOG_{postItem.id}</span>

                  {/* DYNAMIC STATUS BADGE */}
                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] border ${
                    postItem.status === 'published' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse'
                  }`}>
                    {postItem.status === 'published' ? '●_LIVE' : '○_DRAFT'}
                  </span>
                </div>

                <Link to={`/post/${postItem.slug}`} className="font-bold text-lg text-gray-100 hover:text-blue-400 transition-colors truncate block mb-2">
                  {postItem.title}
                </Link>

                {/* TELEMETRY BAR */}
                <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-tighter text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-blue-500/50">VIEWS:</span> {postItem.views}
                  </span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-1">
                    <span className="text-blue-500/50">COMMENTS:</span> {postItem.comments_count || 0}
                  </span>
                  <span className="text-gray-700 hidden md:inline">|</span>
                  <span className="hidden md:inline">{new Date(postItem.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {postItem.status !== 'published' && (
                  <button onClick={() => handlePublish(postItem.slug)} title="Publish Entry" className="p-2 hover:bg-emerald-500/10 text-emerald-400 rounded-lg border border-transparent hover:border-emerald-500/20 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </button>
                )}
                <Link to={`/edit/${postItem.slug}`} title="Edit Entry" className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg border border-transparent hover:border-blue-500/20 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </Link>
                <button onClick={() => handleDelete(postItem.slug)} title="Delete Entry" className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg border border-transparent hover:border-red-500/20 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}