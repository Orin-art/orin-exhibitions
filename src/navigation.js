// Pages advance in array order; each can also expand to the full viewport.
// Animations own their lifetime; input cannot leave the stack between states.
export function createDeck({ root, sheets, surface, names, isNavigationBlocked = () => false }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const announcement = document.querySelector('#page-announcement');
  let stage = 0;
  let expanded = null;
  let focusLayer = null;
  let busy = false;
  let wheelTotal = 0;
  let lastWheel = 0;
  let wheelUsed = false;
  let touch = null;
  const activeIndex = () => expanded ?? stage;
  const activeSurface = () => (focusLayer ?? sheets[stage]).querySelector('.surface');

  function renderStack() {
    sheets.forEach((sheet, i) => {
      const shown = i <= stage;
      sheet.style.transform = shown ? 'translateY(0)' : 'translateY(-101%)';
      sheet.classList.toggle('underlying', i < stage);
      sheet.inert = !shown || expanded !== null;
      sheet.setAttribute('aria-hidden', String(!shown || expanded !== null));
      const body = sheet.querySelector('.surface');
      body.inert = i !== stage || expanded !== null;
      body.setAttribute('aria-hidden', String(i !== stage || expanded !== null));
      const rail = sheet.querySelector('.rail');
      if (rail) { rail.hidden = i >= stage; rail.inert = i >= stage; }
    });
  }

  function status() {
    root.dataset.state = `${names[activeIndex()].toLowerCase()}${expanded === null && stage > 0 ? '-stack' : expanded !== null ? '-full' : ''}`;
    root.dataset.busy = String(busy);
    document.title = `${names[activeIndex()]} — orin`;
    document.querySelector('meta[name="theme-color"]').content = ['#E7FF55', '#244BFF', '#F2F0E9', '#FF6337'][activeIndex()];
  }

  async function animate(el, frames, duration) {
    if (reduced.matches) return;
    const animation = el.animate(frames, { duration, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'none' });
    try { await animation.finished; } catch { /* preference changes may cancel animations */ }
  }

  function animateRail(rail, entering) {
    // Move the entire full-height strip opposite to the incoming sheet.
    // Matching distance, duration and easing keeps their edges synchronized.
    const frames = [
      { transform: 'translateY(101%)' },
      { transform: 'translateY(0)' },
    ];
    return animate(rail, entering ? frames : [...frames].reverse(), 700);
  }

  function finish(keyboard) {
    busy = false;
    status();
    announcement.textContent = `${names[activeIndex()]} page${expanded === null ? '' : ', full screen'}`;
    // Move focus only when keyboard input or a disappearing control requires it.
    const focused = document.activeElement;
    if (keyboard || !focused?.isConnected || focused?.closest('[inert]') || focused?.closest('[hidden]')) {
      activeSurface().querySelector('h1').focus({ preventScroll: true });
    }
  }

  async function expand(index, keyboard = false) {
    if (busy || isNavigationBlocked() || index === expanded) return;
    busy = true;
    const old = focusLayer;
    const sourceRail = sheets[index]?.querySelector('.rail');
    const fromRail = !old && index < stage && sourceRail;
    const bounds = fromRail ? sourceRail.getBoundingClientRect() : null;
    const width = root.clientWidth;
    const start = bounds ? `inset(0px ${width - bounds.right}px 0px ${bounds.left}px)` : 'inset(0 100% 0 0)';
    const layer = document.createElement('section');
    layer.className = `focus-layer sheet-${index}`;
    layer.setAttribute('aria-label', `${names[index]} page`);
    layer.append(surface(index, true));
    root.append(layer);
    if (old) old.inert = true;
    focusLayer = layer;
    expanded = index;
    renderStack();
    status();
    await animate(layer, [{ clipPath: start }, { clipPath: 'inset(0 0 0 0)' }], 550);
    old?.remove();
    finish(keyboard);
  }

  async function step(direction, keyboard = false) {
    if (busy || isNavigationBlocked()) return;
    const current = activeIndex();
    const next = current + direction;
    if (next < 0 || next >= names.length) return;
    busy = true;
    const oldFocus = focusLayer;
    const previous = sheets[stage];
    const previousStage = stage;
    stage = next;
    expanded = null;
    focusLayer = null;
    renderStack();
    status();
    if (oldFocus) oldFocus.inert = true;
    const railMotions = [];
    const transitionRails = [];
    sheets.forEach((sheet, i) => {
      const rail = sheet.querySelector('.rail');
      if (oldFocus && rail) {
        if (i >= stage) return;
        // Full-screen mode covers every rail, regardless of the saved stack.
        // Animate visible copies above that layer, then hand off to real rails.
        const overlay = rail.cloneNode(true);
        overlay.classList.add(`sheet-${i}`);
        overlay.hidden = false;
        overlay.inert = true;
        overlay.setAttribute('aria-hidden', 'true');
        overlay.style.cssText = `left:${i * 10}%;width:var(--rail);z-index:41;transform:translateY(0);color:var(--page-ink);pointer-events:none`;
        root.append(overlay);
        transitionRails.push(overlay);
        railMotions.push(animateRail(overlay, true));
        return;
      }
      if (!rail || (i < previousStage) === (i < stage)) return;
      const entering = i < stage;
      // Keep outgoing labels mounted until their downward exit finishes.
      rail.hidden = false;
      rail.inert = true;
      railMotions.push(animateRail(rail, entering));
    });
    if (direction > 0) {
      const incoming = sheets[next];
      incoming.style.zIndex = '40';
      await Promise.all([...railMotions, animate(incoming, [{ transform: 'translateY(-101%)' }, { transform: 'translateY(0)' }], 700)]);
      incoming.style.zIndex = '';
    } else if (oldFocus) {
      await Promise.all([...railMotions, animate(oldFocus, [{ transform: 'translateY(0)' }, { transform: 'translateY(-101%)' }], 700)]);
    } else {
      // Keep the outgoing page above the newly revealed one until it has left.
      previous.classList.remove('underlying');
      await Promise.all([...railMotions, animate(previous, [{ transform: 'translateY(0)' }, { transform: 'translateY(-101%)' }], 700)]);
      if (previousStage !== stage) previous.querySelector('.surface').scrollTop = 0;
    }
    oldFocus?.remove();
    transitionRails.forEach((rail) => rail.remove());
    renderStack();
    finish(keyboard);
  }

  root.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const keyboard = event.detail === 0;
    if (button.hasAttribute('data-page')) expand(Number(button.dataset.page), keyboard);
    else if (button.hasAttribute('data-next')) step(1, keyboard);
  });

  function canScroll(el, direction) {
    if (!el || el.scrollHeight <= el.clientHeight + 2) return false;
    return direction > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2;
  }

  root.addEventListener('wheel', (event) => {
    if (isNavigationBlocked()) return;
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const now = performance.now();
    if (now - lastWheel > 180) { wheelTotal = 0; wheelUsed = false; }
    lastWheel = now;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    const direction = Math.sign(delta);
    if (!direction) return;
    if (!busy && canScroll(activeSurface(), direction)) { wheelUsed = true; return; }
    event.preventDefault();
    if (busy || wheelUsed) return;
    if (Math.sign(wheelTotal) !== direction) wheelTotal = 0;
    wheelTotal += delta;
    if (Math.abs(wheelTotal) >= 48) { wheelUsed = true; step(direction); }
  }, { passive: false });

  window.addEventListener('keydown', (event) => {
    if (isNavigationBlocked()) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'Tab') return;
    const directions = { ArrowDown: 1, PageDown: 1, ArrowRight: 1, ArrowUp: -1, PageUp: -1, ArrowLeft: -1 };
    const direction = directions[event.key];
    if (direction) {
      if (canScroll(activeSurface(), direction) && !['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
      event.preventDefault(); step(direction, true);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); expand(event.key === 'Home' ? 0 : names.length - 1, true);
    }
  });

  root.addEventListener('touchstart', (event) => {
    if (event.target.closest('[data-sticker]')) { touch = null; return; }
    touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY, dy: 0, scrolling: false, horizontal: false } : null;
  }, { passive: true });
  root.addEventListener('touchmove', (event) => {
    if (!touch || event.touches.length !== 1) { touch = null; return; }
    touch.dy = touch.y - event.touches[0].clientY;
    const dx = touch.x - event.touches[0].clientX;
    touch.horizontal = Math.abs(dx) > Math.abs(touch.dy);
    if (touch.horizontal) return;
    if (canScroll(activeSurface(), Math.sign(touch.dy))) { touch.scrolling = true; return; }
    if (!touch.scrolling && event.cancelable) event.preventDefault();
  }, { passive: false });
  root.addEventListener('touchend', () => {
    if (touch && !touch.scrolling && !touch.horizontal && Math.abs(touch.dy) > 60) step(Math.sign(touch.dy));
    touch = null;
  });
  root.addEventListener('touchcancel', () => { touch = null; });
  reduced.addEventListener('change', () => {
    if (reduced.matches) root.getAnimations({ subtree: true }).forEach((animation) => animation.finish());
  });

  renderStack();
  status();
  return { expand, step };
}
