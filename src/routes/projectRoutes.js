const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
  addMember,
  getProjectMembers
} = require('../controllers/projectController');

router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.delete('/:id', protect, deleteProject);
router.post('/:id/members', protect, addMember);
router.get('/:id/members', protect, getProjectMembers);

module.exports = router;