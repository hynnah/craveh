// Account Page JavaScript

let isLogin = true;

document.addEventListener('DOMContentLoaded', () => {
  updateAccountPage();
  setupAuthForm();
  window.sessionDataPromise.then(() => {
    updateAccountPage();
  });
});

function setupAuthForm() {
  const form = document.getElementById('login-signup-form');
  const toggleBtn = document.getElementById('auth-toggle-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const addressForm = document.getElementById('profile-address-form');
  
  toggleBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    updateAuthForm();
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const name = document.getElementById('name-input').value;
    
    if (isLogin) {
      handleLogin(email, password);
    } else {
      handleSignup(email, password, name);
    }
  });
  
  logoutBtn.addEventListener('click', handleLogout);
  addressForm.addEventListener('submit', handleSaveAddress);
}

function updateAuthForm() {
  const nameField = document.getElementById('name-field');
  const authTitle = document.getElementById('auth-title');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authToggleText = document.getElementById('auth-toggle-text');
  const authToggleBtn = document.getElementById('auth-toggle-btn');
  const errorMsg = document.getElementById('auth-error');
  
  errorMsg.textContent = '';
  
  if (isLogin) {
    nameField.style.display = 'none';
    authTitle.textContent = 'Welcome Back';
    authSubmitBtn.textContent = 'Sign In';
    authToggleText.textContent = "Don't have an account? ";
    authToggleBtn.textContent = 'Sign Up';
  } else {
    nameField.style.display = 'block';
    authTitle.textContent = 'Create Account';
    authSubmitBtn.textContent = 'Create Account';
    authToggleText.textContent = 'Already have an account? ';
    authToggleBtn.textContent = 'Sign In';
  }
}

function handleLogin(email, password) {
  const btn = document.getElementById('auth-submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Signing in...';
  
  sendLoginToServer(email, password)
    .then((user) => {
      setCurrentUser(user);
      updateAccountPage();
      showToast('Welcome back, ' + user.name + '!');
      setTimeout(() => window.location.href = 'menu.html', 800);
    })
    .catch((error) => {
      document.getElementById('auth-error').textContent = error.message;
      btn.disabled = false;
      btn.textContent = 'Sign In';
    });
}

function handleSignup(email, password, name) {
  if (!name.trim()) {
    document.getElementById('auth-error').textContent = 'Please enter your name';
    return;
  }
  
  const btn = document.getElementById('auth-submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Creating account...';
  
  sendSignupToServer(email, password, name)
    .then((user) => {
      setCurrentUser(user);
      updateAccountPage();
      showToast('Account created successfully!');
      setTimeout(() => window.location.href = 'menu.html', 800);
    })
    .catch((error) => {
      document.getElementById('auth-error').textContent = error.message;
      btn.disabled = false;
      btn.textContent = 'Create Account';
    });
}

async function sendLoginToServer(email, password) {
  const response = await fetch('../api/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result || !result.success) {
    throw new Error(result?.error || 'Login failed');
  }
  return result.user;
}

async function sendSignupToServer(email, password, name) {
  const response = await fetch('../api/signup.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result || !result.success) {
    throw new Error(result?.error || 'Signup failed');
  }
  return result.user;
}

function handleLogout() {
  if (!confirm('Are you sure you want to sign out?')) return;
  
  logout();
  updateAccountPage();
  showToast('Signed out successfully');
  
  // Clear form
  document.getElementById('email-input').value = '';
  document.getElementById('password-input').value = '';
  document.getElementById('name-input').value = '';
}

function updateAccountPage() {
  const authForm = document.getElementById('auth-form');
  const userProfile = document.getElementById('user-profile');
  const user = getCurrentUser();
  
  if (user) {
    authForm.style.display = 'none';
    userProfile.style.display = 'block';
    
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-id').textContent = '#' + user.id;
    const profileSince = user.created_at ? new Date(user.created_at) : new Date();
    document.getElementById('profile-since').textContent = profileSince.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const avatar = document.getElementById('profile-avatar');
    if (avatar) {
      const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      avatar.textContent = initials;
    }

    document.getElementById('profile-phone').value = user.phone || '';
    const addr = user.delivery_address || {};
    document.getElementById('profile-street').value = addr.street || '';
    document.getElementById('profile-city').value = addr.city || '';
    document.getElementById('profile-state').value = addr.state || '';
    document.getElementById('profile-zip').value = addr.zip || '';
    document.getElementById('profile-building').value = addr.building || '';
    document.getElementById('profile-floor').value = addr.floor || '';
    document.getElementById('profile-apt').value = addr.apt || '';
    document.getElementById('profile-landmark').value = addr.landmark || '';
  } else {
    authForm.style.display = 'block';
    userProfile.style.display = 'none';
  }
}

async function handleSaveAddress(e) {
  e.preventDefault();

  const errorEl = document.getElementById('profile-address-error');
  const successEl = document.getElementById('profile-address-success');
  const btn = document.getElementById('save-address-btn');
  errorEl.textContent = '';
  successEl.textContent = '';

  const phone = document.getElementById('profile-phone').value.trim();
  if (phone && !/^\d{7,15}$/.test(phone)) {
    errorEl.textContent = 'Phone must be 7–15 digits.';
    return;
  }

  const deliveryAddress = {
    street: document.getElementById('profile-street').value.trim(),
    city: document.getElementById('profile-city').value.trim(),
    state: document.getElementById('profile-state').value.trim(),
    zip: document.getElementById('profile-zip').value.trim(),
    building: document.getElementById('profile-building').value.trim(),
    floor: document.getElementById('profile-floor').value.trim(),
    apt: document.getElementById('profile-apt').value.trim(),
    landmark: document.getElementById('profile-landmark').value.trim()
  };

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving...';

  try {
    const response = await fetch('../api/update_profile.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone || null, delivery_address: deliveryAddress })
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result || !result.success) {
      throw new Error(result?.error || 'Save failed');
    }
    setCurrentUser(result.user);
    successEl.textContent = 'Profile updated successfully!';
    showToast('Profile updated successfully!');
    setTimeout(() => successEl.textContent = '', 3000);
  } catch (error) {
    errorEl.textContent = error.message;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Save Changes';
  }
}

function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
