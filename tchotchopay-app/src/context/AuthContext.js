import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';
import { saveToken, saveUser, getToken, getUser, clearAll } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const savedUser = await getUser();
        if (token && savedUser) setUser(savedUser);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, user: userData } = res.data;
    await saveToken(token);
    await saveUser(userData);
    setUser(userData);
    return userData;
  };

  const register = async (payload) => {
    const res = await registerUser(payload);
    const { token, user: userData } = res.data;
    await saveToken(token);
    await saveUser(userData);
    setUser(userData);
    return userData;
  };

  const updateUser = async (fields) => {
    const updated = { ...user, ...fields };
    await saveUser(updated);
    setUser(updated);
  };

  const logout = async () => {
    await clearAll();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
