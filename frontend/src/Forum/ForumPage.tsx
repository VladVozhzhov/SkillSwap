import React, { useState, useEffect } from 'react';
import type { CommentType } from '../context/ForumContext';
import { useForum } from '../context/ForumContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaRegEdit, FaTrash } from 'react-icons/fa';

type ForumPageProps = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  authorName?: string;
  comments: CommentType[];
  handleLogout: () => void;
}

const ForumPage: React.FC<ForumPageProps> = (props) => {
  const {
    id,
    title,
    description,
    createdAt = (props as any).createdAt || (props as any).created_at,
    updatedAt = (props as any).updatedAt || (props as any).updated_at,
    createdBy = (props as any).createdBy || (props as any).created_by,
    authorName = (props as any).authorName || (props as any).author_name,
    handleLogout
  } = props;

  const {
    forums,
    getComments,
    createComment,
    updateForum,
    deleteForum,
    updateComment,
    deleteComment
  } = useForum();

  const forum = forums.find(f => f.id === id);
  const comments = forum?.comments || [];

  useEffect(() => {
    if (id && (!forum || !forum.comments || forum.comments.length === 0)) {
      getComments(id);
    }
  }, [id, forum, getComments]);

  const mappedComments = comments.map((comment: any) => ({
    ...comment,
    createdAt: comment.createdAt || comment.created_at,
    updatedAt: comment.updatedAt || comment.updated_at,
  }));

  const [editMode, setEditMode] = useState(false);
  const [editForum, setEditForum] = useState<{ title: string; description: string } | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editComment, setEditComment] = useState<CommentType | null>(null);
  const [editedComment, setEditedComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { userId, username, authed } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    await createComment(id, newComment);
    setNewComment('');
    setSubmitting(false);
  };

  const handleEditForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForum?.title || !editForum?.description) {
      return setError('Please fill out all fields before submitting.');
    }
    const updatedForum = {
      ...props,
      title: editForum.title,
      description: editForum.description,
    };
    await updateForum(id, updatedForum);
    setEditMode(false);
  };

  const handleStartEdit = () => {
    setEditForum({
      title,
      description,
    });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditForum(null);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await deleteForum(id);
      navigate('/forum');
    } catch (err: any) {
      setError(err.message || 'Failed to delete forum.');
    }
  };

  const handleStartEditComment = (commentId: string) => {
    const comment = mappedComments.find(c => c.id === commentId);
    if (comment) {
      setEditComment(comment);
      setEditedComment(comment.message);
    }
  };

  const handleEditCommentSubmit = async () => {
    if (editComment && editedComment.trim()) {
      await updateComment(id, editComment.id, { ...editComment, message: editedComment });
      setEditComment(null);
      setEditedComment('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  const handlePopover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const popoverContent = document.getElementById('logout-popover');
    if (popoverContent) {
      popoverContent.classList.toggle('hidden');
    }
  };

  return (
    <div className="space-y-6">
      {authed && (
        <div className="flex justify-end">
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
                  onClick={() => {
                    handleLogout();
                    handlePopover({ preventDefault: () => {} } as any);
                  }}
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
        </div>
      )}
      {/* Forum Info */}
      <div className="bg-white shadow rounded-lg p-6">
        {editMode ? (
          <form onSubmit={handleEditForum} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Title</label>
              <input
                className="w-full border rounded-lg p-2"
                value={editForum?.title || ''}
                onChange={e => setEditForum(f => f ? { ...f, title: e.target.value } : f)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded-lg p-2"
                rows={3}
                value={editForum?.description || ''}
                onChange={e => setEditForum(f => f ? { ...f, description: e.target.value } : f)}
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="space-x-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              <button type="button" className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={handleCancelEdit}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2">
            <div>
              <span className="text-2xl text-gray-600 italic">{authorName || 'Anonymous'}</span>
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-gray-700 mb-4">{description}</p>
              <div className="text-sm text-gray-500 space-x-2">
                <span>Created: {createdAt ? new Date(createdAt).toLocaleDateString() : ''}</span>
                <span>•</span>
                <span>Updated: {updatedAt ? new Date(updatedAt).toLocaleDateString() : ''}</span>
              </div>
            </div>
            {createdBy === userId && (
              <div className="flex flex-col align-end space-y-2">
                <button
                  className="mt-4 px-4 py-2 w-1/4 self-end bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={handleStartEdit}
                >
                  Edit
                </button>
                <button
                  className="mt-4 px-4 py-2 w-1/4 self-end bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Comments</h2>
        <form className="mt-6" onSubmit={handleSubmit}>
          <h3 className="text-xl font-medium mb-2">Add a Comment</h3>
          <textarea
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={4}
            placeholder="Write your comment here…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting…' : 'Post Comment'}
          </button>
        </form>

        {mappedComments.length === 0 ? (
          <p className="text-gray-500 mt-8">No comments yet.</p>
        ) : (
          <ul className="space-y-4 mt-8">
            {mappedComments.map((comment: CommentType) => (
              <li key={comment.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">{comment.createdBy}</h3>
                    </div>
                    {editComment?.id === comment.id ? (
                      <>
                        <textarea
                          className="w-full border rounded-lg p-2"
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                        />
                        <div className="space-x-2 mt-2">
                          <button
                            type="button"
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150 cursor-pointer"
                            onClick={handleEditCommentSubmit}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 transition duration-150 cursor-pointer"
                            onClick={() => {
                              setEditComment(null);
                              setEditedComment('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-800">{comment.message}</p>
                    )}
                    <div className="mt-2 text-xs text-gray-500 space-x-2">
                      <span>•</span>
                      <span>Created: {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</span>
                      {comment.edited && (
                        <>
                          <span>•</span>
                          <span>Edited: {comment.updatedAt ? new Date(comment.updatedAt).toLocaleString() : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {comment.createdBy === username && (
                    <div className="flex flex-col space-y-1 items-end">
                      <FaRegEdit className="cursor-pointer text-gray-500 hover:text-blue-600" onClick={() => handleStartEditComment(comment.id)} />
                      <FaTrash className="cursor-pointer text-red-500 hover:text-red-700" onClick={() => handleDeleteComment(comment.id)} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ForumPage;
