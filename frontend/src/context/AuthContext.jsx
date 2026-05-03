import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      // Try to get current user info
      api.get('users/')
        .then(res => {
          const users = res.data.results || res.data;
          // We stored user id on login
          const userId = localStorage.getItem('userId');
          const currentUser = userId ? users.find(u => u.id === parseInt(userId)) : users[0];
          setUser(currentUser || null);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const res = await api.post('auth/login/', { username, password });
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.id);
      setToken(res.data.token);
      setUser({ id: res.data.id, username: res.data.username, email: res.data.email });
      return res.data;
    }
    throw new Error('No token received');
  };

  const register = async (data) => {
    const res = await api.post('auth/register/', data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
