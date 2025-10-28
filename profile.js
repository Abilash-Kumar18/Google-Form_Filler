
(() => {

  const form = document.getElementById('profile-form');
  const notification = document.getElementById('notification');

  const fields = [
    'name', 'register', 'email', 'phone', 'college', 'department',
    'year', 'section', 'domain', 'cgpa', 'address'
  ];


  function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `message ${type} show`;
    setTimeout(() => notification.classList.remove('show'), 3000);
  }

  function validateField(input) {
    let isValid = true;
    input.classList.remove('invalid');
    const errorDiv = input.nextElementSibling;
    if (errorDiv) errorDiv.style.display = 'none';

    if (input.required && input.value.trim() === '') {
      isValid = false;
    }
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      isValid = false;
    }
    if (input.id === 'cgpa' && (input.value < 0 || input.value > 10)) {
      isValid = false;
    }

    if (!isValid) {
      input.classList.add('invalid');
      if (errorDiv) errorDiv.style.display = 'block';
    }
    return isValid;
  }

  function loadProfile() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['userProfile'], function(result) {
        const savedProfile = result.userProfile;
        if (savedProfile) {
          fields.forEach(field => {
            if (form[field]) form[field].value = savedProfile[field] || '';
          });
        }
      });
    } else {
      // Fallback for local testing outside of extension
      try {
        const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
        if (savedProfile) {
          fields.forEach(field => {
            if (form[field]) form[field].value = savedProfile[field] || '';
          });
        }
      } catch {
        // ignore
      }
    }
  }

  window.onload = loadProfile;

  form.addEventListener('submit', event => {
    event.preventDefault();

    let isFormValid = true;
    fields.forEach(fieldName => {
      if (form[fieldName]) {
        if (!validateField(form[fieldName])) {
          isFormValid = false;
        }
      }
    });

    if (!isFormValid) {
      showNotification('Please fix the errors before saving.', 'error');
      return;
    }

    const saveButton = form.querySelector('button[type="submit"]');
    const buttonText = saveButton.querySelector('span');

    saveButton.classList.add('button-loading');
    buttonText.textContent = 'Saving...';
    saveButton.disabled = true;

    const userProfile = {};
    fields.forEach(field => {
      if (form[field]) userProfile[field] = form[field].value.trim();
    });

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ userProfile }, function() {
        if (chrome.runtime.lastError) {
          alert('Save failed: ' + chrome.runtime.lastError.message);
          saveButton.classList.remove('button-loading');
          buttonText.textContent = 'Save Profile';
          saveButton.disabled = false;
          return;
        }
        showNotification('Profile saved successfully!', 'success');
        saveButton.classList.remove('button-loading');
        buttonText.textContent = 'Save Profile';
        saveButton.disabled = false;
      });
    } else {
      // Fallback localStorage for testing without extension
      try {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        showNotification('Profile saved successfully!', 'success');
      } catch (e) {
        alert('Failed to save profile locally.');
      }
      saveButton.classList.remove('button-loading');
      buttonText.textContent = 'Save Profile';
      saveButton.disabled = false;
    }
  });

  // Validate fields on input
  fields.forEach(fieldName => {
    if (form[fieldName]) {
      form[fieldName].addEventListener('input', () => validateField(form[fieldName]));
    }
  });
})();
