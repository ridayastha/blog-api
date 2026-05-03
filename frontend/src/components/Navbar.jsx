import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            BLOG_OS
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link to="/categories" className="text-sm text-gray-300 hover:text-white transition-colors">Categories</Link>

            {isAuthenticated ? (
              <>
                <Link to="/create" className="text-sm text-gray-300 hover:text-white transition-colors">Write</Link>
                <Link to="/my-posts" className="text-sm text-gray-300 hover:text-white transition-colors">My Posts</Link>
                <span className="text-sm text-blue-400 font-medium">{user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
