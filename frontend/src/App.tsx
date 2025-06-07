import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./Login";
import { Register } from "./Register";
import NotFound from "./components/NotFound";
import Home from "./Home";
import Forum from "./Forum/Forum";
import CreateForum from "./Forum/CreateForum";
import { ForumProvider } from "./context/ForumContext";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ForumProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create" element={<CreateForum />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ForumProvider>
    </BrowserRouter>
  );
};