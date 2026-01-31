import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SuperAdminContextType {
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const SuperAdminContext = createContext<SuperAdminContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

const ADMIN_CREDS = {
  email: 'joaovicrengel@gmail.com',
  pass: 'Acesso4321@@'
};

export const SuperAdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Persistência simples de sessão para o admin
    const isAuth = localStorage.getItem('super_admin_auth') === 'true';
    setIsAuthenticated(isAuth);
  }, []);

  const login = (email: string, pass: string) => {
    if (email === ADMIN_CREDS.email && pass === ADMIN_CREDS.pass) {
      setIsAuthenticated(true);
      localStorage.setItem('super_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('super_admin_auth');
    navigate('/admin/login');
  };

  return (
    <SuperAdminContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </SuperAdminContext.Provider>
  );
};

export const useSuperAdmin = () => useContext(SuperAdminContext);
