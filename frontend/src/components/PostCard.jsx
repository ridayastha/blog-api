import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const date = post.published_at || post.created_at;
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <article className="glass-card p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
            {post.category?.name || 'General'}
          </span>
          {post.is_featured && (
            <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">Featured</span>
          )}
        </div>
        <Link to={`/post/${post.slug}`}>
          <h2 className="text-xl font-bold mt-1 mb-3 hover:text-blue-400 transition-colors">{post.title}</h2>
        </Link>
        <p className="text-gray-400 text-sm line-clamp-3">{post.excerpt || post.content?.substring(0, 150) + '...'}</p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{post.author?.username}</span>
          <span>·</span>
          <span>{formattedDate}</span>
          <span>·</span>
          <span>{post.views} views</span>
        </div>
        <Link to={`/post/${post.slug}`} className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Read →
        </Link>
      </div>
    </article>
  );
}
