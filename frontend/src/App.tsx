import React, { type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { Login } from "./Login";
import { Messenger } from "./Messenger";

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { authed, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return authed ? children : <Navigate to="/login" replace />;
};

const AuthGate: React.FC = () => {
  const { authed, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return <Navigate to={authed ? "/messenger" : "/login"} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/messenger"
            element={
              <ProtectedRoute>
                <Messenger />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<AuthGate />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};