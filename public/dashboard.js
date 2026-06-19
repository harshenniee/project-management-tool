const token = localStorage.getItem('token');

// If no token, redirect to login (not logged in)
if (!token) {
  window.location.href = 'login.html';
}

const projectsGrid = document.getElementById('projectsGrid');

// Fetch and display all projects
async function loadProjects() {
  try {
    const response = await fetch('http://localhost:5000/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const projects = await response.json();

    projectsGrid.innerHTML = '';

    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <h3>${project.name}</h3>
        <p>${project.description || 'No description'}</p>
      `;
      card.onclick = () => {
        window.location.href = `board.html?projectId=${project._id}`;
      };
      projectsGrid.appendChild(card);
    });

  } catch (error) {
    console.log('Error loading projects:', error);
  }
}

// Create a new project
async function createProject() {
  const name = document.getElementById('projectName').value;
  const description = document.getElementById('projectDescription').value;

  if (!name) {
    alert('Please enter a project name!');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, description })
    });

    if (response.ok) {
      document.getElementById('projectName').value = '';
      document.getElementById('projectDescription').value = '';
      loadProjects(); // refresh list
    } else {
      alert('Failed to create project!');
    }

  } catch (error) {
    console.log('Error creating project:', error);
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Load projects when page opens
loadProjects();