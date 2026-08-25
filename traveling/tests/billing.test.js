import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const travelingDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function loadBilling() {
  const html = await readFile(resolve(travelingDir, 'billing.html'), 'utf8');
  const parsedDocument = new DOMParser().parseFromString(html, 'text/html');

  document.documentElement.innerHTML = parsedDocument.documentElement.innerHTML;

  const context = {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    lineWidth: undefined,
    lineJoin: undefined,
    lineCap: undefined,
    strokeStyle: undefined,
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => context,
  );

  const canvas = document.getElementById('signature-pad');
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    left: 30,
    top: 50,
    right: 450,
    bottom: 210,
    width: 420,
    height: 160,
    x: 30,
    y: 50,
    toJSON: () => ({}),
  });

  const source = await readFile(resolve(travelingDir, 'billing.js'), 'utf8');
  expect(source).toContain('const paymentMethods');
  vi.resetModules();
  await import('../billing.js');

  return {
    canvas,
    context,
    rows: [...document.querySelectorAll('tbody tr')],
    selects: [...document.querySelectorAll('.payment-method')],
  };
}

function dispatchChange(select, value) {
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

function dispatchTouch(canvas, type, clientX, clientY) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', {
    configurable: true,
    value: [{ clientX, clientY }],
  });
  canvas.dispatchEvent(event);
  return event;
}

describe('billing.js', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.innerHTML = '';
  });

  it('enables and requires a row payment slip for online payment', async () => {
    const { rows, selects } = await loadBilling();
    const slip = rows[0].querySelector('.payment-slip');

    dispatchChange(selects[0], 'online');

    expect(slip.disabled).toBe(false);
    expect(slip.required).toBe(true);
  });

  it('disables and clears a payment slip when changing back to cash', async () => {
    const { rows, selects } = await loadBilling();
    const slip = rows[0].querySelector('.payment-slip');

    dispatchChange(selects[0], 'online');
    Object.defineProperty(slip, 'value', {
      configurable: true,
      writable: true,
      value: 'receipt.pdf',
    });
    dispatchChange(selects[0], 'cash');

    expect(slip.disabled).toBe(true);
    expect(slip.required).toBe(false);
    expect(slip.value).toBe('');
  });

  it('keeps payment slip state isolated to the changed row', async () => {
    const { rows, selects } = await loadBilling();
    const initialStates = rows.map((row) => {
      const slip = row.querySelector('.payment-slip');
      return { disabled: slip.disabled, required: slip.required, value: slip.value };
    });

    dispatchChange(selects[0], 'online');

    expect(rows[0].querySelector('.payment-slip')).toMatchObject({
      disabled: false,
      required: true,
    });
    rows.slice(1).forEach((row, index) => {
      const slip = row.querySelector('.payment-slip');
      expect({
        disabled: slip.disabled,
        required: slip.required,
        value: slip.value,
      }).toEqual(initialStates[index + 1]);
    });
  });

  it('wires the payment slip toggle for all three rows', async () => {
    const { rows, selects } = await loadBilling();

    selects.forEach((select, index) => {
      dispatchChange(select, 'online');

      rows.forEach((row, rowIndex) => {
        const slip = row.querySelector('.payment-slip');
        expect(slip.disabled).toBe(rowIndex !== index);
        expect(slip.required).toBe(rowIndex === index);
      });

      dispatchChange(select, 'cash');
    });
  });

  it('sets the initial signature context styling', async () => {
    const { context } = await loadBilling();

    expect(context.lineWidth).toBe(2);
    expect(context.lineJoin).toBe('round');
    expect(context.lineCap).toBe('round');
    expect(context.strokeStyle).toBe('#111827');
  });

  it('starts drawing at the offset-corrected mouse point', async () => {
    const { canvas, context } = await loadBilling();

    canvas.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 130,
      }),
    );

    expect(context.beginPath).toHaveBeenCalledOnce();
    expect(context.moveTo).toHaveBeenCalledWith(70, 80);
  });

  it('draws offset-corrected mouse points and prevents default movement', async () => {
    const { canvas, context } = await loadBilling();
    canvas.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 130,
      }),
    );
    const moveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: 150,
      clientY: 170,
    });
    const preventDefault = vi.spyOn(moveEvent, 'preventDefault');

    canvas.dispatchEvent(moveEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(context.lineTo).toHaveBeenCalledWith(120, 120);
    expect(context.stroke).toHaveBeenCalledOnce();
  });

  it('does not draw on mouse movement before drawing starts', async () => {
    const { canvas, context } = await loadBilling();

    canvas.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: 150,
        clientY: 170,
      }),
    );

    expect(context.lineTo).not.toHaveBeenCalled();
    expect(context.stroke).not.toHaveBeenCalled();
  });

  it('stops drawing after mouseup', async () => {
    const { canvas, context } = await loadBilling();
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 130 }));
    canvas.dispatchEvent(new MouseEvent('mouseup'));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 170 }));

    expect(context.lineTo).not.toHaveBeenCalled();
    expect(context.stroke).not.toHaveBeenCalled();
  });

  it('stops drawing after mouseleave', async () => {
    const { canvas, context } = await loadBilling();
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 130 }));
    canvas.dispatchEvent(new MouseEvent('mouseleave'));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 170 }));

    expect(context.lineTo).not.toHaveBeenCalled();
    expect(context.stroke).not.toHaveBeenCalled();
  });

  it('uses the first touch coordinates for touch drawing', async () => {
    const { canvas, context } = await loadBilling();

    dispatchTouch(canvas, 'touchstart', 90, 110);
    const moveEvent = dispatchTouch(canvas, 'touchmove', 150, 170);

    expect(context.moveTo).toHaveBeenCalledWith(60, 60);
    expect(context.lineTo).toHaveBeenCalledWith(120, 120);
    expect(context.stroke).toHaveBeenCalledOnce();
    expect(moveEvent.defaultPrevented).toBe(true);
  });

  it('clears the full signature canvas when requested', async () => {
    const { canvas, context } = await loadBilling();

    document.getElementById('clear-signature').click();

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 420, 160);
  });
});
