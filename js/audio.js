// Using web audio to generate sounds, so that the app is self-contained and works offline.
const Sfx = (function () {
  let ctx = null, master = null, noise = null;
  let enabled = true, volume = 0.7;

  /** Creates the audio context on the first user gesture, or resumes it. */
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    const len = Math.floor(ctx.sampleRate * 0.25);
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  /** Tells whether sounds can be played. */
  function ready() { return enabled && ctx && master; }
  /** Returns a random number between a and b. */
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /** Plays a short filtered noise, the base of every click. */
  function burst({ freq, q = 1.2, dur = 0.04, gain = 0.6, delay = 0 }) {
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = rnd(0.9, 1.1);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t, rnd(0, 0.1), dur + 0.02);
  }

  /** Plays a short note, optionally sliding to another pitch. */
  function tone({ freq, to = null, type = 'sine', dur = 0.1, gain = 0.3, delay = 0, attack = 0.003 }) {
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  /** Typewriter strike: metallic click and soft thud. */
  function key() {
    if (!ready()) return;
    burst({ freq: rnd(2600, 3800), q: 2, dur: 0.035, gain: 0.9 });
    burst({ freq: rnd(900, 1300), q: 1, dur: 0.05, gain: 0.5, delay: 0.004 });
    tone({ freq: rnd(110, 150), to: 60, type: 'triangle', dur: 0.06, gain: 0.35 });
  }

  /** The deeper sound of the space bar. */
  function space() {
    if (!ready()) return;
    burst({ freq: rnd(700, 900), q: 0.8, dur: 0.08, gain: 0.8 });
    burst({ freq: 2200, q: 2, dur: 0.03, gain: 0.4, delay: 0.01 });
    tone({ freq: 90, to: 50, type: 'triangle', dur: 0.09, gain: 0.4 });
  }

  /** A soft buzz for a wrong key. */
  function error() {
    if (!ready()) return;
    tone({ freq: 220, to: 160, type: 'square', dur: 0.14, gain: 0.08 });
    burst({ freq: 400, q: 0.7, dur: 0.06, gain: 0.4 });
  }

  /** The little end-of-line bell. */
  function ding() {
    if (!ready()) return;
    tone({ freq: 2093, type: 'sine', dur: 1.4, gain: 0.25 });
    tone({ freq: 3140, type: 'sine', dur: 0.9, gain: 0.1 });
    tone({ freq: 5230, type: 'sine', dur: 0.4, gain: 0.04 });
  }

  /** One note of the star chime, i picks the note. */
  function star(i = 0) {
    if (!ready()) return;
    const notes = [880, 1109, 1319, 1760];
    tone({ freq: notes[i % notes.length], type: 'triangle', dur: 0.35, gain: 0.25 });
    tone({ freq: notes[i % notes.length] * 2, type: 'sine', dur: 0.25, gain: 0.08 });
  }

  /** A pop when a falling key is typed. */
  function pop() {
    if (!ready()) return;
    tone({ freq: rnd(380, 460), to: rnd(900, 1100), type: 'sine', dur: 0.09, gain: 0.35 });
    burst({ freq: 3000, q: 1, dur: 0.02, gain: 0.3 });
  }

  /** A falling note when a life is lost. */
  function lose() {
    if (!ready()) return;
    tone({ freq: 392, to: 196, type: 'triangle', dur: 0.4, gain: 0.25 });
  }

  /** A light click for buttons. */
  function click() {
    if (!ready()) return;
    burst({ freq: 2500, q: 2, dur: 0.025, gain: 0.5 });
  }

  /** Turns all sounds on or off. */
  function setEnabled(v) { enabled = v; }
  /** Sets the master volume, from 0 to 1. */
  function setVolume(v) { volume = v; if (master) master.gain.value = v; }

  return { init, key, space, error, ding, star, pop, lose, click, setEnabled, setVolume };
})();
