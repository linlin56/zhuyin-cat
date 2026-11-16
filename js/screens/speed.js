// The speed challenge: zhuyin keys fall, type them before they reach the bottom.
(function () {
  'use strict';
  const { $, $$, t } = ZC;
  let g = null, raf = 0;

  // Difficulty: a new level every 8 keys typed. Each level makes keys fall faster and more often;
  // from level 4, they sometimes come in pairs.
  const KEYS_PER_LEVEL = 8;
  /** Returns a falling speed for a level, in px/s. */
  function fallSpeed(level) { return 60 + level * 12 + Math.random() * 20; }
  /** Returns the delay before the next key for a level, in ms. */
  function spawnDelay(level) { return Math.max(300, 1100 - level * 100); }

  /** Returns the keys in play: the learned ones, or the home row while fewer than 4 are learned. */
  function pool() {
    const k = ZC.learnedKeys();
    return k.length >= 4 ? k : Lessons.UNITS[0].lessons.filter(l => l.type === 'intro').flatMap(l => l.keys);
  }

  /** Returns three dots for the lives, the lost ones greyed out. */
  function lifeDots(n) { return [0, 1, 2].map(i => `<i class="zc-life ${i < n ? '' : 'lost'}"></i>`).join(''); }

  /** Returns one counter tile (score, level...). */
  function stat(key, label, value) { return `<div class="col"><div class="card zc-stat py-2 h-100"><div class="small text-body-secondary">${label}</div><div class="h4" data-a="${key}">${value}</div></div></div>`; }

  /** Draws the challenge screen with its start message. */
  function render() {
    stop();
    const el = $('#screen-speed');
    el.innerHTML = `
      <div class="row g-3">
        <div class="col-lg-9">
          <div class="card zc-arena">
            <div class="zc-floor"></div>
            <div class="zc-arena-msg"><div>
              <h2 class="h4">${t('speedTitle')}</h2>
              <p class="text-body-secondary">${t('speedDesc')}</p>
              <p class="small text-body-secondary">${t('speedKeys', { n: pool().length })}</p>
              <button type="button" class="btn btn-primary" data-act="play"><i class="bi bi-play-fill"></i> ${t('speedStart')}</button>
            </div></div>
          </div>
        </div>
        <div class="col-lg-3 order-first order-lg-last">
          <div class="row row-cols-5 row-cols-lg-1 g-2">
            ${stat('score', t('speedScore'), 0)}${stat('level', t('speedLevel'), 1)}${stat('combo', t('speedCombo'), 0)}${stat('best', t('speedBest'), ZC.S.speedBest)}
            <div class="col"><div class="card zc-stat py-2 h-100 justify-content-center"><div class="zc-lives" data-a="lives">${lifeDots(3)}</div></div></div>
          </div>
        </div>
      </div>
      <div class="card zc-kb-card mt-3"></div>`;
    $('[data-act=play]', el).onclick = play;
    const keys = ZC.Keyboard.render($('.zc-kb-card', el), (zy, code) => { if (g && g.running) hit(zy, code); });
    ZC.Keyboard.dimExcept(keys, new Set(pool()));
    g = { keys, running: false };
  }

  /** Starts a new game. */
  function play() {
    const arena = $('.zc-arena');
    $$('.zc-arena-msg, .zc-drop', arena).forEach(x => x.remove());
    g = { ...g, arena, pool: pool(), drops: [], score: 0, combo: 0, lives: 3, hits: 0, level: 0, spawnIn: 300, last: performance.now(), running: true, paused: false };
    ZC.blur();
    hud();
    raf = requestAnimationFrame(loop);
  }

  /** Updates the counters and lives. */
  function hud() {
    $('[data-a=score]').textContent = g.score;
    $('[data-a=combo]').textContent = g.combo;
    $('[data-a=level]').textContent = (g.level || 0) + 1;
    $('[data-a=best]').textContent = Math.max(ZC.S.speedBest, g.score || 0);
    $('[data-a=lives]').innerHTML = lifeDots(g.lives);
  }

  /** Drops a new random key from the top. */
  function spawn() {
    const W = g.arena.clientWidth;
    const ch = g.pool[Math.floor(Math.random() * g.pool.length)];
    const el = document.createElement('div');
    el.className = 'zc-drop zc-zh';
    el.textContent = ch;
    el.style.left = (40 + Math.random() * (W - 80)) + 'px';
    g.arena.appendChild(el);
    g.drops.push({ el, ch, y: -60, vy: fallSpeed(g.level) });
  }

  /** Goes up one level and announces it. */
  function levelUp() {
    g.level++;
    Sfx.star(g.level);
    const f = document.createElement('div');
    f.className = 'zc-level-up';
    f.textContent = t('levelUp', { n: g.level + 1 });
    g.arena.appendChild(f);
    setTimeout(() => f.remove(), 1200);
  }

  /** Animation frame: spawns, moves the keys and takes a life for each key reaching the bottom. */
  function loop(now) {
    if (!g || !g.running) return;
    const dt = Math.min((now - g.last) / 1000, 0.1);
    g.last = now;
    if (!g.paused) {
      g.spawnIn -= dt * 1000;
      if (g.spawnIn <= 0) {
        spawn();
        if (g.level >= 3 && Math.random() < 0.25 + g.level * 0.03) spawn();
        g.spawnIn = spawnDelay(g.level);
      }
      const floorY = g.arena.clientHeight - 56 - 50;
      let lowest = null;
      g.drops = g.drops.filter(d => {
        d.y += d.vy * dt;
        d.el.style.transform = `translateY(${d.y}px)`;
        if (d.y > floorY) {
          d.el.remove();
          if (g.lives > 0) { g.lives--; Sfx.lose(); }
          g.combo = 0;
          return false;
        }
        if (!lowest || d.y > lowest.y) lowest = d;
        return true;
      });
      g.drops.forEach(d => d.el.classList.toggle('target', d === lowest));
      hud();
      // Several keys can reach the bottom in the same frame: the game ends once, after all of them.
      if (g.lives <= 0) { gameOver(); return; }
    }
    if (g.running) raf = requestAnimationFrame(loop);
  }

  /** Handles one typed zhuyin: removes the lowest matching key, or breaks the combo. */
  function hit(zy, code) {
    ZC.Keyboard.flash(g.keys, code || Layout.zyToCode[zy]);
    if (g.paused) { resume(); return; }
    const cands = g.drops.filter(d => d.ch === zy && !d.dead);
    if (!cands.length) {
      g.combo = 0; Sfx.error(); ZC.Keyboard.flash(g.keys, code || Layout.zyToCode[zy], 'wrong', 220); hud();
      return;
    }
    const d = cands.reduce((a, b) => (b.y > a.y ? b : a));
    d.dead = true;
    g.drops = g.drops.filter(x => x !== d);
    d.el.style.setProperty('--t', `translateY(${d.y}px)`);
    d.el.classList.add('popped');
    setTimeout(() => d.el.remove(), 260);
    g.combo++; g.hits++;
    if (g.hits % KEYS_PER_LEVEL === 0) levelUp();
    const gain = 10 * (g.level + 1) * (1 + Math.floor(g.combo / 5));
    g.score += gain;
    const f = document.createElement('div');
    f.className = 'zc-float'; f.textContent = '+' + gain;
    f.style.left = d.el.style.left; f.style.top = (d.y - 10) + 'px';
    g.arena.appendChild(f); setTimeout(() => f.remove(), 700);
    Sfx.pop();
    hud();
  }

  /** Shows a message over the arena and returns it. */
  function message(html) {
    const msg = document.createElement('div');
    msg.className = 'zc-arena-msg';
    msg.innerHTML = `<div>${html}</div>`;
    g.arena.appendChild(msg);
    return msg;
  }

  /** Saves the score as the new best when it beats it; returns true for a new record. */
  function saveRecord() {
    if (g.score <= ZC.S.speedBest) return false;
    ZC.S.speedBest = g.score;
    Store.save();
    return true;
  }

  /** Ends the game, saves a new record and offers to play again. */
  function gameOver() {
    g.running = false;
    cancelAnimationFrame(raf);
    const best = saveRecord();
    Sfx.ding();
    const msg = message(`${best ? `<span class="badge text-bg-primary mb-2">${t('newRecord')}</span>` : ''}
      <h2 class="h4">${t('speedOver')}</h2><p>${t('speedOverSub', { score: g.score })}</p>
      <button type="button" class="btn btn-primary" data-act="play"><i class="bi bi-arrow-counterclockwise"></i> ${t('retry')}</button>`);
    $('[data-act=play]', msg).onclick = play;
    hud();
  }

  /** Pauses a running game (Escape, or the window losing focus). */
  function pause() {
    if (!g || !g.running || g.paused) return;
    g.paused = true;
    message(`<h2 class="h4 m-0"><i class="bi bi-pause-fill"></i> ${t('speedPaused')}</h2>`);
  }

  /** Resumes a paused game. */
  function resume() {
    g.paused = false;
    $$('.zc-arena-msg', g.arena).forEach(x => x.remove());
  }

  /** Stops a game in progress when leaving the screen, keeping its score if it is a record. */
  function stop() {
    if (g && g.running) saveRecord();
    if (g) g.running = false;
    cancelAnimationFrame(raf);
  }

  /** Handles a physical key press on this screen. */
  function onKey(e) {
    if (!g || !g.running) {
      const playBtn = $('#screen-speed [data-act=play]');
      if (e.key === 'Enter' && playBtn) { e.preventDefault(); playBtn.click(); }
      return;
    }
    // Paused: any key resumes, as the message says.
    if (g.paused) { e.preventDefault(); if (!e.repeat) resume(); return; }
    if (e.key === 'Escape') { pause(); return; }
    const zy = Layout.fromEvent(e);
    if (zy === null) return;
    e.preventDefault();
    if (e.repeat || zy === ' ') return;
    hit(zy, e.code in Layout.codeToZy ? e.code : null);
  }

  ZC.Speed = { render, stop, onKey, pause };
})();
