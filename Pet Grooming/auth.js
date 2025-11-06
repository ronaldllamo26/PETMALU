// auth.js - handles register/login using localStorage
const $ = (s) => document.querySelector(s);

function getUsers() {
  return JSON.parse(localStorage.getItem('pg_users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('pg_users', JSON.stringify(users));
}

function registerUser(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, msg: 'Email already registered' };
  }
  const user = {
    id: 'u_' + Math.random().toString(36).slice(2, 9),
    name,
    email,
    password
  };
  users.push(user);
  saveUsers(users);
  return { ok: true, user };
}

function loginUser(email, password) {
  const users = getUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!found) return { ok: false, msg: 'Invalid email or password.' };
  localStorage.setItem('pg_current_user', JSON.stringify({
    id: found.id,
    name: found.name,
    email: found.email
  }));
  return { ok: true, user: found };
}

document.addEventListener('DOMContentLoaded', () => {
  // REGISTER FORM
  const regForm = $('#register-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#name').value.trim();
      const email = $('#email').value.trim();
      const pass = $('#password').value;

      if (!name || !email || !pass) return alert('Please fill all fields.');

      const r = registerUser(name, email, pass);
      if (!r.ok) return alert(r.msg);

      alert('Registration successful! Please log in.');
      window.location.href = 'login.html'; // ✅ Redirect to login after register
    });
  }

  // LOGIN FORM
  const loginForm = $('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#email').value.trim();
      const pass = $('#password').value;

      if (!email || !pass) return alert('Please fill all fields.');

      const r = loginUser(email, pass);
      if (!r.ok) return alert(r.msg);

      alert(`Welcome back, ${r.user.name}!`);
      window.location.href = 'index.html'; // ✅ Redirect to home after login
    });
  }
});
