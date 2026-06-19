const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // page reload avకుండా ఆపుతుంది

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Save token to use in future requests
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      message.style.color = 'green';
      message.textContent = 'Login successful! Redirecting...';

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);

    } else {
      message.style.color = 'red';
      message.textContent = data.message;
    }

  } catch (error) {
    message.textContent = 'Server error! Make sure backend is running.';
  }
});