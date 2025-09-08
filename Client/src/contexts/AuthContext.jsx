import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // For demo purposes, we'll just set a mock user
          // In a real app, you would validate the token with your backend
          setUser({
            id: '1',
            name: 'Demo User',
            email: 'demo@accountx.com',
            role: 'admin',
          });
        }
      } catch (err) {
        console.error('Auth status check failed:', err);
        setError('Failed to authenticate');
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would call your API
      // const response = await authService.login(email, password);
      
      // For demo purposes, we'll just set a mock token and user
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('authToken', mockToken);
      
      setUser({
        id: '1',
        name: 'Demo User',
        email,
        role: 'admin',
      });
      
      navigate('/');
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/login');
  };
  
  // Check if user has a specific permission
  const hasPermission = (permission) => {
    // In a real app, you would check against user permissions
    // For demo, we'll assume admin has all permissions
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    // Check specific permissions logic would go here
    return false;
  };
  
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasPermission,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};