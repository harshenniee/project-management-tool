const registerForm = document.getElementById('registerForm');
const message = document.getElementById('message');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      message.style.color = 'green';
      message.textContent = 'Registered successfully! Redirecting to login...';

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);

    } else {
      message.style.color = 'red';
      message.textContent = data.message;
    }

  } catch (error) {
    message.textContent = 'Server error! Make sure backend is running.';
  }
});