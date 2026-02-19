const paymentMethods = document.querySelectorAll('.payment-method');

paymentMethods.forEach((methodSelect) => {
  methodSelect.addEventListener('change', () => {
    const row = methodSelect.closest('tr');
    const slipInput = row.querySelector('.payment-slip');
    const isOnline = methodSelect.value === 'online';

    slipInput.disabled = !isOnline;
    slipInput.required = isOnline;

    if (!isOnline) {
      slipInput.value = '';
    }
  });
});

const canvas = document.getElementById('signature-pad');
const ctx = canvas.getContext('2d');
let drawing = false;

ctx.lineWidth = 2;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = '#111827';

const getPoint = (event) => {
  const rect = canvas.getBoundingClientRect();
  const source = event.touches ? event.touches[0] : event;

  return {
    x: source.clientX - rect.left,
    y: source.clientY - rect.top,
  };
};

const startDraw = (event) => {
  drawing = true;
  const point = getPoint(event);
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
};

const draw = (event) => {
  if (!drawing) {
    return;
  }

  event.preventDefault();
  const point = getPoint(event);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
};

const stopDraw = () => {
  drawing = false;
};

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);
canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDraw);

document.getElementById('clear-signature').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
