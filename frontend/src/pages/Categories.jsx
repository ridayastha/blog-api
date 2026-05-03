import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    api.get('categories/')
      .then(res => setCategories(res.data.results || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const selectCategory = (slug) => {
    setSelectedSlug(slug);
    setPostsLoading(true);
    api.get(`categories/${slug}/posts/`)
      .then(res => setPosts(res.data.results || res.data))
      .catch(err => console.error(err))
      .finally(() => setPostsLoading(false));
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-8">Categories</h1>

      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => selectCategory(cat.slug)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedSlug === cat.slug
                ? 'bg-blue-600 text-white'
                : 'glass-card hover:bg-white/10 text-gray-300'
            }`}
          >
            {cat.name}
            <span className="ml-2 text-xs opacity-60">({cat.posts_count})</span>
          </button>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-gray-500">No categories yet.</p>
      )}

      {selectedSlug && (
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-300">
            Posts in "{categories.find(c => c.slug === selectedSlug)?.name}"
          </h2>
          {postsLoading ? (
            <div className="text-center py-10 text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <p className="text-gray-500">No published posts in this category.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
