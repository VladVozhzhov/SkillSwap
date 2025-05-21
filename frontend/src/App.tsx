import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./auth";
import { Login } from "./Login";
import { Messenger } from "./Messenger";

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { userId } = useAuth();
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return children;
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
          <Route path="*" element={<Navigate to="/messenger" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
