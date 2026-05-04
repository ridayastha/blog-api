import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Verify user on load or when token changes
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          // Use the specific 'me' endpoint you created in Django
          const res = await api.get('auth/me/');
          setUser(res.data);
        } catch (err) {
          console.error("Token invalid or expired");
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (username, password) => {
    // SimpleJWT endpoint
    const res = await api.post('auth/login/', { username, password });

    // SimpleJWT returns 'access' and 'refresh'
    if (res.data && res.data.access) {
      const accessToken = res.data.access;

      localStorage.setItem('token', accessToken);
      // Optional: store refresh token if you implement refresh logic later
      localStorage.setItem('refreshToken', res.data.refresh);

      setToken(accessToken);

      // Immediately fetch user details after login
      const userRes = await api.get('auth/me/', {
          headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUser(userRes.data);

      return res.data;
    }
    throw new Error('Invalid login response');
  };

  const register = async (data) => {
    // Matches your path('api/v1/auth/register/')
    const res = await api.post('auth/register/', data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
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