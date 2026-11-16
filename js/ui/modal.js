// The Bootstrap modal used for the welcome message and the lesson help.
(function () {
  'use strict';
  const { $, t } = ZC;

  const el = $('#modal');
  const modal = bootstrap.Modal.getOrCreateInstance(el);
  let open = false;
  let onClose = null;

  /** Shows the modal with the given content and calls callback once it is closed. */
  function show(html, callback = null) {
    $('.modal-content', el).innerHTML = html;
    onClose = callback;
    open = true;
    modal.show();
  }

  /** Closes the modal. */
  function hide() { modal.hide(); }

  /** Tells whether the modal is open (typing goes to it, not to the game). */
  function isOpen() { return open; }

  el.addEventListener('hide.bs.modal', () => { open = false; });
  el.addEventListener('hidden.bs.modal', () => {
    Sfx.init(); Sfx.click();
    ZC.blur();
    const cb = onClose; onClose = null;
    if (cb) cb();
  });

  /** Shows the first-visit welcome, adapted to touch devices. */
  function showWelcome() {
    const items = ZC.TOUCH ? ['welcomeTouch1', 'welcome3', 'welcome4', 'welcomeTouch2'] : ['welcome1', 'welcome2', 'welcome3', 'welcome4'];
    show(`
      <div class="modal-header"><h2 class="modal-title h5">${t('welcomeTitle')}</h2></div>
      <div class="modal-body"><ul class="mb-0">${items.map(k => `<li class="mb-1">${t(k)}</li>`).join('')}</ul></div>
      <div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">${t('welcomeGo')}</button></div>`,
      () => { ZC.S.onboarded = true; Store.save(); Sfx.ding(); });
  }

  ZC.Modal = { show, hide, isOpen, showWelcome };
})();
