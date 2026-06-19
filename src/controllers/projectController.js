const Project = require('../models/Project');
const User = require('../models/User');

// Create a new project
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.userId,
      members: [req.userId] // owner is automatically a member
    });

    res.status(201).json({ message: 'Project created! ✅', project });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

// Get all projects for logged-in user
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.userId });
    res.json(projects);

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

// Get single project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found!' });
    }

    res.json(project);

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found!' });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can delete this project!' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted! ✅' });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

// Add a member to project by email
const addMember = async (req, res) => {
  try {
    const { email } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found!' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'No user found with that email!' });
    }

    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member!' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    res.json({ message: 'Member added! ✅' });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

// Get project members (with name/email)
const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found!' });
    }

    res.json(project.members);

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
  addMember,
  getProjectMembers
};