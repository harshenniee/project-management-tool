const Comment = require('../models/Comment');

// Add a comment to a task
const addComment = async (req, res) => {
  try {
    const { text, taskId } = req.body;

    const comment = await Comment.create({
      text,
      task: taskId,
      author: req.userId
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email');

    res.status(201).json({ message: 'Comment added! ✅', comment: populatedComment });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

// Get all comments for a task
const getCommentsByTask = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });

    res.json(comments);

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found!' });
    }

    // Only author can delete their comment
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own comments!' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted! ✅' });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!', error });
  }
};

module.exports = { addComment, getCommentsByTask, deleteComment };