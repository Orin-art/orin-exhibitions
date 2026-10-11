// A native modal keeps focus inside the image viewer and makes the deck inert.
export function createProjectPreview({ root, projects, asset }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'project-preview';
  dialog.setAttribute('aria-labelledby', 'preview-title');
  dialog.innerHTML = `
    <header class="preview-header">
      <span class="preview-brand">orin <span>/ WORK</span></span>
      <button class="preview-close" aria-label="Close preview" autofocus>Close <span aria-hidden="true">×</span></button>
    </header>
    <div class="preview-stage"><img class="preview-image" alt=""><p class="preview-error" role="status" hidden>Preview unavailable. Please try another work.</p></div>
    <footer class="preview-footer">
      <div class="preview-caption"><h2 id="preview-title"></h2><p class="preview-description"></p></div>
      <nav class="preview-controls" aria-label="Preview images">
        <button class="preview-previous" aria-label="Previous work">←</button>
        <span class="preview-counter" aria-live="polite" aria-atomic="true"></span>
        <button class="preview-next" aria-label="Next work">→</button>
      </nav>
    </footer>`;
  document.body.append(dialog);
  const image = dialog.querySelector('.preview-image');
  const title = dialog.querySelector('#preview-title');
  const description = dialog.querySelector('.preview-description');
  const counter = dialog.querySelector('.preview-counter');
  const error = dialog.querySelector('.preview-error');
  let current = 0;
  let trigger = null;

  function show(index) {
    current = (index + projects.length) % projects.length;
    const project = projects[current];
    title.textContent = project.title;
    description.textContent = project.discipline;
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
    error.hidden = true;
    image.hidden = false;
    image.alt = project.alt;
    image.src = asset(project.previewAsset ?? project.asset);
  }

  image.addEventListener('error', () => { image.hidden = true; error.hidden = false; });
  dialog.querySelector('.preview-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.preview-previous').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.preview-next').addEventListener('click', () => show(current + 1));
  dialog.querySelector('.preview-controls').hidden = projects.length < 2;

  // Only a press AND release on the background dismisses; dragging off the image does not.
  let pressedBackground = false;
  const isBackground = (target) => target === dialog || target === dialog.querySelector('.preview-stage');
  dialog.addEventListener('pointerdown', (event) => { pressedBackground = isBackground(event.target); });
  dialog.addEventListener('click', (event) => {
    if (pressedBackground && isBackground(event.target)) dialog.close();
    pressedBackground = false;
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Tab') {
      const buttons = [...dialog.querySelectorAll('button')].filter(button => !button.disabled && !button.closest('[hidden]'));
      const first = buttons[0];
      const last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
    // Esc retains native dialog behavior; Tab wraps within the viewer controls.
    event.stopPropagation();
  });
  dialog.addEventListener('close', () => {
    // Native close restores focus synchronously. Its queued event must not
    // steal focus from a different card the user has already selected.
    if (!dialog.open && trigger?.isConnected &&
        (document.activeElement === document.body || dialog.contains(document.activeElement))) {
      trigger.focus({ preventScroll: true });
    }
  });
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-project]');
    if (!button || root.dataset.busy === 'true' || dialog.open) return;
    const index = Number(button.dataset.project);
    if (!projects[index]) return;
    trigger = button;
    show(index);
    dialog.showModal();
  });
  return { isOpen: () => dialog.open };
}
