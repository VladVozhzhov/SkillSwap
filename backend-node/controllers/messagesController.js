const {
  createMessage,
  getMessagesByUser,
  deleteMessage,
  updateMessage,
  ensureUserKeyPair
} = require('../model/Message');

const handlePostMessage = async (req, res) => {
  const { receiverId, body } = req.body;
  if (!receiverId || !body) return res.status(400).json({ error: 'Missing fields' });

  try {
    await ensureUserKeyPair(req.userId);
    await ensureUserKeyPair(receiverId);

    const msg = await createMessage(req.userId, receiverId, body);
    res.status(201).json({ status: 'message sent', message: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const handleGetMessages = async (req, res) => {
  try {
    const messages = await getMessagesByUser(req.userId);
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const handleDeleteMessage = async (req, res) => {
  try {
    await deleteMessage(req.query.id, req.userId);
    res.status(200).json({ status: 'message deleted' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

const handleEditMessage = async (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Missing body' });

  try {
    await updateMessage(req.query.id, req.userId, body);
    res.status(200).json({ status: 'message updated', message: body });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

module.exports = {
    handlePostMessage,
    handleGetMessages,
    handleDeleteMessage,
    handleEditMessage
}