// Progress saved in the browser (localStorage), with JSON export and import.
const Store = (function () {
  const KEY = 'zhuyincat-v1';
  const APP_ID = 'zhuyincat'; // the "app" field of exported files

  /** Returns a fresh save with every setting at its default. */
  function defaults() {
    return {
      v: 1,
      lang: null,
      theme: 'system',  // colour mode: system, light or dark
      sound: true,
      volume: 0.7,
      unlockAll: false,
      onboarded: false,
      seen: {},         // lesson id -> true once its help popup was shown
      lessons: {},      // id -> { stars, kpm, acc, plays }
      speedBest: 0,     // best score of the speed challenge
    };
  }

  // The one save object: never replaced, only refilled, so that ZC.S always points to it.
  const s = defaults();

  /** Tells whether a value is a plain object (not null, not an array). */
  function isMap(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }

  /** Returns a save filled with defaults, or null when the data isn't a save. */
  function normalize(data) {
    if (!isMap(data) || !isMap(data.lessons)) return null;
    const out = Object.assign(defaults(), data);
    if (!isMap(out.seen)) out.seen = {};
    return out;
  }

  /** Refills the save object in place with new content. */
  function replace(next) {
    Object.keys(s).forEach(k => { delete s[k]; });
    Object.assign(s, next);
  }

  /** Reads the save from the browser, ignoring it when it is damaged. */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? normalize(JSON.parse(raw)) : null;
      if (data) replace(data);
    } catch (e) { replace(defaults()); }
    // Ask the browser not to evict our data under storage pressure.
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
    return s;
  }

  /** Writes the save to the browser. */
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  /** Returns the save object. */
  function get() { return s; }

  /** Keeps the best stars, speed and accuracy of a lesson; returns true for a new record. */
  function recordLesson(id, { stars, kpm, acc }) {
    const prev = s.lessons[id] || { stars: 0, kpm: 0, acc: 0, plays: 0 };
    const isRecord = stars > prev.stars || (stars === prev.stars && kpm > prev.kpm);
    s.lessons[id] = {
      stars: Math.max(prev.stars, stars),
      kpm: Math.max(prev.kpm, kpm),
      acc: Math.max(prev.acc, acc),
      plays: prev.plays + 1,
    };
    save();
    return isRecord && prev.plays > 0;
  }

  /** Returns the save as a JSON file's text. */
  function exportJson() {
    return JSON.stringify({ app: APP_ID, exportedAt: new Date().toISOString(), data: s }, null, 2);
  }

  /** Replaces the save with an exported file's content; throws when it isn't a save. */
  function importJson(text) {
    const obj = JSON.parse(text);
    const data = normalize(isMap(obj) && obj.app === APP_ID ? obj.data : obj);
    if (!data) throw new Error('invalid');
    replace(data);
    save();
  }

  /** Erases the progress, keeping the language, colours and sound settings. */
  function reset() {
    const keep = { lang: s.lang, theme: s.theme, sound: s.sound, volume: s.volume };
    replace(Object.assign(defaults(), keep, { onboarded: true }));
    save();
  }

  return { load, save, get, recordLesson, exportJson, importJson, reset };
})();
