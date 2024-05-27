document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
  
    if (token) {
      const nav = document.querySelector('nav ul');
      nav.innerHTML += `<li><a href="#" id="logoutBtn">Logout</a></li>`;
  
      document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
      });
    }
  });
  