import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // 1. Fetch Featured Posts (Specific for the top section)
  const fetchFeatured = async () => {
    try {
      const res = await api.get('posts/', { params: { is_featured: true, status: 'published' } });
      const results = res.data.results || res.data;
      setFeaturedPosts(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error("Failed to fetch featured posts:", err);
    }
  };

  // 2. Fetch Regular Posts for the feed
  const fetchPosts = useCallback(async (pageNum = 1, query = '') => {
    setLoading(true);
    try {
      const params = { status: 'published', page: pageNum };
      if (query) params.search = query;

      const res = await api.get('posts/', { params });
      const results = res.data.results || res.data;
      setPosts(results);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
    fetchPosts(page, search);
  }, [page, search, fetchPosts]);

  // --- DERIVED STATE WITH LIMITS ---

  // Limit Featured to exactly 3
  const displayedFeatured = featuredPosts.slice(0, 3);

  // Filter out featured from feed AND limit to exactly 6
  const regularPosts = posts
    .filter(post => !featuredPosts.some(f => f.id === post.id))
    .slice(0, 6);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* HEADER & SEARCH */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Discover Stories.
            </h1>
            <p className="text-gray-400 text-lg">Insights, thoughts, and trends from our creative community.</p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search inspiration..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600 shadow-2xl"
            />
          </form>
        </header>

        {/* FEATURED POSTS SECTION (Max 3) */}
        {!search && displayedFeatured.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Featured Stories
              </h3>
              <div className="h-px flex-1 bg-white/5 mx-6 hidden sm:block"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {displayedFeatured.map(post => (
                <div key={post.id} className="transition-all duration-300 hover:translate-y-[-8px]">
                  <PostCard post={post} isFeatured={true} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LATEST FEED SECTION (Max 6) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">
              {search ? `Search Results` : 'Latest Feed'}
            </h3>
            <div className="h-px flex-1 bg-white/5 mx-6 hidden sm:block"></div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-80 bg-white/5 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : (search ? posts : regularPosts).length === 0 ? (
            <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]">
              <p className="text-gray-500 text-xl font-medium">No results matched your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {(search ? posts : regularPosts).map(post => (
                <div key={post.id} className="transition-all duration-300 hover:translate-y-[-8px]">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}