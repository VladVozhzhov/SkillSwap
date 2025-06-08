const express = require('express');
const router = express.Router();
const forumControllers = require('../controllers/forumControllers')
const verifyJWT = require('../middleware/verifyJWT');

router
  .route('/forums')
  .get(forumControllers.getAllForums)
  .post(verifyJWT, forumControllers.createForum);

router
  .route('/forums-id')
  .get(forumControllers.getForumById)
  .put(verifyJWT, forumControllers.updateForum)
  .delete(verifyJWT, forumControllers.deleteForum);

module.exports = router;