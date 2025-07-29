import { createContext, useContext, useState, useEffect } from 'react';
import { login, register, logout } from '../api/auth'; // Named imports matching your auth.js

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.token) {
        setUser(user);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const loginUser = async (credentials) => {
    const user = await login(credentials); // Directly use imported function
    setUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const registerUser = async (userData) => {
    return await register(userData); // Directly use imported function
  };

  const logoutUser = () => {
    logout(); // Directly use imported function
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        loginUser,
        registerUser,
        logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);