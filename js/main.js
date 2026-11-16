// Navigation between screens, global keyboard and click handling, and start-up.
(function () {
  'use strict';
  const { $, $$ } = ZC;

  // Each screen's drawing function, by name.
  const SCREENS = {
    home: function () { ZC.Home.render(); },
    lesson: function (id) { ZC.Lesson.start(id); },
    results: function (r) { ZC.Results.render(r); },
    speed: function () { ZC.Speed.render(); },
    settings: function () { ZC.Settings.render(); },
  };
  ZC.screen = 'home';

  /** Shows a screen, passing it its arguments (a lesson id, a result...). */
  ZC.go = function (name, ...args) {
    if (ZC.screen === 'speed' && name !== 'speed') ZC.Speed.stop();
    ZC.screen = name;
    document.body.classList.toggle('zc-compact', name === 'lesson' || name === 'speed');
    $$('.zc-screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
    const navName = name === 'lesson' || name === 'results' ? 'home' : name;
    $$('.nav [data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === navName));
    ZC.blur();
    window.scrollTo({ top: 0 });
    SCREENS[name](...args);
  };

  /** Redraws the current screen, after a change of language or keyboard labels. */
  ZC.rerender = function () {
    if (ZC.screen === 'lesson') ZC.Lesson.relabel();
    else SCREENS[ZC.screen]();
  };

  window.addEventListener('keydown', e => {
    Sfx.init();
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (ZC.Modal.isOpen()) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ZC.Modal.hide(); }
      return;
    }
    if (ZC.screen === 'lesson') ZC.Lesson.onKey(e);
    else if (ZC.screen === 'speed') ZC.Speed.onKey(e);
    else if (ZC.screen === 'results') ZC.Results.onKey(e);
  });

  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); Sfx.init(); Sfx.click(); ZC.go(nav.dataset.nav); return; }
    const st = e.target.closest('[data-start]');
    if (st && !st.disabled) { Sfx.init(); Sfx.click(); ZC.go('lesson', st.dataset.start); return; }
    const lb = e.target.closest('[data-lang]');
    if (lb) { Sfx.init(); Sfx.click(); ZC.setLang(lb.dataset.lang); return; }
    if (e.target.closest('[data-theme-toggle]')) ZC.setTheme(ZC.resolvedTheme() === 'dark' ? 'light' : 'dark');
  });

  // iOS only unlocks Web Audio inside touchend/click handlers.
  ['touchend', 'click'].forEach(ev => document.addEventListener(ev, () => Sfx.init(), { passive: true }));

  document.addEventListener('visibilitychange', () => { if (document.hidden) ZC.Speed.pause(); });
  window.addEventListener('blur', () => ZC.Speed.pause());

  Sfx.setEnabled(ZC.S.sound);
  Sfx.setVolume(ZC.S.volume);
  ZC.applyStaticI18n();
  ZC.go('home');
  if (!ZC.S.onboarded) ZC.Modal.showWelcome();
  Layout.detectLabels().then(ok => { if (ok) ZC.rerender(); });
})();
