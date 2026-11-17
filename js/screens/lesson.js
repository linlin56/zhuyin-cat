// A lesson: the text to type, live stats, the keyboard, and the scoring at the end.
(function () {
  'use strict';
  const { $, $$, t } = ZC;
  let run = null;

  /** Builds a new run of a lesson and draws its screen. */
  function start(id) {
    const built = Lessons.build(id);
    run = { ...built, pos: 0, errors: 0, errAt: new Set(), missByKey: {}, startT: 0, lastT: 0, active: 0, done: false };
    draw();
    if (!ZC.S.seen[id]) { ZC.S.seen[id] = true; Store.save(); showHelp(run.def); }
  }

  /** Draws the screen of the current run, showing the keys already typed. */
  function draw() {
    const def = run.def;
    const el = $('#screen-lesson');
    el.innerHTML = layout(def);
    run.cells = $$('.zc-c', el);
    run.blkEls = $$('.zc-blk', el);
    run.cells.forEach((c, i) => {
      if (i < run.pos) c.classList.add('done');
      if (i < run.pos && run.errAt.has(i)) c.classList.add('had-err');
    });
    run.keys = ZC.Keyboard.render($('.zc-kb-card', el), zy => input(zy, null));
    // Light only the learned keys and Space; tones light up once their lesson is done.
    const extra = ['intro', 'drill', 'syll'].includes(def.type) ? [] : Layout.ALL_ZY;
    ZC.Keyboard.dimExcept(run.keys, new Set(def.pool.concat(extra, ' ')));
    $('[data-act=quit]', el).onclick = () => ZC.go('home');
    $('[data-act=restart]', el).onclick = () => ZC.go('lesson', def.id);
    $('[data-act=help]', el).onclick = () => showHelp(def);
    update();
  }

  /** Returns the HTML of the lesson screen. */
  function layout(def) {
    const newKeys = def.type === 'intro' ? `
      <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
        <span class="small text-body-secondary zc-new-keys-label">${t('newKeysLabel')}</span>
        ${def.keys.map(ZC.Keyboard.newKeyBadge).join('')}
      </div>` : '';
    const neutral = run.seq.includes('˙') && def.type !== 'intro' && def.type !== 'drill';
    return `
      <div class="d-flex align-items-center gap-2 mb-2">
        <button type="button" class="btn btn-outline-secondary" data-act="quit" title="${t('backMap')}" aria-label="${t('backMap')}"><i class="bi bi-arrow-left"></i></button>
        <h2 class="h5 m-0 text-nowrap zc-zh">${ZC.lessonTitle(def)}</h2>
        <span class="small text-body-secondary zc-lesson-meta">${t('unit', { n: def.unit })} · ${ZC.typeLabel(def.type)}</span>
        <div class="ms-auto d-flex gap-2">
          <button type="button" class="btn btn-outline-secondary" data-act="help" title="${t('help')}" aria-label="${t('help')}"><i class="bi bi-info-circle"></i></button>
          <button type="button" class="btn btn-outline-secondary" data-act="restart" title="${t('retry')}"><i class="bi bi-arrow-counterclockwise"></i><span class="zc-retry-label"> ${t('retry')}</span></button>
        </div>
      </div>
      <div class="progress mb-2" role="progressbar" style="height: .5rem"><div class="progress-bar"></div></div>
      ${newKeys}
      <div class="card zc-text-box mb-2"><div class="card-body"><div class="zc-text-inner zc-zh">${renderBlocks()}</div></div></div>
      ${neutral ? `<p class="small text-body-secondary mb-2">${t('neutralNote')}</p>` : ''}
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <div class="fw-semibold" data-live="hint"></div>
        <div class="small text-body-secondary">
          <span class="fw-semibold text-body fs-6" data-live="kpm">–</span> ${t('kpm')} ·
          <span class="fw-semibold text-body fs-6" data-live="acc">100</span> % ${t('accuracy')}
        </div>
      </div>
      <div class="card zc-kb-card"></div>
      <p class="small text-body-secondary text-center mt-2 mb-0 zc-lesson-hint">${t(ZC.TOUCH ? 'lessonHintTouch' : 'lessonHint')}</p>`;
  }

  /** Returns the text to type: one block per syllable or group, one cell per key. */
  function renderBlocks() {
    return run.blocks.map(b => {
      const cells = run.seq.slice(b.start, b.start + b.len).map(k =>
        `<span class="zc-c ${k === ' ' ? 'sp' : ''}">${k === ' ' ? '␣' : k}</span>`).join('');
      return `<div class="zc-blk ${b.wordEnd ? 'word-end' : ''} ${b.hanzi ? '' : 'no-hz'}"><div class="zc-hz">${b.hanzi || ''}</div><div class="zc-cells">${cells}</div></div>`;
    }).join('');
  }

  /** Shows the lesson's help: what it teaches and the rules. */
  function showHelp(def) {
    const learn = [];
    function label(zy) { return Layout.labels[Layout.zyToCode[zy]]; }
    if (def.type === 'intro') {
      learn.push(`${t('learnIntro')}<div class="d-flex flex-wrap justify-content-center gap-2 mt-2">${def.keys.map(ZC.Keyboard.newKeyBadge).join('')}</div>`);
      if (def.index === 0) {
        if (ZC.TOUCH) learn.push(t('learnTouch'));
        else { learn.push(t('learnHome', { f: label('ㄑ'), j: label('ㄨ') })); learn.push(t('learnColors')); }
      }
      if (def.keys.some(k => Layout.TONES.includes(k))) learn.push(t('learnTones'));
      if (def.keys.includes('˙')) learn.push(t('learnNeutral'));
    } else if (def.type === 'drill') learn.push(t('learnDrill'));
    else if (def.type === 'syll') learn.push(t(def.pool.some(k => Layout.TONES.includes(k)) ? 'learnSyll' : 'learnSyllSpace'));
    else if (def.type === 'words') learn.push(t('learnWords'));
    else learn.push(t('learnSentences'));
    if (def.type !== 'intro' && def.items && def.items.some(i => i.includes('˙'))) learn.push(t('learnNeutral'));

    const rules = [t('rule1')];
    if (def.type !== 'intro' && def.type !== 'drill') rules.push(t('ruleSpace'));
    rules.push(t(ZC.TOUCH ? 'rule3Touch' : 'rule3'));

    ZC.Modal.show(`
      <div class="modal-header">
        <div>
          <div class="small text-body-secondary">${t('unit', { n: def.unit })} · ${ZC.typeLabel(def.type)}</div>
          <h2 class="modal-title h5 zc-zh">${ZC.lessonTitle(def)}</h2>
        </div>
      </div>
      <div class="modal-body">
        <h3 class="h6 text-primary-emphasis">${t('learnTitle')}</h3>${learn.map(x => `<p>${x}</p>`).join('')}
        <h3 class="h6 text-primary-emphasis">${t('rulesTitle')}</h3><ul class="mb-0">${rules.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">${t('gotIt')}</button></div>`);
  }

  /** Redraws the lesson in the new language, keeping the progress of the run. */
  function relabel() { if (run) draw(); }

  /** Updates the cursor, progress bar, highlighted key, finger hint and live stats. */
  function update() {
    const { pos, seq, cells, keys } = run;
    cells.forEach((c, i) => c.classList.toggle('cur', i === pos));
    $('#screen-lesson .progress-bar').style.width = (pos / seq.length * 100) + '%';
    Object.values(keys).forEach(k => k.classList.remove('next'));
    const hint = $('[data-live=hint]');
    if (pos < seq.length) {
      const zy = seq[pos], code = Layout.zyToCode[zy];
      keys[code] && keys[code].classList.add('next');
      const f = Layout.FINGER[code];
      const glyph = zy === ' ' ? t('toneHint') : `<span class="fs-5 zc-zh">${zy}</span>`;
      hint.innerHTML = ZC.TOUCH ? glyph
        : `<span class="zc-finger-dot" style="background:var(--zc-f-${f})"></span>${glyph}${zy === ' ' ? '' : ' · ' + t('keyOn', { key: Layout.labels[code] })} · ${t('fingers_' + f)}`;
      // Keep the current line at the top of the box so upcoming lines stay visible.
      const top = cells[pos].closest('.zc-blk').offsetTop;
      $('.zc-text-inner').style.transform = `translateY(${-(top - run.blkEls[0].offsetTop)}px)`;
    } else hint.innerHTML = '';
    $('[data-live=acc]').textContent = accuracy();
    $('[data-live=kpm]').textContent = run.active > 1500 ? kpm() : '–';
  }

  /** Returns the accuracy so far, in percent. */
  function accuracy() {
    const typed = run.pos + run.errors;
    return typed ? Math.round(100 * run.pos / typed) : 100;
  }

  /** Returns the speed so far, in correct keys per minute of active typing. */
  function kpm() { return Math.round(run.pos / (Math.max(run.active, 1000) / 60000)); }

  /** Handles one typed zhuyin: advances on the right key, counts an error otherwise. */
  function input(zy, code) {
    if (!run || run.done) return;
    const now = performance.now();
    if (!run.startT) { run.startT = now; run.lastT = now; }
    const expected = run.seq[run.pos];
    ZC.Keyboard.flash(run.keys, code || Layout.zyToCode[zy]);
    if (zy === expected) {
      run.active += Math.min(now - run.lastT, 4000);
      run.lastT = now;
      const c = run.cells[run.pos];
      c.classList.add('done');
      if (run.errAt.has(run.pos)) c.classList.add('had-err');
      zy === ' ' ? Sfx.space() : Sfx.key();
      run.pos++;
      if (run.pos >= run.seq.length) return finish();
    } else {
      run.errors++;
      run.errAt.add(run.pos);
      run.missByKey[expected] = (run.missByKey[expected] || 0) + 1;
      const c = run.cells[run.pos];
      c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
      ZC.Keyboard.flash(run.keys, code || Layout.zyToCode[zy], 'wrong', 220);
      Sfx.error();
    }
    update();
  }

  /** Scores the finished lesson, saves it and opens the results. */
  function finish() {
    run.done = true;
    update();
    Sfx.ding();
    const def = run.def;
    const acc = accuracy(), speed = kpm();
    const [g2, g3] = Lessons.GOALS[def.type];
    let n = 0;
    if (acc >= Lessons.ACC.one) n = 1;
    if (n && acc >= Lessons.ACC.two && speed >= g2) n = 2;
    if (n === 2 && acc >= Lessons.ACC.three && speed >= g3) n = 3;
    const record = Store.recordLesson(def.id, { stars: n, kpm: speed, acc });
    const tricky = Object.entries(run.missByKey).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
    const result = { id: def.id, stars: n, kpm: speed, acc, errors: run.errors, time: Math.round(run.active / 1000), tricky, record };
    // Opens the results after the bell, unless the player has left or restarted meanwhile.
    const finished = run;
    setTimeout(() => { if (run === finished && ZC.screen === 'lesson') ZC.go('results', result); }, 450);
  }

  /** Handles a physical key press during a lesson. */
  function onKey(e) {
    if (e.key === 'Escape') { ZC.go('home'); return; }
    const zy = Layout.fromEvent(e);
    if (zy === null) return;
    e.preventDefault();
    if (e.repeat) return;
    input(zy, e.code in Layout.codeToZy ? e.code : null);
  }

  ZC.Lesson = { start, relabel, onKey };
})();
