const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  assignTask,
  deleteTask
} = require('../controllers/taskController');

router.post('/', protect, createTask);
router.get('/project/:projectId', protect, getTasksByProject);
router.patch('/:id/status', protect, updateTaskStatus);
router.patch('/:id/assign', protect, assignTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;