// The on-screen zhuyin keyboard, shared by the lessons and the speed challenge.
(function () {
  'use strict';
  const { $$, t } = ZC;

  /** Draws the keyboard in a container and calls onTap(zhuyin, code) when a key is touched; returns the keys by code. */
  function render(container, onTap) {
    const keys = {};
    const rows = Layout.ROWS.map((row, r) => `<div class="zc-kb-row r${r}">${row.map(([code, zy]) =>
      `<button type="button" class="zc-k ${code === 'KeyF' || code === 'KeyJ' ? 'home' : ''}" data-code="${code}" data-f="${Layout.FINGER[code]}" tabindex="-1">
        <span class="lt">${Layout.labels[code]}</span><span class="zy zc-zh">${zy}</span></button>`).join('')}</div>`).join('');
    container.innerHTML = `<div class="zc-kb">${rows}<div class="zc-kb-row"><button type="button" class="zc-k space" data-code="Space" data-f="th" tabindex="-1"><span class="zy">${t('toneHint')}</span></button></div></div>`;
    $$('.zc-k', container).forEach(k => {
      keys[k.dataset.code] = k;
      k.addEventListener('pointerdown', ev => { ev.preventDefault(); Sfx.init(); onTap && onTap(Layout.codeToZy[k.dataset.code], k.dataset.code); });
    });
    return keys;
  }

  /** Briefly adds a class to a key (pressed, wrong) to show what was typed. */
  function flash(keys, code, cls = 'press', ms = 110) {
    const k = keys && keys[code];
    if (!k) return;
    k.classList.add(cls);
    setTimeout(() => k.classList.remove(cls), ms);
  }

  /** Dims the keys whose zhuyin is not in the given set. */
  function dimExcept(keys, allowed) {
    Object.entries(keys).forEach(([code, k]) => k.classList.toggle('dim', !allowed.has(Layout.codeToZy[code])));
  }

  /** Returns a badge for a new key: its letter and finger on desktop, just the glyph on touch. */
  function newKeyBadge(zy) {
    const code = Layout.zyToCode[zy];
    const info = ZC.TOUCH ? '' : `<small class="text-body-secondary lh-sm">${t('keyOn', { key: Layout.labels[code] })}<br>${t('fingers_' + Layout.FINGER[code])}</small>`;
    return `<span class="d-inline-flex align-items-center gap-2 border border-primary-subtle bg-primary-subtle rounded px-2 py-1"><span class="fs-4 lh-1 zc-zh">${zy}</span>${info}</span>`;
  }

  ZC.Keyboard = { render, flash, dimExcept, newKeyBadge };
})();
