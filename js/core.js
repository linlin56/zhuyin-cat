// Shared state and helpers for every screen, all on the ZC namespace.
window.ZC = window.ZC || {};
(function () {
  'use strict';

  /** Returns the first element matching a selector. */
  ZC.$ = function (sel, el = document) { return el.querySelector(sel); };
  /** Returns every element matching a selector, as an array. */
  ZC.$$ = function (sel, el = document) { return [...el.querySelectorAll(sel)]; };

  ZC.S = Store.load();
  ZC.TOUCH = matchMedia('(pointer: coarse)').matches;
  document.body.classList.toggle('zc-touch', ZC.TOUCH);

  /** Picks the UI language from the browser's: French or Chinese when it is one of them, English otherwise. */
  function detectLang() {
    const l = (navigator.language || 'fr').toLowerCase();
    if (l.startsWith('zh')) return 'zh';
    if (l.startsWith('fr')) return 'fr';
    return 'en';
  }
  ZC.lang = ZC.S.lang || detectLang();

  /** Translates a key in the current language, filling {placeholders} from vars. */
  ZC.t = function (key, vars) {
    let str = (I18N[ZC.lang] && I18N[ZC.lang][key]) ?? I18N.fr[key] ?? key;
    if (vars) Object.keys(vars).forEach(k => { str = str.split('{' + k + '}').join(vars[k]); });
    return str;
  };

  /** Translates the static page (header) and marks the active language button. */
  ZC.applyStaticI18n = function () {
    document.documentElement.lang = ZC.lang === 'zh' ? 'zh-Hant-TW' : ZC.lang;
    ZC.$$('[data-i18n]').forEach(el => { el.textContent = ZC.t(el.dataset.i18n); });
    ZC.$$('[data-lang]').forEach(b => b.classList.toggle('active', b.dataset.lang === ZC.lang));
    ZC.applyTheme();
  };

  /** Switches the UI language, saves it and redraws the current screen. */
  ZC.setLang = function (l) {
    ZC.lang = l; ZC.S.lang = l; Store.save();
    ZC.applyStaticI18n();
    ZC.rerender();
  };

  // Colour mode (Bootstrap's data-bs-theme): the user's choice, else the device's, as in MiningCat.
  const darkQuery = matchMedia('(prefers-color-scheme: dark)');

  /** Returns the colour mode in use: "light" or "dark". */
  ZC.resolvedTheme = function () { return (ZC.S.theme === 'light' || ZC.S.theme === 'dark' ? ZC.S.theme : (darkQuery.matches ? 'dark' : 'light')); };

  /** Applies the colour mode to the page and updates the day/night button. */
  ZC.applyTheme = function () {
    const theme = ZC.resolvedTheme();
    document.documentElement.dataset.bsTheme = theme;
    ZC.$$('[data-theme-toggle]').forEach(b => {
      b.querySelector('i').className = `bi bi-${theme === 'dark' ? 'sun' : 'moon-stars'}`;
      b.title = ZC.t(theme === 'dark' ? 'dayMode' : 'nightMode');
      b.setAttribute('aria-label', b.title);
    });
  };

  /** Saves a colour mode choice ("system", "light" or "dark") and applies it. */
  ZC.setTheme = function (theme) {
    ZC.S.theme = theme; Store.save();
    ZC.applyTheme();
    if (ZC.screen === 'settings') ZC.Settings.render();
  };
  darkQuery.addEventListener('change', () => ZC.applyTheme());

  /** Shows a short Bootstrap toast at the bottom of the screen. */
  ZC.toast = function (msg) {
    const el = document.createElement('div');
    el.className = 'toast align-items-center text-bg-dark border-0';
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="toast-body">${msg}</div>`;
    ZC.$('#toasts').appendChild(el);
    el.addEventListener('hidden.bs.toast', () => el.remove());
    bootstrap.Toast.getOrCreateInstance(el, { delay: 2200 }).show();
  };

  /** Blurs the focused element so Space and Enter don't press a button by accident. */
  ZC.blur = function () { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); };

  // Progress

  /** Returns the best stars (0 to 3) earned on a lesson. */
  ZC.starsOf = function (id) { return (ZC.S.lessons[id] && ZC.S.lessons[id].stars) || 0; };

  /** Tells whether a lesson can be played: the first one, or the previous one has a star. */
  ZC.isUnlocked = function (l) { return ZC.S.unlockAll || l.index === 0 || ZC.starsOf(Lessons.ORDER[l.index - 1].id) >= 1; };

  /** Returns the first unlocked lesson without a star, else the last lesson. */
  ZC.currentLesson = function () { return Lessons.ORDER.find(l => ZC.isUnlocked(l) && ZC.starsOf(l.id) === 0) || Lessons.ORDER[Lessons.ORDER.length - 1]; };

  /** Returns the zhuyin keys introduced by the lessons already passed. */
  ZC.learnedKeys = function () {
    if (ZC.S.unlockAll) return Layout.ALL_ZY.slice();
    const keys = new Set();
    Lessons.ORDER.forEach(l => { if (l.type === 'intro' && ZC.starsOf(l.id) >= 1) l.keys.forEach(k => keys.add(k)); });
    return [...keys];
  };

  // Lesson labels

  /** Returns a lesson's title: its new keys, or the name of its kind. */
  ZC.lessonTitle = function (l) {
    if (l.type === 'intro') return l.keys.join(' ');
    if (l.type === 'drill') return ZC.t('typeDrill');
    if (l.type === 'syll') return ZC.t('typeSyll');
    if (l.type === 'words') return ZC.t('words' + l.id.split('-')[1]);
    return ZC.t('typeSentences') + ' ' + l.id.split('-')[1];
  };

  /** Returns the translated name of a lesson kind (intro, drill, syll, words, sentences). */
  ZC.typeLabel = function (type) { return ZC.t({ intro: 'typeIntro', drill: 'typeDrill', syll: 'typeSyll', words: 'typeWords', sentences: 'typeSentences' }[type]); };

  /** Returns three star icons, the first n of them lit. */
  ZC.starIcons = function (n) { return [0, 1, 2].map(i => `<i class="bi bi-star-fill ${i < n ? 'on' : ''}"></i>`).join(''); };
})();
