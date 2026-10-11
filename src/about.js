// Decorative notes are movable inside the portrait, by pointer or keyboard.
export function enableAboutStickers(root) {
  let drag = null;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function move(sticker, dx, dy) {
    const frame = sticker.closest('.about-portrait').getBoundingClientRect();
    const bounds = sticker.getBoundingClientRect();
    const x = Number(sticker.dataset.x || 0) + clamp(dx, frame.left + 8 - bounds.left, frame.right - 8 - bounds.right);
    const y = Number(sticker.dataset.y || 0) + clamp(dy, frame.top + 8 - bounds.top, frame.bottom - 8 - bounds.bottom);
    sticker.dataset.x = x;
    sticker.dataset.y = y;
    sticker.style.setProperty('--drag-x', `${x}px`);
    sticker.style.setProperty('--drag-y', `${y}px`);
  }

  root.addEventListener('pointerdown', (event) => {
    const sticker = event.target.closest('[data-sticker]');
    if (!sticker || event.button !== 0 || root.dataset.busy === 'true') return;
    drag = { sticker, x: event.clientX, y: event.clientY, id: event.pointerId };
    sticker.setPointerCapture(event.pointerId);
    sticker.classList.add('dragging');
  });
  root.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    move(drag.sticker, event.clientX - drag.x, event.clientY - drag.y);
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  const end = () => { drag?.sticker.classList.remove('dragging'); drag = null; };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);
  root.addEventListener('lostpointercapture', end);
  root.addEventListener('keydown', (event) => {
    const sticker = event.target.closest('[data-sticker]');
    const delta = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] }[event.key];
    if (!sticker || !delta) return;
    event.preventDefault();
    event.stopPropagation();
    move(sticker, ...delta);
  });
}
