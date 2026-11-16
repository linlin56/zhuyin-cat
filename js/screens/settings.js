// Settings: language, colours, sound, unlocking, and the save file.
(function () {
  'use strict';
  const { $, $$, t } = ZC;

  /** Returns a group of buttons, the one matching val pressed. */
  function group(name, opts, val) {
    return `<div class="btn-group btn-group-sm" role="group" data-seg="${name}">${opts.map(([v, l]) =>
      `<button type="button" class="btn btn-outline-primary ${v === val ? 'active' : ''}" data-v="${v}">${l}</button>`).join('')}</div>`;
  }

  /** Returns a Bootstrap switch. */
  function toggle(id, on) { return `<div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" role="switch" id="${id}" ${on ? 'checked' : ''}></div>`; }

  /** Returns one row of the settings list: a title, a control and an optional description. */
  function row(title, control, desc = '', forId = '') {
    return `
      <li class="list-group-item d-flex flex-wrap align-items-center gap-2 py-3">
        <label class="fw-semibold me-auto" ${forId ? `for="${forId}"` : ''}>${title}</label>${control}
        ${desc ? `<p class="small text-body-secondary w-100 m-0">${desc}</p>` : ''}
      </li>`;
  }

  /** Draws the settings screen and wires its controls. */
  function render() {
    const S = ZC.S;
    const el = $('#screen-settings');
    el.innerHTML = `
      <div class="mx-auto" style="max-width: 40rem">
        <h1 class="h3 mb-3">${t('settingsTitle')}</h1>
        <div class="card mb-3">
          <ul class="list-group list-group-flush">
            ${row(t('setLang'), group('lang', [['fr', 'Français'], ['en', 'English'], ['zh', '繁體中文']], ZC.lang))}
            ${row(t('setTheme'), group('theme', [['system', t('themeSystem')], ['light', t('themeLight')], ['dark', t('themeDark')]], S.theme))}
            ${row(t('setSound'), toggle('set-sound', S.sound), '', 'set-sound')}
            ${row(t('setVolume'), `<input type="range" class="form-range" style="max-width: 12rem" id="set-volume" min="0" max="1" step="0.05" value="${S.volume}">`, '', 'set-volume')}
            ${row(t('setKeyboard'), '', t('setKeyboardD'))}
            ${row(t('setUnlock'), toggle('set-unlock', S.unlockAll), t('setUnlockD'), 'set-unlock')}
          </ul>
        </div>
        <div class="card">
          <div class="card-body">
            <h2 class="h6">${t('setSave')}</h2>
            <p class="small text-body-secondary">${t('setSaveD')}</p>
            <div class="d-flex flex-wrap gap-2">
              <button type="button" class="btn btn-outline-secondary" data-act="export"><i class="bi bi-download"></i> ${t('setExport')}</button>
              <button type="button" class="btn btn-outline-secondary" data-act="import"><i class="bi bi-upload"></i> ${t('setImport')}</button>
              <button type="button" class="btn btn-outline-danger" data-act="reset"><i class="bi bi-trash"></i> ${t('setReset')}</button>
              <input type="file" accept="application/json,.json" hidden data-file>
            </div>
          </div>
        </div>
      </div>`;
    wire(el);
  }

  /** Connects the controls of the settings screen. */
  function wire(el) {
    const S = ZC.S;
    $$('[data-seg]', el).forEach(s => s.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      Sfx.click();
      if (s.dataset.seg === 'lang') ZC.setLang(b.dataset.v);
      else ZC.setTheme(b.dataset.v);
    }));
    $('#set-sound', el).addEventListener('change', ev => { S.sound = ev.target.checked; Sfx.setEnabled(S.sound); Store.save(); Sfx.click(); });
    $('#set-unlock', el).addEventListener('change', ev => { S.unlockAll = ev.target.checked; Store.save(); });
    $('#set-volume', el).addEventListener('input', ev => { S.volume = +ev.target.value; Sfx.setVolume(S.volume); Store.save(); });
    $('#set-volume', el).addEventListener('change', () => { Sfx.init(); Sfx.key(); });
    $('[data-act=export]', el).onclick = exportSave;
    const file = $('[data-file]', el);
    $('[data-act=import]', el).onclick = () => file.click();
    file.onchange = () => importSave(file.files[0]);
    $('[data-act=reset]', el).onclick = () => {
      if (!confirm(t('setResetConfirm'))) return;
      Store.reset(); render();
    };
  }

  /** Downloads the progress as a JSON file. */
  function exportSave() {
    const blob = new Blob([Store.exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `zhuyincat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /** Loads progress from a JSON file chosen by the user. */
  async function importSave(f) {
    if (!f) return;
    try {
      Store.importJson(await f.text());
      if (ZC.S.lang) ZC.lang = ZC.S.lang;
      Sfx.setEnabled(ZC.S.sound); Sfx.setVolume(ZC.S.volume);
      ZC.applyStaticI18n(); render(); ZC.toast(t('setImportOk'));
    } catch (e) { ZC.toast(t('setImportErr')); }
  }

  ZC.Settings = { render };
})();
