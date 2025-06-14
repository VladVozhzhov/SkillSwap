import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForum, type ForumType } from '../context/ForumContext';
import ForumPage from './ForumPage';
import { useAuth } from '../context/AuthContext';

const Forum: React.FC = () => {
  const { fetchForums, fetchForumById, forums } = useForum();
  const { logout, authed } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const forumId = searchParams.get('forum');

  useEffect(() => {
    setLoading(true);
    fetchForums().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!forumId) return;
    setLoading(true);
    fetchForumById(forumId).finally(() => setLoading(false));
  }, [forumId]);

  useEffect(() => {
    const uniqueForums = forums.filter((forum, index, self) => 
      index === self.findIndex((f) => f.id === forum.id)
    );
    if (uniqueForums.length > 1) {
      fetchForums().finally(() => setLoading(false));
    }
  }, [forums]);

  const handleLogout = (): void => {
    setLoading(true);
    try {
      logout();
      fetchForums();
    } finally {
      setLoading(false);
    }
  }

  const handlePopover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const popoverContent = document.getElementById('logout-popover');
    if (popoverContent) {
      popoverContent.classList.toggle('hidden');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading forums…</p>
      </div>
    );
  }

  if (forumId) {
    const selected = forums.find((f) => f.id === forumId);
    if (!selected) {
      return (
        <div className="max-w-xl mx-auto p-6 text-center">
          <p className="text-red-500">Forum not found or invalid ID.</p>
          <Link
            to="/forum"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to all forums
          </Link>
        </div>
      );
    }
    return (
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <Link to="/forum" className="inline-block mb-6 text-blue-600 hover:underline">
          ← Back to all forums
        </Link>
        <ForumPage {...selected} handleLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Forums</h1>
        <Link
          to="/create"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create Forum
        </Link>
        {authed && (
          <div className="relative">
            <button
              onClick={handlePopover}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
            >
              Logout
            </button>
            <div
              id="logout-popover"
              className="hidden absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg"
            >
              <p className="p-4 text-gray-700">Are you sure you want to logout?</p>
              <div className="flex justify-end p-2 space-x-2">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes
                </button>
                <button
                  onClick={handlePopover}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {forums.length === 0 ? (
        <p className="text-gray-500">No forums available.</p>
      ) : (
        <ul className="space-y-4">
          {forums.map((forum: ForumType) => (
            <li key={forum.id} className="border rounded-lg bg-white hover:shadow-md transition">
              <Link to={`?forum=${forum.id}`} className="block p-4">
                <h2 className="text-xl font-semibold text-blue-600">{forum.title}</h2>
                <p className="text-gray-700 mt-1 truncate">{forum.description}</p>
                <div className="mt-2 text-sm text-gray-500 flex space-x-2">
                  <span>Created: {forum.createdAt ? new Date(forum.createdAt).toLocaleDateString() : ''}</span>
                  <span>•</span>
                  <span>Updated: {forum.updatedAt ? new Date(forum.updatedAt).toLocaleDateString() : ''}</span> 
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Forum;
