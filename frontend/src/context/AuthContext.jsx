import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('canchaya_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('canchaya_token'));
  const [loading, setLoading] = useState(true);

  // Al montar el componente, validar si el token almacenado sigue siendo válido
  useEffect(() => {
    const verificarSesion = async () => {
      const storedToken = localStorage.getItem('canchaya_token');
      if (storedToken) {
        try {
          const data = await authService.getPerfil();
          if (data && data.usuario) {
            setUser(data.usuario);
            localStorage.setItem('canchaya_user', JSON.stringify(data.usuario));
          }
        } catch (error) {
          console.warn('Sesión no válida o expirada:', error);
          localStorage.removeItem('canchaya_token');
          localStorage.removeItem('canchaya_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verificarSesion();
  }, []);

  const login = async (correo, password) => {
    const data = await authService.login({ correo, password });
    if (data.token && data.usuario) {
      setToken(data.token);
      setUser(data.usuario);
      localStorage.setItem('canchaya_token', data.token);
      localStorage.setItem('canchaya_user', JSON.stringify(data.usuario));
    }
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Error al cerrar sesión en el servidor:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('canchaya_token');
      localStorage.removeItem('canchaya_user');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('canchaya_user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.rol === 'administrador';
  const isPropietario = user?.rol === 'propietario';
  const isCliente = user?.rol === 'cliente';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isPropietario,
        isCliente,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
