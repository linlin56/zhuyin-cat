// The map (main screen basically): overall progress, with units and lessons.
(function () {
  'use strict';
  const { $, t } = ZC;

  /** Returns the glyph shown on a lesson's button: its keys, or a sign for its kind. */
  function nodeGlyph(l) { return ({ intro: l.keys && l.keys.join(''), drill: '<i class="bi bi-arrow-repeat"></i>', syll: '音', words: '詞', sentences: '句' })[l.type]; }

  /** Returns a small rounded badge. */
  function pill(text) { return `<span class="badge rounded-pill bg-body-tertiary text-body border fw-normal fs-6">${text}</span>`; }

  /** Returns the button of one lesson, with its state (done, current, locked) and stars. */
  function lessonButton(l, cur) {
    const ok = ZC.isUnlocked(l), st = ZC.starsOf(l.id);
    const cls = st ? 'done' : (l.id === cur.id ? 'current' : '');
    return `<button type="button" class="btn zc-node ${cls}" data-start="${l.id}" ${ok ? '' : 'disabled'} title="${ok ? '' : t('locked')}">
      <span class="zc-node-title zc-zh">${nodeGlyph(l)}</span>
      <span class="zc-node-type">${ZC.typeLabel(l.type)}</span>
      <span class="zc-stars">${ZC.starIcons(st)}</span>
    </button>`;
  }

  /** Returns the card of one unit and its lessons. */
  function unitCard(u, cur) {
    return `
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="zc-unit-badge zc-zh">${u.icon}</div>
            <div>
              <div class="small fw-semibold text-uppercase text-primary-emphasis">${t('unit', { n: u.id })}</div>
              <h2 class="h5 m-0">${t('unit' + u.id)}</h2>
              <div class="small text-body-secondary">${t('unit' + u.id + 'd')}</div>
            </div>
          </div>
          <div class="d-flex flex-wrap gap-2">${u.lessons.map(l => lessonButton(l, cur)).join('')}</div>
        </div>
      </div>`;
  }

  /** Draws the map screen. */
  function render() {
    const total = Lessons.ORDER.length * 3;
    const got = Lessons.ORDER.reduce((a, l) => a + ZC.starsOf(l.id), 0);
    const cur = ZC.currentLesson();
    $('#screen-home').innerHTML = `
      <div class="card mb-4">
        <div class="card-body p-4">
          <h1 class="h3 fw-semibold">${t('tagline')}</h1>
          <div class="d-flex flex-wrap gap-2 my-3">
            ${pill(t('progressStars', { n: got, max: total }))}
            ${pill(t('progressKeys', { n: ZC.learnedKeys().length, max: Layout.ALL_ZY.length }))}
          </div>
          <button type="button" class="btn btn-primary btn-lg" data-start="${cur.id}">
            <i class="bi bi-play-fill" aria-hidden="true"></i> ${got ? t('continue') : t('start')} · <span class="zc-zh">${ZC.lessonTitle(cur)}</span>
          </button>
        </div>
      </div>
      ${Lessons.UNITS.map(u => unitCard(u, cur)).join('')}
      <div class="card">
        <div class="card-body d-flex flex-wrap align-items-center gap-3">
          <div class="flex-grow-1">
            <h2 class="h5 mb-1">${t('speedTitle')}</h2>
            <p class="small text-body-secondary m-0">${t('speedDesc')}</p>
          </div>
          <button type="button" class="btn btn-primary" data-nav="speed"><i class="bi bi-lightning-charge" aria-hidden="true"></i> ${t('speedStart')}</button>
        </div>
      </div>`;
  }

  ZC.Home = { render };
})();
