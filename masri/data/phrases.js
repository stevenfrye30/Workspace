// A categorized Egyptian phrasebook — broad, reusable everyday conversation.
// Topic-specific phrases live in their own tabs now (Getting Around,
// Food & Ordering, Money & Shopping, Health & Emergencies, People & Small Talk).
window.MASRI = window.MASRI || {};
window.MASRI.phrases = [
  {
    category: "Greetings",
    items: [
      { ar: "السلام عليكم", tr: "es-salāmu ʿalēku", en: "peace be upon you (universal hello)" },
      { ar: "وعليكم السلام", tr: "we-ʿalēku s-salām", en: "and upon you peace (the reply)" },
      { ar: "أهلاً", tr: "ahlan", en: "hi / welcome" },
      { ar: "أهلاً وسهلاً", tr: "ahlan wa sahlan", en: "welcome (warmer)" },
      { ar: "صباح الخير", tr: "ṣabāḥ el-khēr", en: "good morning" },
      { ar: "صباح النور", tr: "ṣabāḥ en-nūr", en: "good morning (reply)" },
      { ar: "مساء الخير", tr: "masā el-khēr", en: "good evening" },
      { ar: "مساء النور", tr: "masā en-nūr", en: "good evening (reply)" },
      { ar: "إزيك", tr: "ezzayyak (m) / ezzayyik (f)", en: "how are you?" },
      { ar: "عامل إيه", tr: "ʿāmel ēh", en: "how's it going? (to m)" },
      { ar: "الحمد لله", tr: "el-ḥamdu lellāh", en: "fine, thank God (standard reply)" },
      { ar: "تصبح على خير", tr: "teṣbaḥ ʿala khēr", en: "goodnight" },
      { ar: "مع السلامة", tr: "maʿa s-salāma", en: "goodbye" },
      { ar: "أشوفك بعدين", tr: "ashūfak baʿdēn", en: "see you later (to m)" }
    ]
  },
  {
    category: "Courtesy",
    items: [
      { ar: "شكراً", tr: "shukran", en: "thank you" },
      { ar: "شكراً جزيلاً", tr: "shukran gazīlan", en: "thank you very much" },
      { ar: "العفو", tr: "el-ʿafw", en: "you're welcome" },
      { ar: "من فضلك", tr: "men faḍlak (m) / faḍlik (f)", en: "please" },
      { ar: "لو سمحت", tr: "law samaḥt", en: "excuse me / if you please" },
      { ar: "آسف", tr: "āsef (m) / asfa (f)", en: "sorry" },
      { ar: "معلش", tr: "maʿlesh", en: "never mind / it's okay / no worries" },
      { ar: "إتفضل", tr: "etfaḍḍal", en: "go ahead / here you are / please (offering)" },
      { ar: "بعد إذنك", tr: "baʿd eznak", en: "excuse me (leaving / passing)" }
    ]
  },
  {
    category: "Everyday glue",
    items: [
      { ar: "أيوة", tr: "aywa", en: "yes" },
      { ar: "لأ", tr: "laʾ", en: "no" },
      { ar: "خلاص", tr: "khalāṣ", en: "done / enough / okay then" },
      { ar: "طيب", tr: "ṭayyeb", en: "okay / alright / fine" },
      { ar: "يلا بينا", tr: "yalla bīna", en: "let's go" },
      { ar: "إستنى", tr: "estanna", en: "wait" },
      { ar: "إن شاء الله", tr: "en shā allah", en: "God willing / hopefully" },
      { ar: "مفيش مشكلة", tr: "mafīsh moshkela", en: "no problem" },
      { ar: "حبيبي", tr: "ḥabībi", en: "my dear (m) — used constantly, friendly" },
      { ar: "يا رب", tr: "ya rabb", en: "oh Lord (hope / plea)" }
    ]
  },
  {
    category: "Learning the language",
    items: [
      { ar: "أنا بتعلم عربي", tr: "ana batʿallem ʿarabi", en: "I'm learning Arabic" },
      { ar: "لسه بتعلم", tr: "lessa batʿallem", en: "I'm still learning" },
      { ar: "عربيتي بسيطة", tr: "ʿarabeyyeti basīṭa", en: "my Arabic is basic" },
      { ar: "بتتكلم إنجليزي؟", tr: "betetkallem engelīzi?", en: "do you speak English?" },
      { ar: "ممكن تتكلم بالراحة؟", tr: "momken tetkallem (m) / tetkallemi (f) bel-rāḥa?", en: "can you speak slowly?" },
      { ar: "ممكن تعيد تاني؟", tr: "momken teʿīd (m) / teʿīdi (f) tāni?", en: "can you say that again?" },
      { ar: "يعني إيه ده؟", tr: "yaʿni ēh da?", en: "what does this mean?" },
      { ar: "إزاي أقول ...؟", tr: "ezzāy aʾūl ...?", en: "how do I say ...?" },
      { ar: "اكتبها لي لو سمحت", tr: "ektebha-li (m) / ektebīha-li (f) law samaḥt / samaḥti", en: "please write it down for me" },
      { ar: "مش فاهم، آسف", tr: "mesh fāhem (m) / fahma (f), āsef / asfa", en: "I don't understand, sorry (m/f)" }
    ]
  },
  {
    category: "Family & social",
    items: [
      { ar: "ده صاحبي", tr: "da ṣāḥbi", en: "this is my friend (m)" },
      { ar: "دي أختي", tr: "di okhti", en: "this is my sister" },
      { ar: "عندك أولاد؟", tr: "ʿandak awlād?", en: "do you have kids? (to m)" },
      { ar: "أنا متجوز", tr: "ana metgawwez", en: "I'm married (m)" },
      { ar: "أنا لسه مش متجوز", tr: "ana lessa mesh metgawwez", en: "I'm not married yet (m)" },
      { ar: "إزاي العيلة؟", tr: "ezzāy el-ʿēla?", en: "how's the family?" },
      { ar: "سلّم لي على الكل", tr: "sallem-li ʿala l-koll", en: "say hi to everyone for me" }
    ]
  }
];
