const Task = require('../models/Task');
const Project = require('../models/Project');

// Create a new task inside a project
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found!' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.userId
    });

    res.status(201).json({ message: 'Task created! ✅', task });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

// Get all tasks for a specific project
const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(tasks);

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

// Update task status (To Do / In Progress / Done)
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found!' });
    }

    res.json({ message: 'Task status updated! ✅', task });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

// Assign task to a user
const assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found!' });
    }

    res.json({ message: 'Task assigned! ✅', task });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found!' });
    }

    res.json({ message: 'Task deleted! ✅' });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  assignTask,
  deleteTask
};