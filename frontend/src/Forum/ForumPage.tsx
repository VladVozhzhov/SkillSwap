import React, { useState } from 'react';
import type { CommentType, ForumType } from '../context/ForumContext';
import { useForum } from '../context/ForumContext';

const ForumPage: React.FC<ForumType> = ({
  id,
  title,
  description,
  createdAt,
  updatedAt,
  comments,
}) => {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { createComment } = useForum();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    await createComment(id, newComment);
    setNewComment('');
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-700 mb-4">{description}</p>
        <div className="text-sm text-gray-500 space-x-2">
          <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Comments</h2>
        {(!comments && (comments = []))}
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment: CommentType) => (
              <li
                key={comment.id}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full text-white flex items-center justify-center font-semibold">
                    {comment.user_id[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">{comment.message}</p>
                    <div className="mt-2 text-xs text-gray-500 space-x-2">
                      <span>User ID: {comment.user_id}</span>
                      <span>•</span>
                      <span>Created: {new Date(comment.createdAt).toLocaleString()}</span>
                      {comment.edited && (
                        <>
                          <span>•</span>
                          <span>Edited: {new Date(comment.updatedAt).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form className="mt-6" onSubmit={handleSubmit}>
          <h3 className="text-xl font-medium mb-2">Add a Comment</h3>
          <textarea
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={4}
            placeholder="Write your comment here…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {submitting ? 'Posting…' : 'Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForumPage;
