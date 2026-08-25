const errorBanner = document.getElementById('billing-error');
const ALLOWED_SLIP_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SLIP_BYTES = 5 * 1024 * 1024;

const reportError = (message, error) => {
  if (error) {
    console.error(`Billing book: ${message}`, error);
  } else {
    console.error(`Billing book: ${message}`);
  }

  if (!errorBanner) {
    return;
  }

  errorBanner.textContent = message;
  errorBanner.hidden = false;
};

const guard = (message, handler) => (event) => {
  try {
    handler(event);
  } catch (error) {
    reportError(message, error);
  }
};

const paymentMethods = document.querySelectorAll('.payment-method');

if (paymentMethods.length === 0) {
  reportError('No payment method selectors were found, so payment slip rules are inactive.');
}

paymentMethods.forEach((methodSelect) => {
  methodSelect.addEventListener(
    'change',
    guard('Could not apply the payment slip rule for this row.', () => {
      const row = methodSelect.closest('tr');

      if (!row) {
        throw new Error('Payment method selector is not inside a table row.');
      }

      const slipInput = row.querySelector('.payment-slip');

      if (!slipInput) {
        throw new Error('Row has no payment slip input.');
      }

      const isOnline = methodSelect.value === 'online';

      slipInput.disabled = !isOnline;
      slipInput.required = isOnline;

      if (!isOnline) {
        slipInput.value = '';
      }
    }),
  );
});

document.querySelectorAll('.payment-slip').forEach((slipInput) => {
  slipInput.addEventListener(
    'change',
    guard('Could not check the selected payment slip.', () => {
      const file = slipInput.files[0];

      if (!file) {
        slipInput.setCustomValidity('');
        return;
      }

      if (!ALLOWED_SLIP_TYPES.includes(file.type)) {
        slipInput.value = '';
        slipInput.setCustomValidity('Only JPEG, PNG, WebP or PDF slips are allowed.');
      } else if (file.size > MAX_SLIP_BYTES) {
        slipInput.value = '';
        slipInput.setCustomValidity('Payment slip must be 5 MB or smaller.');
      } else {
        slipInput.setCustomValidity('');
      }

      slipInput.reportValidity();
    }),
  );
});

const setUpSignaturePad = () => {
  const canvas = document.getElementById('signature-pad');

  if (!canvas) {
    reportError('Signature pad is missing from the page, so signatures cannot be captured.');
    return;
  }

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    reportError('This browser could not provide a 2D drawing context for the signature pad.');
    return;
  }

  let drawing = false;

  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#111827';

  const getPoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    const source = event.touches ? event.touches[0] : event;

    if (!source) {
      throw new Error('Pointer event carried no coordinates.');
    }

    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top,
    };
  };

  const startDraw = (event) => {
    const point = getPoint(event);
    drawing = true;
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

  const drawingFailed = 'Signature drawing failed, please try again.';

  canvas.addEventListener('mousedown', guard(drawingFailed, startDraw));
  canvas.addEventListener('mousemove', guard(drawingFailed, draw));
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);
  canvas.addEventListener('touchstart', guard(drawingFailed, startDraw), { passive: false });
  canvas.addEventListener('touchmove', guard(drawingFailed, draw), { passive: false });
  canvas.addEventListener('touchend', stopDraw);

  const clearButton = document.getElementById('clear-signature');

  if (!clearButton) {
    reportError('Clear signature button is missing from the page.');
    return;
  }

  clearButton.addEventListener(
    'click',
    guard('Could not clear the signature.', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }),
  );
};

setUpSignaturePad();

window.addEventListener('error', (event) => {
  reportError('An unexpected error stopped part of the billing book from working.', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  reportError('An unexpected error stopped part of the billing book from working.', event.reason);
});
