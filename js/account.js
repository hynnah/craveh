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
    authTitle.textContent = 'Login';
    authSubmitBtn.textContent = 'Login';
    authToggleText.textContent = "Don't have an account? ";
    authToggleBtn.textContent = 'Sign Up';
  } else {
    nameField.style.display = 'block';
    authTitle.textContent = 'Sign Up';
    authSubmitBtn.textContent = 'Sign Up';
    authToggleText.textContent = 'Already have an account? ';
    authToggleBtn.textContent = 'Login';
  }
}

function handleLogin(email, password) {
  sendLoginToServer(email, password)
    .then((user) => {
      setCurrentUser({ id: user.id, name: user.name, email: user.email });
      updateAccountPage();
      window.location.href = 'menu.html';
    })
    .catch((error) => {
      document.getElementById('auth-error').textContent = error.message;
    });
}

function handleSignup(email, password, name) {
  if (!name.trim()) {
    document.getElementById('auth-error').textContent = 'Please enter your name';
    return;
  }
  
  sendSignupToServer(email, password, name)
    .then((user) => {
      setCurrentUser({ id: user.id, name: user.name, email: user.email });
      updateAccountPage();
      window.location.href = 'menu.html';
    })
    .catch((error) => {
      document.getElementById('auth-error').textContent = error.message;
    });
}

async function sendLoginToServer(email, password) {
  const response = await fetch('login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(response.status + ' ' + response.statusText + '\n' + text);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Login failed');
  }

  return result.user;
}

async function sendSignupToServer(email, password, name) {
  const response = await fetch('signup.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, name })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(response.status + ' ' + response.statusText + '\n' + text);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Signup failed');
  }

  return result.user;
}

function handleLogout() {
  logout();
  updateAccountPage();
  
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
    document.getElementById('profile-id').textContent = user.id;
    const profileSince = user.created_at ? new Date(user.created_at) : new Date();
    document.getElementById('profile-since').textContent = profileSince.toLocaleDateString();
  } else {
    authForm.style.display = 'block';
    userProfile.style.display = 'none';
  }
}
