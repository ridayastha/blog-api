import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function PostDetail() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`posts/${slug}/`)
      .then(res => {
        setPost(res.data);
        // Increment views
        api.post(`posts/${slug}/increment_views/`).catch(() => {});
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post('comments/', { post: post.id, content: comment });
      setComment('');
      // Refresh post to get new comments
      const res = await api.get(`posts/${slug}/`);
      setPost(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`posts/${slug}/`);
      navigate('/');
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!post) return <div className="text-center py-20 text-gray-500">Post not found</div>;

  const approvedComments = (post.comments || []).filter(c => c.status === 'approved');
  const isAuthor = user && post.author && user.id === post.author.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Post Header */}
      <article>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
              {post.category?.name || 'General'}
            </span>
            {post.tags?.map(tag => (
              <span key={tag.id} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-gray-400">
                #{tag.name}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>By {post.author?.username}</span>
            <span>·</span>
            <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>{post.views} views</span>
            <span>·</span>
            <span>{post.comments_count} comments</span>
          </div>

          {isAuthor && (
            <div className="flex gap-3 mt-4">
              <Link to={`/edit/${post.slug}`} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition-all">
                Edit
              </Link>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                Delete
              </button>
            </div>
          )}
        </div>

        {post.featured_image && (
          <img src={post.featured_image} alt={post.title} className="w-full rounded-2xl mb-8 object-cover max-h-96" />
        )}

        {/* Post Content */}
        <div className="prose prose-invert prose-lg max-w-none mb-12 text-gray-300 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      {/* Comments Section */}
      <section className="border-t border-white/10 pt-8">
        <h2 className="text-2xl font-bold mb-6">Comments ({approvedComments.length})</h2>

        {isAuthenticated && (
          <form onSubmit={handleComment} className="mb-8">
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}

        {approvedComments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-6">
            {approvedComments.map(c => (
              <CommentItem key={c.id} comment={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CommentItem({ comment }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-sm text-blue-400">{comment.author?.username}</span>
        <span className="text-xs text-gray-600">
          {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      <p className="text-gray-300 text-sm">{comment.content}</p>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 mt-4 space-y-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
