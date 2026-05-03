import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function PostCard({ post }) {
  const [loaded, setLoaded] = useState(false);

  const date = post.published_at || post.created_at;
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <article className="glass-card overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-300">

      {/* IMAGE SECTION */}
      <div className="relative h-48 w-full overflow-hidden bg-black/20">

        {/* skeleton */}
        {!loaded && (
          <div className="absolute inset-0 bg-gray-900/40 animate-pulse" />
        )}

        {/* image */}
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`
              w-full h-full object-cover transition-all duration-700
              ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}
              hover:scale-110
            `}
          />
        )}

        {/* fallback if no image */}
        {!post.featured_image && (
          <div className="w-full h-full bg-gradient-to-r from-blue-600/20 to-emerald-600/20" />
        )}
      </div>

      {/* CONTENT */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>

          {/* CATEGORY */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
              {post.category?.name || 'General'}
            </span>

            {post.is_featured && (
              <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* TITLE */}
          <Link to={`/post/${post.slug}`}>
            <h2 className="text-xl font-bold mt-1 mb-3 hover:text-blue-400 transition-colors">
              {post.title}
            </h2>
          </Link>

          {/* EXCERPT */}
          <p className="text-gray-400 text-sm line-clamp-3">
            {post.excerpt || post.content?.substring(0, 150) + '...'}
          </p>
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex items-center justify-between text-xs text-gray-500">

          <div className="flex items-center gap-2">
            <span>{post.author?.username}</span>
            <span>·</span>
            <span>{formattedDate}</span>
            <span>·</span>
            <span>{post.views} views</span>
          </div>

          <Link
            to={`/post/${post.slug}`}
            className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
}