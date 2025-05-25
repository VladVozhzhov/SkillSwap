const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController')

router
    .route('/message')
    .post(messagesController.handlePostMessage)
    .get(messagesController.handleGetMessages)
    .delete(messagesController.handleDeleteMessage)
    .patch(messagesController.handleEditMessage)

module.exports = router;
