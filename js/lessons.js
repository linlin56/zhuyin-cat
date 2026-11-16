// Lesson content. Item format: "漢字:ㄓㄨˋ ㄧㄣ"
// - a syllable without tone mark = 1st tone → Space is typed at the end (as in the IME)
// - neutral tone: ˙ typed at the end (IME typing order)
const Lessons = (function () {
  const TONES = Layout.TONES;

  const SYLL_1 = ['貓:ㄇㄠ','書:ㄕㄨ','哭:ㄎㄨ','商:ㄕㄤ','雙:ㄕㄨㄤ','燒:ㄕㄠ','科:ㄎㄜ','烏:ㄨ','汪:ㄨㄤ','倉:ㄘㄤ','康:ㄎㄤ','粗:ㄘㄨ'];
  const SYLL_2 = ['踢:ㄊㄧ','七:ㄑㄧ','吃:ㄔ','雞:ㄐㄧ','哥:ㄍㄜ','金:ㄐㄧㄣ','音:ㄧㄣ','姑:ㄍㄨ','出:ㄔㄨ','租:ㄗㄨ','光:ㄍㄨㄤ','窗:ㄔㄨㄤ','將:ㄐㄧㄤ','喵:ㄇㄧㄠ','交:ㄐㄧㄠ','春:ㄔㄨㄣ','跟:ㄍㄣ','拼:ㄆㄧㄣ','鍋:ㄍㄨㄛ','拖:ㄊㄨㄛ','威:ㄨㄟ','推:ㄊㄨㄟ','吹:ㄔㄨㄟ','資:ㄗ'];
  const SYLL_3 = ['風:ㄈㄥ','心:ㄒㄧㄣ','星:ㄒㄧㄥ','香:ㄒㄧㄤ','收:ㄕㄡ','秋:ㄑㄧㄡ','修:ㄒㄧㄡ','生:ㄕㄥ','公:ㄍㄨㄥ','空:ㄎㄨㄥ','松:ㄙㄨㄥ','蔥:ㄘㄨㄥ','喝:ㄏㄜ','灰:ㄏㄨㄟ','靴:ㄒㄩㄝ','缺:ㄑㄩㄝ','約:ㄩㄝ','溜:ㄌㄧㄡ','方:ㄈㄤ','分:ㄈㄣ','飛:ㄈㄟ','抽:ㄔㄡ','絲:ㄙ','胸:ㄒㄩㄥ','黑:ㄏㄟ'];
  const SYLL_4 = ['爸:ㄅㄚˋ','媽:ㄇㄚ','大:ㄉㄚˋ','字:ㄗˋ','茶:ㄔㄚˊ','水:ㄕㄨㄟˇ','好:ㄏㄠˇ','我:ㄨㄛˇ','你:ㄋㄧˇ','他:ㄊㄚ','是:ㄕˋ','不:ㄅㄨˋ','人:ㄖㄣˊ','月:ㄩㄝˋ','二:ㄦˋ','八:ㄅㄚ','山:ㄕㄢ','愛:ㄞˋ','來:ㄌㄞˊ','早:ㄗㄠˇ','嗎:ㄇㄚ˙','呢:ㄋㄜ˙','的:ㄉㄜ˙','很:ㄏㄣˇ','熱:ㄖㄜˋ','冷:ㄌㄥˇ','魚:ㄩˊ','雨:ㄩˇ','鳥:ㄋㄧㄠˇ','狗:ㄍㄡˇ','看:ㄎㄢˋ','走:ㄗㄡˇ','飯:ㄈㄢˋ','錢:ㄑㄧㄢˊ','點:ㄉㄧㄢˇ','雪:ㄒㄩㄝˇ','白:ㄅㄞˊ','紅:ㄏㄨㄥˊ','綠:ㄌㄩˋ','藍:ㄌㄢˊ'];

  const WORDS_TW = ['台灣:ㄊㄞˊ ㄨㄢ','台北:ㄊㄞˊ ㄅㄟˇ','夜市:ㄧㄝˋ ㄕˋ','捷運:ㄐㄧㄝˊ ㄩㄣˋ','高鐵:ㄍㄠ ㄊㄧㄝˇ','颱風:ㄊㄞˊ ㄈㄥ','便當:ㄅㄧㄢˋ ㄉㄤ','機車:ㄐㄧ ㄔㄜ','寺廟:ㄙˋ ㄇㄧㄠˋ','老街:ㄌㄠˇ ㄐㄧㄝ'];
  const WORDS_FOOD = ['珍珠奶茶:ㄓㄣ ㄓㄨ ㄋㄞˇ ㄔㄚˊ','小籠包:ㄒㄧㄠˇ ㄌㄨㄥˊ ㄅㄠ','芒果:ㄇㄤˊ ㄍㄨㄛˇ','鳳梨:ㄈㄥˋ ㄌㄧˊ','咖啡:ㄎㄚ ㄈㄟ','好吃:ㄏㄠˇ ㄔ','飲料:ㄧㄣˇ ㄌㄧㄠˋ','牛肉麵:ㄋㄧㄡˊ ㄖㄡˋ ㄇㄧㄢˋ','雞排:ㄐㄧ ㄆㄞˊ','刨冰:ㄆㄠˊ ㄅㄧㄥ'];
  const WORDS_DAY = ['你好:ㄋㄧˇ ㄏㄠˇ','早安:ㄗㄠˇ ㄢ','晚安:ㄨㄢˇ ㄢ','老師:ㄌㄠˇ ㄕ','學生:ㄒㄩㄝˊ ㄕㄥ','中文:ㄓㄨㄥ ㄨㄣˊ','注音:ㄓㄨˋ ㄧㄣ','電腦:ㄉㄧㄢˋ ㄋㄠˇ','鍵盤:ㄐㄧㄢˋ ㄆㄢˊ','可愛:ㄎㄜˇ ㄞˋ','開心:ㄎㄞ ㄒㄧㄣ','加油:ㄐㄧㄚ ㄧㄡˊ','手機:ㄕㄡˇ ㄐㄧ','天氣:ㄊㄧㄢ ㄑㄧˋ','喜歡:ㄒㄧˇ ㄏㄨㄢ','朋友:ㄆㄥˊ ㄧㄡˇ'];

  const SENT_1 = ['我愛台灣:ㄨㄛˇ ㄞˋ ㄊㄞˊ ㄨㄢ','今天天氣很好:ㄐㄧㄣ ㄊㄧㄢ ㄊㄧㄢ ㄑㄧˋ ㄏㄣˇ ㄏㄠˇ','我想吃小籠包:ㄨㄛˇ ㄒㄧㄤˇ ㄔ ㄒㄧㄠˇ ㄌㄨㄥˊ ㄅㄠ','貓在睡覺:ㄇㄠ ㄗㄞˋ ㄕㄨㄟˋ ㄐㄧㄠˋ','我在學注音:ㄨㄛˇ ㄗㄞˋ ㄒㄩㄝˊ ㄓㄨˋ ㄧㄣ','台北很熱:ㄊㄞˊ ㄅㄟˇ ㄏㄣˇ ㄖㄜˋ'];
  const SENT_2 = ['坐捷運去夜市:ㄗㄨㄛˋ ㄐㄧㄝˊ ㄩㄣˋ ㄑㄩˋ ㄧㄝˋ ㄕˋ','你喝咖啡嗎:ㄋㄧˇ ㄏㄜ ㄎㄚ ㄈㄟ ㄇㄚ˙','我喜歡珍珠奶茶:ㄨㄛˇ ㄒㄧˇ ㄏㄨㄢ ㄓㄣ ㄓㄨ ㄋㄞˇ ㄔㄚˊ','明天見:ㄇㄧㄥˊ ㄊㄧㄢ ㄐㄧㄢˋ','下雨了:ㄒㄧㄚˋ ㄩˇ ㄌㄜ˙'];

  // Learning order: start from the index fingers (F/J), like TypingClub.
  const UNITS = [
    { id: 1, icon: '一', lessons: [
      { id: '1-1', type: 'intro', keys: ['ㄑ','ㄨ'] },
      { id: '1-2', type: 'intro', keys: ['ㄎ','ㄜ'] },
      { id: '1-3', type: 'intro', keys: ['ㄋ','ㄠ'] },
      { id: '1-4', type: 'intro', keys: ['ㄇ','ㄤ'] },
      { id: '1-5', type: 'intro', keys: ['ㄕ','ㄘ'] },
      { id: '1-6', type: 'drill' },
      { id: '1-7', type: 'syll', items: SYLL_1, count: 12 },
    ]},
    { id: 2, icon: '二', lessons: [
      { id: '2-1', type: 'intro', keys: ['ㄐ','ㄧ'] },
      { id: '2-2', type: 'intro', keys: ['ㄍ','ㄛ'] },
      { id: '2-3', type: 'intro', keys: ['ㄊ','ㄟ'] },
      { id: '2-4', type: 'intro', keys: ['ㄆ','ㄣ'] },
      { id: '2-5', type: 'intro', keys: ['ㄔ','ㄗ'] },
      { id: '2-6', type: 'drill' },
      { id: '2-7', type: 'syll', items: SYLL_2, count: 14 },
    ]},
    { id: 3, icon: '三', lessons: [
      { id: '3-1', type: 'intro', keys: ['ㄒ','ㄩ'] },
      { id: '3-2', type: 'intro', keys: ['ㄏ','ㄝ'] },
      { id: '3-3', type: 'intro', keys: ['ㄌ','ㄡ'] },
      { id: '3-4', type: 'intro', keys: ['ㄈ','ㄥ'] },
      { id: '3-5', type: 'intro', keys: ['ㄖ','ㄙ'] },
      { id: '3-6', type: 'drill' },
      { id: '3-7', type: 'syll', items: SYLL_3, count: 14 },
    ]},
    { id: 4, icon: '四', lessons: [
      { id: '4-1', type: 'intro', keys: ['ㄅ','ㄉ'] },
      { id: '4-2', type: 'intro', keys: ['ㄓ','ㄚ'] },
      { id: '4-3', type: 'intro', keys: ['ㄞ','ㄢ','ㄦ'] },
      { id: '4-4', type: 'intro', keys: ['ˇ','ˋ'] },
      { id: '4-5', type: 'intro', keys: ['ˊ','˙'] },
      { id: '4-6', type: 'drill' },
      { id: '4-7', type: 'syll', items: SYLL_4, count: 16 },
    ]},
    { id: 5, icon: '五', lessons: [
      { id: '5-1', type: 'words', items: WORDS_DAY, count: 10 },
      { id: '5-2', type: 'words', items: WORDS_TW, count: 10 },
      { id: '5-3', type: 'words', items: WORDS_FOOD, count: 10 },
    ]},
    { id: 6, icon: '六', lessons: [
      { id: '6-1', type: 'sentences', items: SENT_1, count: 6 },
      { id: '6-2', type: 'sentences', items: SENT_2, count: 5 },
    ]},
  ];

  // Star thresholds: [keys/min for ★★, keys/min for ★★★]
  const GOALS = { intro: [25, 45], drill: [35, 60], syll: [30, 55], words: [35, 65], sentences: [40, 70] };
  const ACC = { one: 85, two: 92, three: 97 };

  const ORDER = [];
  const BY_ID = {};
  (function () {
    const learned = [];
    UNITS.forEach(u => u.lessons.forEach(l => {
      if (l.type === 'intro') learned.push(...l.keys);
      l.unit = u.id;
      l.pool = learned.slice();
      l.unitKeys = u.lessons.filter(x => x.type === 'intro').flatMap(x => x.keys);
      l.index = ORDER.length;
      ORDER.push(l);
      BY_ID[l.id] = l;
    }));
  })();

  /** Splits an item ("漢字:ㄏㄢˋ ㄗˋ") into syllables with their hanzi and keys. */
  function parseItem(str) {
    const [hz, zy] = str.split(':');
    const chars = [...hz];
    const syls = zy.trim().split(/\s+/);
    if (chars.length !== syls.length) console.warn('Malformed item:', str);
    return syls.map((sy, i) => {
      const keys = [...sy];
      if (!TONES.includes(keys[keys.length - 1])) keys.push(' ');
      return { hanzi: chars[i] || '', keys };
    });
  }

  /** Returns a random element of an array. */
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  /** Returns a shuffled copy of an array. */
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /** Returns len random keys from a pool, avoiding the same key twice in a row. */
  function randomGroup(pool, len, avoidRepeat = true) {
    const g = [];
    while (g.length < len) {
      const k = pick(pool);
      if (avoidRepeat && g.length && g[g.length - 1] === k && pool.length > 1) continue;
      g.push(k);
    }
    return g;
  }

  /** Returns the key groups of a lesson introducing new keys. */
  function introGroups(newKeys, oldPool) {
    const groups = [];
    newKeys.forEach(k => { groups.push([k, k, k]); groups.push([k, k, k]); });
    for (let i = 0; i < 6; i++) groups.push(randomGroup(newKeys, 2 + (i % 3)));
    if (oldPool.length) {
      for (let i = 0; i < 8; i++) {
        const len = 2 + Math.floor(Math.random() * 3);
        const g = randomGroup(oldPool, len);
        g[Math.floor(Math.random() * len)] = pick(newKeys);
        if (Math.random() < 0.5) g[Math.floor(Math.random() * len)] = pick(newKeys);
        groups.push(g);
      }
    } else {
      for (let i = 0; i < 4; i++) groups.push(randomGroup(newKeys, 3 + (i % 2)));
    }
    return groups;
  }

  /** Returns the key groups of a review, weighting the keys of the current unit. */
  function drillGroups(pool, unitKeys) {
    const weighted = pool.concat(unitKeys, unitKeys);
    const groups = [];
    for (let i = 0; i < 16; i++) groups.push(randomGroup(weighted, 2 + Math.floor(Math.random() * 3)));
    return groups;
  }

  /** Builds a playable run of a lesson: its flat key sequence and display blocks. */
  function build(id) {
    const def = BY_ID[id];
    const blocks = [];
    const seq = [];
    function push(keys, hanzi, wordEnd) {
      blocks.push({ hanzi, start: seq.length, len: keys.length, wordEnd });
      seq.push(...keys);
    }

    if (def.type === 'intro' || def.type === 'drill') {
      const old = def.pool.filter(k => !(def.keys || []).includes(k));
      const groups = def.type === 'intro' ? introGroups(def.keys, old) : drillGroups(def.pool, def.unitKeys);
      groups.forEach((g, i) => push(i < groups.length - 1 ? g.concat(' ') : g, null, true));
    } else {
      const items = def.type === 'sentences' ? def.items.slice(0, def.count) : shuffle(def.items).slice(0, def.count);
      items.map(parseItem).forEach(word => word.forEach((syl, i) => push(syl.keys, syl.hanzi, i === word.length - 1)));
    }
    return { def, seq, blocks };
  }

  return { UNITS, ORDER, BY_ID, GOALS, ACC, build, parseItem };
})();
if (typeof module !== 'undefined') module.exports = Lessons;
