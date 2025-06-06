import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { Link } from "react-router-dom";
import GoogleLogin from "./components/GoogleLogin";

export const Login: React.FC = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Log in</h2>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <div className="mb-4">
          <label htmlFor="email" className="block font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="text"
            placeholder="example@email.com"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="1234@!Ab"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition duration-150 mb-4"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex items-center my-2">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>
  
        <div className="flex flex-col space-y-2 items-center">
          <GoogleLogin />
          <Link
            to="/register"
            className="w-full bg-white border-4 border-indigo-700 text-black hover:text-white py-1 rounded hover:bg-indigo-700 disabled:opacity-50 text-center transition duration-150"
          >
            Don't have have an account? Register
          </Link>
        </div>
      </form>
    </div>
  );
};
