import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';
import PostCard from '../components/PostCard';



export default function Home() {
  const [posts, setPosts] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);



  const fetchPosts = (pageNum = 1, query = '') => {
    setLoading(true);
    const params = { status: 'published', page: pageNum };
    if (query) params.search = query;
    api.get('posts/', { params })
      .then(res => {
        const results = res.data.results || res.data;
        setPosts(results);
        setHasNext(!!res.data.next);
        if (pageNum === 1 && !query) {
          const feat = results.find(p => p.is_featured);
          setFeatured(feat || results[0] || null);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts(page, search);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts(1, search);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero / Featured Post */}
      {featured && !search && page === 1 && (
        <section className="mb-12">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 pointer-events-none" />
            <div className="relative z-10">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                {featured.is_featured ? '★ Featured' : 'Latest'}
              </span>
              <h1 className="text-3xl md:text-5xl font-black mt-3 mb-4 leading-tight">{featured.title}</h1>
              <p className="text-gray-400 text-lg max-w-2xl mb-6">
                {featured.excerpt || featured.content?.substring(0, 200) + '...'}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                <span>By {featured.author?.username}</span>
                <span>·</span>
                <span>{featured.views} views</span>
              </div>
              <a href={`/post/${featured.slug}`} className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all">
                Read Article →
              </a>
            </div>
          </div>
        </section>
      )}



      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all">
            Search
          </button>
        </div>
      </form>

      {/* Posts Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-10">
        {page > 1 && (
          <button onClick={() => setPage(p => p - 1)} className="px-5 py-2 glass-card hover:bg-white/10 transition-colors">
            ← Previous
          </button>
        )}
        {hasNext && (
          <button onClick={() => setPage(p => p + 1)} className="px-5 py-2 glass-card hover:bg-white/10 transition-colors">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
