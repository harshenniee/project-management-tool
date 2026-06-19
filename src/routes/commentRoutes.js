const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  addComment,
  getCommentsByTask,
  deleteComment
} = require('../controllers/commentController');

router.post('/', protect, addComment);
router.get('/task/:taskId', protect, getCommentsByTask);
router.delete('/:id', protect, deleteComment);

module.exports = router;