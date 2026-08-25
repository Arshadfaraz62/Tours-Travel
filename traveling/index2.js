const form = document.getElementById('registration-form');
const errorBanner = document.getElementById('registration-error');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');

const reportError = (message, error) => {
  if (error) {
    console.error(`Registration form: ${message}`, error);
  } else {
    console.error(`Registration form: ${message}`);
  }

  if (!errorBanner) {
    return;
  }

  errorBanner.textContent = message;
  errorBanner.hidden = false;
};

const clearError = () => {
  if (errorBanner) {
    errorBanner.hidden = true;
    errorBanner.textContent = '';
  }
};

if (!form || !password || !confirmPassword) {
  reportError('Registration form fields are missing, so submissions cannot be checked.');
} else {
  form.addEventListener('submit', (event) => {
    try {
      clearError();

      if (password.value !== confirmPassword.value) {
        event.preventDefault();
        reportError('Password and confirm password do not match.');
        confirmPassword.focus();
      }
    } catch (error) {
      event.preventDefault();
      reportError('Could not validate the registration form, please try again.', error);
    }
  });

  confirmPassword.addEventListener('input', clearError);
  password.addEventListener('input', clearError);
}
