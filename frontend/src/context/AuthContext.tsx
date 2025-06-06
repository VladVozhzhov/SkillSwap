import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type AuthContextType = {
  authed: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void;
  loginGoogle: (idToken: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authed, setAuthed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:3500/api/auth/check", { 
          withCredentials: true 
        });
        setAuthed(true);
      } catch (error: any) {
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await axios.post(
        "http://localhost:3500/api/auth/login", 
        { email, password }, 
        { withCredentials: true }
      );
      setAuthed(true);
      navigate('/forum');
    } catch (error: any) {
      console.error("❌ Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      await axios.post(
        'http://localhost:3500/api/auth/register',
        { email, username, password },
        { withCredentials: true }
      )
      setAuthed(true);
      navigate('/forum');
    } catch(err: any) {
      console.error('register error: ', err.message)
    }
  }

  const logout = async () => {
    await axios.get("http://localhost:3500/api/auth/logout", { withCredentials: true });
    setAuthed(false);
    navigate('/');
  };

  const loginGoogle = async (idToken: string) => {
    try {
      await axios.post(
        "http://localhost:3500/api/auth/google",
        { idToken },
        { withCredentials: true }
      )
      setAuthed(true)
      navigate('/forum');
    } catch(err: any) {
      console.error('error while logging in with google', err.message)
    }
  }

  return (
    <AuthContext.Provider value={{ authed, loading, login, register, logout, loginGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}