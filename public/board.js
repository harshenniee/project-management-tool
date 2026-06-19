const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';
}

const currentUser = JSON.parse(localStorage.getItem('user'));

// Get projectId from URL (e.g board.html?projectId=123)
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('projectId');

const todoColumn = document.getElementById('todoColumn');
const inProgressColumn = document.getElementById('inProgressColumn');
const doneColumn = document.getElementById('doneColumn');

let currentTaskId = null; // tracks which task modal is open
let projectMembers = []; // cached list of {_id, name, email}

// ---------- TASKS ----------

// Fetch and display tasks in correct columns
async function loadTasks() {
  try {
    const response = await fetch(`http://localhost:5000/api/tasks/project/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const tasks = await response.json();

    todoColumn.innerHTML = '';
    inProgressColumn.innerHTML = '';
    doneColumn.innerHTML = '';

    tasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'task-card';

      const assignedName = task.assignedTo ? findMemberName(task.assignedTo) : null;

      card.innerHTML = `
        <h4>${task.title}</h4>
        <p>${task.description || ''}</p>
        ${assignedName ? `<div class="assigned-badge">👤 ${assignedName}</div>` : ''}
        <div class="task-status-buttons">
          <button onclick="updateStatus(event, '${task._id}', 'To Do')">To Do</button>
          <button onclick="updateStatus(event, '${task._id}', 'In Progress')">In Progress</button>
          <button onclick="updateStatus(event, '${task._id}', 'Done')">Done</button>
        </div>
      `;

      card.addEventListener('click', () => openModal(task));

      if (task.status === 'To Do') todoColumn.appendChild(card);
      else if (task.status === 'In Progress') inProgressColumn.appendChild(card);
      else if (task.status === 'Done') doneColumn.appendChild(card);
    });

  } catch (error) {
    console.log('Error loading tasks:', error);
  }
}

function findMemberName(userId) {
  const id = typeof userId === 'object' ? userId._id : userId;
  const member = projectMembers.find(m => m._id === id);
  return member ? member.name : null;
}

// Create a new task
async function createTask() {
  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;

  if (!title) {
    alert('Please enter a task title!');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, projectId })
    });

    if (response.ok) {
      document.getElementById('taskTitle').value = '';
      document.getElementById('taskDescription').value = '';
      loadTasks();
    } else {
      alert('Failed to create task!');
    }

  } catch (error) {
    console.log('Error creating task:', error);
  }
}

// Update task status (move between columns)
async function updateStatus(event, taskId, newStatus) {
  event.stopPropagation();

  try {
    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) loadTasks();

  } catch (error) {
    console.log('Error updating status:', error);
  }
}

// ---------- TASK DETAIL MODAL ----------

function openModal(task) {
  currentTaskId = task._id;
  document.getElementById('modalTaskTitle').textContent = task.title;
  document.getElementById('modalTaskDescription').textContent = task.description || 'No description';

  // Fill assign dropdown with project members
  const select = document.getElementById('assignSelect');
  select.innerHTML = '<option value="">Unassigned</option>';
  projectMembers.forEach(member => {
    const option = document.createElement('option');
    option.value = member._id;
    option.textContent = member.name;
    const assignedId = task.assignedTo ? (typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo) : null;
    if (assignedId === member._id) option.selected = true;
    select.appendChild(option);
  });

  document.getElementById('taskModal').style.display = 'flex';
  loadComments(task._id);
}

function closeModal() {
  document.getElementById('taskModal').style.display = 'none';
  currentTaskId = null;
}

// Assign task to selected member
async function assignTask() {
  const assignedTo = document.getElementById('assignSelect').value;

  try {
    const response = await fetch(`http://localhost:5000/api/tasks/${currentTaskId}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ assignedTo: assignedTo || null })
    });

    if (response.ok) loadTasks();

  } catch (error) {
    console.log('Error assigning task:', error);
  }
}

// ---------- COMMENTS ----------

async function loadComments(taskId) {
  try {
    const response = await fetch(`http://localhost:5000/api/comments/task/${taskId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const comments = await response.json();
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';

    if (comments.length === 0) {
      commentsList.innerHTML = '<p style="color:#999; font-size:13px;">No comments yet.</p>';
    }

    comments.forEach(comment => {
      const div = document.createElement('div');
      div.className = 'comment-item';

      const isMyComment = currentUser && comment.author._id === currentUser.id;

      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div class="comment-author">${comment.author.name}</div>
            <div class="comment-text">${comment.text}</div>
          </div>
          ${isMyComment ? `<button onclick="deleteComment('${comment._id}')" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:12px; padding:2px 6px;">Delete</button>` : ''}
        </div>
      `;
      commentsList.appendChild(div);
    });

  } catch (error) {
    console.log('Error loading comments:', error);
  }
}

async function addComment() {
  const text = document.getElementById('commentText').value;
  if (!text) return;

  try {
    const response = await fetch('http://localhost:5000/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text, taskId: currentTaskId })
    });

    if (response.ok) {
      document.getElementById('commentText').value = '';
      loadComments(currentTaskId);
    }

  } catch (error) {
    console.log('Error adding comment:', error);
  }
}

// Delete a comment
async function deleteComment(commentId) {
  if (!confirm('Delete this comment?')) return;

  try {
    const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      loadComments(currentTaskId);
    } else {
      alert('Could not delete comment.');
    }

  } catch (error) {
    console.log('Error deleting comment:', error);
  }
}

// ---------- MEMBERS ----------

async function loadMembers() {
  try {
    const response = await fetch(`http://localhost:5000/api/projects/${projectId}/members`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    projectMembers = await response.json();

    const membersList = document.getElementById('membersList');
    if (membersList) {
      membersList.innerHTML = '';
      projectMembers.forEach(member => {
        const div = document.createElement('div');
        div.className = 'member-item';
        div.textContent = `${member.name} (${member.email})`;
        membersList.appendChild(div);
      });
    }

  } catch (error) {
    console.log('Error loading members:', error);
  }
}

function openMembersModal() {
  document.getElementById('membersModal').style.display = 'flex';
  document.getElementById('memberMessage').textContent = '';
  loadMembers();
}

function closeMembersModal() {
  document.getElementById('membersModal').style.display = 'none';
  loadTasks(); // refresh in case assignment options changed
}

async function addMember() {
  const email = document.getElementById('memberEmail').value;
  const messageEl = document.getElementById('memberMessage');

  if (!email) return;

  try {
    const response = await fetch(`http://localhost:5000/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      messageEl.style.color = 'green';
      messageEl.textContent = data.message;
      document.getElementById('memberEmail').value = '';
      loadMembers();
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = data.message;
    }

  } catch (error) {
    console.log('Error adding member:', error);
  }
}
async function init() {
  await loadMembers(); // load members first so task cards can show assignee names
  loadTasks();
}

init();