// The results of a lesson: stars, stats, keys to practise, and what to do next.
(function () {
  'use strict';
  const { $, t } = ZC;
  let last = null;

  /** Returns the lesson after the one just played, if it can be played. */
  function nextLesson(r) {
    const next = Lessons.ORDER[Lessons.BY_ID[r.id].index + 1];
    return next && ZC.isUnlocked(next) ? next : null;
  }

  /** Returns one stat tile (value and label). */
  function stat(value, label) { return `<div class="col"><div class="bg-body-tertiary rounded p-2"><div class="h4 m-0">${value}</div><div class="small text-body-secondary">${label}</div></div></div>`; }

  /** Draws the results of a lesson just finished, or redraws the last ones (without replaying the stars). */
  function render(result) {
    const fresh = Boolean(result);
    const r = result || last;
    if (!r) return ZC.go('home');
    last = r;
    const def = Lessons.BY_ID[r.id];
    const next = nextLesson(r);
    const [g2, g3] = Lessons.GOALS[def.type];
    const el = $('#screen-results');
    el.innerHTML = `
      <div class="card mx-auto text-center" style="max-width: 36rem">
        <div class="card-body p-4">
          ${r.record ? `<span class="badge text-bg-primary mb-2">${t('newRecord')}</span>` : ''}
          <h1 class="h3">${t('resTitle' + r.stars)}</h1>
          <div class="zc-big-stars my-2">${[0, 1, 2].map(i => `<i class="bi bi-star-fill ${i < r.stars ? 'on' : ''} ${fresh ? 'pop' : ''}" style="animation-delay:${0.15 + i * 0.25}s"></i>`).join('')}</div>
          ${r.stars ? '' : `<p class="text-body-secondary">${t('resNeed', { acc: Lessons.ACC.one })}</p>`}
          <div class="row row-cols-2 row-cols-sm-4 g-2 my-3">
            ${stat(r.kpm, t('kpm'))}${stat(r.acc + ' %', t('accuracy'))}${stat(r.errors, t('errors'))}${stat(r.time + ' s', t('time'))}
          </div>
          <p class="small text-body-secondary">${t('goal2', { kpm: g2, acc: Lessons.ACC.two })} · ${t('goal3', { kpm: g3, acc: Lessons.ACC.three })}</p>
          ${r.tricky.length ? `<p><span class="small text-body-secondary me-1">${t('trickyKeysLabel')}</span>${r.tricky.map(k => `<span class="badge bg-danger-subtle text-danger-emphasis fw-normal fs-5 me-1 zc-zh">${k === ' ' ? '␣' : k}</span>`).join('')}</p>` : ''}
          <div class="d-flex flex-wrap justify-content-center gap-2">
            <button type="button" class="btn btn-outline-secondary" data-act="map"><i class="bi bi-map"></i> ${t('backMap')}</button>
            <button type="button" class="btn ${next && r.stars ? 'btn-outline-secondary' : 'btn-primary'}" data-act="retry"><i class="bi bi-arrow-counterclockwise"></i> ${t('retry')}</button>
            ${next ? `<button type="button" class="btn btn-primary" data-act="next">${t('next')} <i class="bi bi-arrow-right"></i></button>` : ''}
          </div>
        </div>
      </div>`;
    if (fresh) for (let i = 0; i < r.stars; i++) setTimeout(() => Sfx.star(i), 150 + i * 250);
    $('[data-act=map]', el).onclick = () => ZC.go('home');
    $('[data-act=retry]', el).onclick = () => ZC.go('lesson', r.id);
    if (next) $('[data-act=next]', el).onclick = () => ZC.go('lesson', next.id);
  }

  /** Enter goes to the next lesson after a success, else replays this one. */
  function onKey(e) {
    if (e.key !== 'Enter' || !last) return;
    e.preventDefault();
    const next = nextLesson(last);
    ZC.go('lesson', last.stars && next ? next.id : last.id);
  }

  ZC.Results = { render, onKey };
})();
