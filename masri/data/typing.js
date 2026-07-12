// Type → Test keyboard reference data.
//
// LAYOUT: Windows Arabic (101), UNSHIFTED (base) layer only.
// Each key gives the physical QWERTY position (KeyboardEvent.code + a short label)
// and the Arabic character that key produces when the Windows Arabic (101) layout
// is active. Shift-layer mappings are intentionally omitted — they are not included
// here rather than guessed. Digit-row keys are marked `digit:true` (they produce the
// same digit under the Arabic layout and are shown for realism, not as Arabic targets).
//
// This is a keyboard REFERENCE only. The webpage cannot change the OS keyboard; the
// learner switches layouts with Windows key + Spacebar (Arabic must be installed as a
// Windows keyboard language first).
window.MASRI = window.MASRI || {};
window.MASRI.typing = {
  // Word Typing pool exclusions. The pool is derived at runtime from Masri's vetted
  // datasets; these few entries are prepositional/clitic forms whose base noun is
  // already in the pool, so they make redundant, less-clear standalone typing
  // prompts. (Compared after stripping tatweel + diacritics, same as the pool.)
  //   بسكر  "with sugar"  — base word سكر (sugar) is already in the pool
  //   بالليل "at night"    — base word الليل (night) is already in the pool
  excludeWords: ["بسكر", "بالليل"],

  // Letter Typing difficulty pools (Arabic letters). "all" is the full 28 from the
  // alphabet dataset; these are curated subsets used by the difficulty selector:
  //   beginner — common, visually distinct starter letters
  //   similar  — the confusable groups (ب ت ث / ج ح خ / د ذ / ر ز / س ش / ص ض / ط ظ / ع غ)
  //   emphatic — the hardest articulations (emphatic + throat/back sounds)
  letterSets: {
    beginner: ["ا","ب","ت","د","ر","س","ف","ك","ل","م","ن","ه","و","ي"],
    similar:  ["ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ"],
    emphatic: ["ص","ض","ط","ظ","ح","خ","ع","غ","ق"]
  },

  // Curated high-value beginner words for the Word Typing "Common" difficulty.
  // Every entry already exists in Masri's vetted data (matched after normalization);
  // the runtime pool flags matching words as common. Words not found are ignored.
  commonWords: [
    "راح","جه","أكل","شرب","عايز","عرف","فهم","عمل","حب","مية","شاي","قهوة","عيش","لبن",
    "بيت","باب","فلوس","كتير","شوية","كبير","صغير","كويس","آسف","شكرا","أيوة","لأ","ماشي",
    "طيب","هنا","فين","إمتى","إزاي","كام","يمين","شمال","دلوقتي","بكرة","النهارده","واحد",
    "اتنين","تلاتة","بنت","ولد","راجل","ست","ماما","بابا","دكتور","مستشفى","مدرسة","عربية"
  ],

  // ── Defense (Type → Test → Defense) ───────────────────────────────────────
  // CONFIGURATION ONLY — all game logic lives in index.html. The target pools are
  // NOT duplicated here: letters come from M.alphabet.letters and words from the
  // same vetted datasets the Word Typing pool already uses. This block only tunes
  // the game and names the words we refuse to use as targets.
  defense: {
    // Restrained, widely-rendering emoji. Reuse across enemies is fine — the Arabic
    // target is the content; the creature is decoration.
    emoji: ["👾","🧟","🐍","🦂","👻","🤖","🐙","🦇"],

    round: 15,          // enemies spawned per round
    lives: 3,           // wall hits allowed before the round ends
    lanes: 4,           // vertical tracks, so labels don't overlap illegibly

    // Speeds. `cross` = seconds an enemy takes to cross the field (elapsed-time based,
    // never frame-count based). `gap` = seconds between spawns. `mult` = score multiplier.
    speeds: {
      slow:   { label:"Slow",   cross:26, gap:3.4, mult:1    },
      normal: { label:"Normal", cross:18, gap:2.4, mult:1.25 },
      fast:   { label:"Fast",   cross:12, gap:1.6, mult:1.5  }
    },

    // Scoring: round(( base + streakBonus × streak-before-this-hit ) × speed multiplier)
    score: { base:100, streakBonus:10 },

    // Word-target guards. Words are drawn from the existing vetted pool, then filtered:
    // 2–6 Arabic letters, no spaces/punctuation, must have transliteration + English.
    // These are additionally refused because their exact wording is unresolved or
    // gender-sensitive (see NATIVE_REVIEW.md) — a game is the wrong place to drill them.
    wordExclude: ["تايه", "تهت", "مدرسة", "إزازة", "ازازة", "قزازة"],
    wordMinLen: 2,
    wordMaxLen: 6
  },

  layoutName: "Windows Arabic (101)",
  layoutNote: "Unshifted layer of the standard Windows Arabic (101) layout. The key positions match a physical US-QWERTY keyboard; the large glyph is what each key types when the Arabic layout is active.",
  rows: [
    [
      { code:'Backquote', q:'`', ar:'ذ' },
      { code:'Digit1', q:'1', ar:'1', digit:true }, { code:'Digit2', q:'2', ar:'2', digit:true },
      { code:'Digit3', q:'3', ar:'3', digit:true }, { code:'Digit4', q:'4', ar:'4', digit:true },
      { code:'Digit5', q:'5', ar:'5', digit:true }, { code:'Digit6', q:'6', ar:'6', digit:true },
      { code:'Digit7', q:'7', ar:'7', digit:true }, { code:'Digit8', q:'8', ar:'8', digit:true },
      { code:'Digit9', q:'9', ar:'9', digit:true }, { code:'Digit0', q:'0', ar:'0', digit:true },
      { code:'Minus', q:'-', ar:'-', digit:true }, { code:'Equal', q:'=', ar:'=', digit:true }
    ],
    [
      { code:'KeyQ', q:'Q', ar:'ض' }, { code:'KeyW', q:'W', ar:'ص' }, { code:'KeyE', q:'E', ar:'ث' },
      { code:'KeyR', q:'R', ar:'ق' }, { code:'KeyT', q:'T', ar:'ف' }, { code:'KeyY', q:'Y', ar:'غ' },
      { code:'KeyU', q:'U', ar:'ع' }, { code:'KeyI', q:'I', ar:'ه' }, { code:'KeyO', q:'O', ar:'خ' },
      { code:'KeyP', q:'P', ar:'ح' }, { code:'BracketLeft', q:'[', ar:'ج' }, { code:'BracketRight', q:']', ar:'د' }
    ],
    [
      { code:'KeyA', q:'A', ar:'ش' }, { code:'KeyS', q:'S', ar:'س' }, { code:'KeyD', q:'D', ar:'ي' },
      { code:'KeyF', q:'F', ar:'ب' }, { code:'KeyG', q:'G', ar:'ل' }, { code:'KeyH', q:'H', ar:'ا' },
      { code:'KeyJ', q:'J', ar:'ت' }, { code:'KeyK', q:'K', ar:'ن' }, { code:'KeyL', q:'L', ar:'م' },
      { code:'Semicolon', q:';', ar:'ك' }, { code:'Quote', q:"'", ar:'ط' }
    ],
    [
      { code:'KeyZ', q:'Z', ar:'ئ' }, { code:'KeyX', q:'X', ar:'ء' }, { code:'KeyC', q:'C', ar:'ؤ' },
      { code:'KeyV', q:'V', ar:'ر' }, { code:'KeyB', q:'B', ar:'لا' }, { code:'KeyN', q:'N', ar:'ى' },
      { code:'KeyM', q:'M', ar:'ة' }, { code:'Comma', q:',', ar:'و' }, { code:'Period', q:'.', ar:'ز' },
      { code:'Slash', q:'/', ar:'ظ' }
    ]
  ]
};
