const pool = require('../config/db');

const getAllComments = async (req, res) => {
  const forumId = req.query.forumId;
  if (!forumId) {
    return res.status(400).json({ error: 'Forum ID is required' });
  }

  try {
    const result = await pool.query(
      `SELECT fc.*, u.name AS user_name
       FROM forum_comments fc
       JOIN users u ON fc.user_id = u.id
       WHERE fc.forum_id = $1
       ORDER BY fc.created_at DESC`,
      [forumId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching comments', error: err });
  }
}

const createComment = async (req, res) => {
  const { message } = req.body;
  const forumId = req.query.forumId;
  if (!forumId || !message) {
    return res.status(400).json({ error: 'Forum ID and message are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO forum_comments (forum_id, user_id, message) VALUES ($1, $2, $3) RETURNING *',
      [forumId, req.userId, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating comment', error: err });
  }
}

const updateComment = async (req, res) => {
  const commentId = req.query.commentId;
  const { message } = req.body;

  if (!commentId) {
    return res.status(400).json({ error: 'Comment ID is required' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const updateResult = await pool.query(
      'UPDATE forum_comments SET message = $1 WHERE id = $2 RETURNING *',
      [message, commentId]
    );
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const updatedComment = updateResult.rows[0];

    const userResult = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [updatedComment.user_id]
    );
    const userName = userResult.rows[0]?.name || '';

    res.status(200).json({ ...updatedComment, user_name: userName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating comment', error: err });
  }
}

const deleteComment = async (req, res) => {
  const commentId = req.query.commentId;
  if (!commentId) {
    return res.status(400).json({ error: 'Comment ID is required' });
  }

  try {
    const result = await pool.query('DELETE FROM forum_comments WHERE id = $1 RETURNING *', [commentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting comment', error: err });
  }
}

module.exports = {
  getAllComments,
  createComment,
  updateComment,
  deleteComment
};
