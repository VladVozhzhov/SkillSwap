const pool = require('../config/db');

const getAllForums = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM forums ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching forums' });
  }
}

const getForumById = async (req, res) => {
  const forumId = req.query.id;
  if (isNaN(forumId)) {
    return res.status(400).json({ error: 'Invalid forum ID' });
  }

  try {
    const result = await pool.query('SELECT * FROM forums WHERE id = $1', [forumId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Forum not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching forum' });
  }
}

const createForum = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.userId;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO forums (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [title, description, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating forum' });
  }
}

const updateForum = async (req, res) => {
  const forumId = req.query.id;
  const { title, description } = req.body;
  const userId = req.userId;

  if (isNaN(forumId)) {
    return res.status(400).json({ error: 'Invalid forum ID' });
  }

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const userIsCreator = await pool.query(
    'SELECT id FROM forums WHERE id = $1 AND created_by = $2',
    [forumId, userId]
  );

  if (userIsCreator.rows.length === 0) {
    return res.status(403).json({ error: 'Not authorized to update this forum' });
  }

  try {
    const result = await pool.query(
      'UPDATE forums SET title = $1, description = $2 WHERE id = $3 AND created_by = $4 RETURNING *',
      [title, description, forumId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Forum not found or not authorized' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating forum' });
  }
}

const deleteForum = async (req, res) => {
  const forumId = req.query.id;
  const userId = req.userId;

  if (isNaN(forumId)) {
    return res.status(400).json({ error: 'Invalid forum ID' });
  }

  const userIsCreator = await pool.query(
    'SELECT id FROM forums WHERE id = $1 AND created_by = $2',
    [forumId, userId]
  );

  if (userIsCreator.rows.length === 0) {
    return res.status(403).json({ error: 'Not authorized to delete this forum' });
  }

  try {
    await pool.query('DELETE FROM forums WHERE id = $1 AND created_by = $2', [forumId, userId]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting forum' });
  }
}

module.exports = {
  getAllForums,
  getForumById,
  createForum,
  updateForum,
  deleteForum
};