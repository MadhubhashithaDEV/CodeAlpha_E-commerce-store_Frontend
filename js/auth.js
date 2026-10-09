/**
 * VELORA Authentication & Session Helper
 */

function setAuthSession(token, user) {
  localStorage.setItem('velora_token', token);
  localStorage.setItem('velora_user', JSON.stringify(user));
}

function getAuthToken() {
  return localStorage.getItem('velora_token');
}

function getCurrentUser() {
  const userStr = localStorage.getItem('velora_user');
  return userStr ? JSON.parse(userStr) : null;
}

function isAuthenticated() {
  return !!getAuthToken();
}

function logoutUser() {
  localStorage.removeItem('velora_token');
  localStorage.removeItem('velora_user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 800);
}

function updateNavAuthUI() {
  const accountLink = document.getElementById('nav-account-link');
  const userMenuContainer = document.getElementById('nav-user-menu');
  
  if (!accountLink && !userMenuContainer) return;

  const user = getCurrentUser();

  if (user) {
    if (userMenuContainer) {
      userMenuContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <a href="profile.html" class="nav-link" style="font-weight: 600; color: var(--accent);">
            <i class="fas fa-user-circle"></i> ${user.name.split(' ')[0]}
          </a>
          <a href="orders.html" class="nav-link" title="My Orders"><i class="fas fa-box-open"></i></a>
          ${user.role === 'admin' ? '<a href="admin.html" class="nav-link" title="Admin Panel" style="color:#e03131"><i class="fas fa-user-shield"></i> Admin</a>' : ''}
          <button onclick="logoutUser()" class="icon-btn" title="Logout" style="font-size: 1rem;"><i class="fas fa-sign-out-alt"></i></button>
        </div>
      `;
    }
  } else {
    if (userMenuContainer) {
      userMenuContainer.innerHTML = `
        <a href="login.html" class="nav-link"><i class="fas fa-user"></i> Login / Register</a>
      `;
    }
  }
}
