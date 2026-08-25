const form = document.getElementById('registration-form');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');

const checkPasswordsMatch = () => {
  const mismatch = confirmPassword.value !== password.value;
  confirmPassword.setCustomValidity(mismatch ? 'Passwords do not match.' : '');
};

password.addEventListener('input', checkPasswordsMatch);
confirmPassword.addEventListener('input', checkPasswordsMatch);

form.addEventListener('submit', (event) => {
  checkPasswordsMatch();

  if (!form.checkValidity()) {
    event.preventDefault();
    form.reportValidity();
  }
});
