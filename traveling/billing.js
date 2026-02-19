const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
const slipGroup = document.getElementById('paymentSlipGroup');
const slipInput = document.getElementById('paymentSlip');

const updatePaymentRequirement = () => {
  const selected = document.querySelector('input[name="paymentMethod"]:checked');
  const isOnline = selected && selected.value === 'online';

  slipGroup.hidden = !isOnline;
  slipInput.required = isOnline;

  if (!isOnline) {
    slipInput.value = '';
  }
};

paymentOptions.forEach((option) => {
  option.addEventListener('change', updatePaymentRequirement);
});

updatePaymentRequirement();
