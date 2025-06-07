const express = require('express');
const router = express.Router();
const commentControllers = require('../controllers/commentControllers');
const verifyJWT = require('../middleware/verifyJWT');

router
    .get('/', commentControllers.getAllComments)
    .use(verifyJWT)
    .post('/', commentControllers.createComment)
    .put('/', commentControllers.updateComment)
    .delete('/', commentControllers.deleteComment);

module.exports = router;
