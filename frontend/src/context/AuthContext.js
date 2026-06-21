import { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {

  const [token, setToken] = useState(
    () => localStorage.getItem('token')
  );

  const [user, setUser] = useState(
    () => {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    }
  );

  const login = useCallback(async (email, password) => {

    const res = await authAPI.login({
      email,
      password
    });

    const accessToken =
      res.data.access_token ||
      res.data.accessToken;

    localStorage.setItem('token', accessToken);

    setToken(accessToken);

    let userData = null;

    // если backend возвращает user
    if (res.data.user) {
      userData = res.data.user;
    } else {
      // иначе берем из JWT
      userData = parseJwt(accessToken);
    }

    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);

    return userData;

  }, []);

  const logout = useCallback(() => {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);

  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuth: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);