import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from storage or default to demo customer
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('helpdesk_token');
      const storedUser = localStorage.getItem('helpdesk_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh profile in background
          const res = await authService.getMe();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('helpdesk_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification fallback to stored user', err);
        }
      } else {
        // Auto-login default demo customer for instant out-of-the-box exploration
        const defaultCustomer = {
          id: 'a0000000-0000-4000-8000-000000000003',
          full_name: 'David Miller',
          email: 'customer@helpdesk.ai',
          role: 'customer',
          avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
        };
        const defaultToken = 'mock-customer-token';
        setUser(defaultCustomer);
        setToken(defaultToken);
        localStorage.setItem('helpdesk_user', JSON.stringify(defaultCustomer));
        localStorage.setItem('helpdesk_token', defaultToken);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { user: loggedInUser, token: authToken } = res.data;
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('helpdesk_user', JSON.stringify(loggedInUser));
    localStorage.setItem('helpdesk_token', authToken);
    return loggedInUser;
  };

  const register = async (fullName, email, password) => {
    const res = await authService.register({ fullName, email, password, role: 'customer' });
    const { user: registeredUser, token: authToken } = res.data;
    setUser(registeredUser);
    setToken(authToken);
    localStorage.setItem('helpdesk_user', JSON.stringify(registeredUser));
    localStorage.setItem('helpdesk_token', authToken);
    return registeredUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('helpdesk_user');
    localStorage.removeItem('helpdesk_token');
  };

  // Demo Persona Switcher (instantly switch role for testing and demonstration)
  const switchDemoRole = (role) => {
    let mockUser;
    let mockToken;
    if (role === 'admin') {
      mockUser = {
        id: 'a0000000-0000-4000-8000-000000000001',
        full_name: 'Sarah Connor (Admin)',
        email: 'admin@helpdesk.ai',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      };
      mockToken = 'mock-admin-token';
    } else if (role === 'agent') {
      mockUser = {
        id: 'a0000000-0000-4000-8000-000000000002',
        full_name: 'Alex Rivera (Agent)',
        email: 'agent@helpdesk.ai',
        role: 'agent',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      };
      mockToken = 'mock-agent-token';
    } else {
      mockUser = {
        id: 'a0000000-0000-4000-8000-000000000003',
        full_name: 'David Miller (Customer)',
        email: 'customer@helpdesk.ai',
        role: 'customer',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      };
      mockToken = 'mock-customer-token';
    }

    setUser(mockUser);
    setToken(mockToken);
    localStorage.setItem('helpdesk_user', JSON.stringify(mockUser));
    localStorage.setItem('helpdesk_token', mockToken);
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res?.data) {
      setUser(res.data);
      localStorage.setItem('helpdesk_user', JSON.stringify(res.data));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'customer',
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

