// Standard zhuyin layout (大千), indexed by physical key position (KeyboardEvent.code).
// The physical position does not depend on the OS layout: QWERTY, AZERTY, zhuyin IME… all work.
// (at least from what I tested, on Mac and iPhone, using chrome and safari.)
const Layout = (function () {
  const ROWS = [
    [['Digit1','ㄅ'],['Digit2','ㄉ'],['Digit3','ˇ'],['Digit4','ˋ'],['Digit5','ㄓ'],['Digit6','ˊ'],['Digit7','˙'],['Digit8','ㄚ'],['Digit9','ㄞ'],['Digit0','ㄢ'],['Minus','ㄦ']],
    [['KeyQ','ㄆ'],['KeyW','ㄊ'],['KeyE','ㄍ'],['KeyR','ㄐ'],['KeyT','ㄔ'],['KeyY','ㄗ'],['KeyU','ㄧ'],['KeyI','ㄛ'],['KeyO','ㄟ'],['KeyP','ㄣ']],
    [['KeyA','ㄇ'],['KeyS','ㄋ'],['KeyD','ㄎ'],['KeyF','ㄑ'],['KeyG','ㄕ'],['KeyH','ㄘ'],['KeyJ','ㄨ'],['KeyK','ㄜ'],['KeyL','ㄠ'],['Semicolon','ㄤ']],
    [['KeyZ','ㄈ'],['KeyX','ㄌ'],['KeyC','ㄏ'],['KeyV','ㄒ'],['KeyB','ㄖ'],['KeyN','ㄙ'],['KeyM','ㄩ'],['Comma','ㄝ'],['Period','ㄡ'],['Slash','ㄥ']],
  ];

  // Default QWERTY labels (replaced by the real layout when the browser exposes it).
  const QWERTY = {
    Digit1:'1',Digit2:'2',Digit3:'3',Digit4:'4',Digit5:'5',Digit6:'6',Digit7:'7',Digit8:'8',Digit9:'9',Digit0:'0',Minus:'-',
    KeyQ:'Q',KeyW:'W',KeyE:'E',KeyR:'R',KeyT:'T',KeyY:'Y',KeyU:'U',KeyI:'I',KeyO:'O',KeyP:'P',
    KeyA:'A',KeyS:'S',KeyD:'D',KeyF:'F',KeyG:'G',KeyH:'H',KeyJ:'J',KeyK:'K',KeyL:'L',Semicolon:';',
    KeyZ:'Z',KeyX:'X',KeyC:'C',KeyV:'V',KeyB:'B',KeyN:'N',KeyM:'M',Comma:',',Period:'.',Slash:'/',
    Space:'␣',
  };

  const FINGER = {
    Digit1:'lp',KeyQ:'lp',KeyA:'lp',KeyZ:'lp',
    Digit2:'lr',KeyW:'lr',KeyS:'lr',KeyX:'lr',
    Digit3:'lm',KeyE:'lm',KeyD:'lm',KeyC:'lm',
    Digit4:'li',Digit5:'li',KeyR:'li',KeyT:'li',KeyF:'li',KeyG:'li',KeyV:'li',KeyB:'li',
    Digit6:'ri',Digit7:'ri',KeyY:'ri',KeyU:'ri',KeyH:'ri',KeyJ:'ri',KeyN:'ri',KeyM:'ri',
    Digit8:'rm',KeyI:'rm',KeyK:'rm',Comma:'rm',
    Digit9:'rr',KeyO:'rr',KeyL:'rr',Period:'rr',
    Digit0:'rp',Minus:'rp',KeyP:'rp',Semicolon:'rp',Slash:'rp',
    Space:'th',
  };

  const codeToZy = {};
  const zyToCode = {};
  ROWS.flat().forEach(([code, zy]) => { codeToZy[code] = zy; zyToCode[zy] = code; });
  codeToZy.Space = ' ';
  zyToCode[' '] = 'Space';

  const TONES = ['ˊ','ˇ','ˋ','˙'];
  const ALL_ZY = ROWS.flat().map(([, zy]) => zy);

  const labels = { ...QWERTY };

  /** Reads the real layout (Chrome, Edge) to show the right letters on the keys; returns true on success. */
  async function detectLabels() {
    try {
      if (!navigator.keyboard || !navigator.keyboard.getLayoutMap) return false;
      const map = await navigator.keyboard.getLayoutMap();
      Object.keys(QWERTY).forEach(code => {
        const v = map.get(code);
        if (v && code !== 'Space') labels[code] = v.toUpperCase();
      });
      return true;
    } catch (e) { return false; }
  }

  /** Tells whether a character is a zhuyin symbol or a tone mark. */
  function isBopomofo(ch) { return ch.length === 1 && ((ch >= 'ㄅ' && ch <= 'ㄩ') || TONES.includes(ch)); }

  /** Returns the zhuyin of a keyboard event, or null for any other key. */
  function fromEvent(e) {
    if (e.key && isBopomofo(e.key)) return e.key;          // IME / layout already sending zhuyin
    if (e.code && e.code in codeToZy) return codeToZy[e.code]; // physical position
    if (e.key === ' ') return ' ';
    return null;
  }

  return { ROWS, FINGER, TONES, ALL_ZY, codeToZy, zyToCode, labels, detectLabels, fromEvent, isBopomofo };
})();
if (typeof module !== 'undefined') module.exports = Layout;
