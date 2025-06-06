const express = require('express');
const router = express.Router();
const forumControllers = require('../controllers/forumControllers')

router
  .route('/forums')
  .get(forumControllers.getAllForums)
  .post(forumControllers.createForum);

router
  .route('/forums-id')
  .get(forumControllers.getForumById)
  .put(forumControllers.updateForum)
  .delete(forumControllers.deleteForum);

module.exports = router;