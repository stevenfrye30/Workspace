// Phrases & Speaking — beginner practice for recognizing and saying useful
// everyday Egyptian (Cairene) Arabic. Original content written for Masri; natural
// Cairene forms (not formal MSA) throughout. This is a REFERENCE/practice dataset:
// no automated speech grading, no synthetic pronunciation.
//
// Phrase shape:
//   { id, topic, arabic, transliteration, english, promptEnglish, suggestedResponse, audio, difficulty }
//     arabic/transliteration/english — the target phrase (a thing you'd hear or say)
//     promptEnglish  — an English cue for "Respond out loud" (what to try to say)
//     suggestedResponse — a natural Cairene reply to reveal after speaking
//     audio    — bare filename under audioBase (e.g. "greet-01.ogg"); requested only
//                when audioReady is true (see below)
//     difficulty — 1 (easiest) … 3
//
// AUDIO: no trusted native Egyptian recordings exist for these phrases, so `audioReady`
// stays false. A Play button is rendered ONLY for a filename listed in `audioAvailable`
// below; every other phrase shows no audio control at all and is never requested (no dead
// buttons, no 404s, no fake pronunciation, no wrong-dialect audio passed off as Egyptian).
// Drop real, suitably licensed clips into audio/listening/ using the filenames in
// audio/listening/MANIFEST.md, add them to `audioAvailable`, and only flip `audioReady`
// to true once every clip exists. Provenance for anything shipped: audio/listening/CREDITS.md.
window.MASRI = window.MASRI || {};
window.MASRI.listening = {
  audioReady: false,
  audioBase: "audio/listening/",

  // Per-clip availability. `audioReady` stays FALSE until all 78 native clips exist.
  // Until then, only the filenames listed here are playable; every other clip stays
  // visibly unavailable and is never requested (no 404s, no fake pronunciation).
  //
  // greet-03.ogg is NOT a verified Egyptian recording. It is a public-domain Wikimedia
  // Commons clip of أهلا whose dialect is undocumented. It is used because it does not
  // materially conflict with the Egyptian learning form Masri displays (ahlan!) — not
  // because the two varieties are claimed to be identical.
  // Provenance and license: audio/listening/CREDITS.md.
  // Egyptian-specific phrases (إزيك؟, مش فاهم, …) must wait for native recordings.
  audioAvailable: ["greet-03.ogg"],

  topics: [
    { id: "greetings",   label: "Greetings" },
    { id: "introducing", label: "Introducing yourself" },
    { id: "family",      label: "Family & polite talk" },
    { id: "food",        label: "Food & ordering" },
    { id: "shopping",    label: "Shopping" },
    { id: "transport",   label: "Transportation" },
    { id: "directions",  label: "Asking directions" },
    { id: "time",        label: "Time & plans" },
    { id: "help",        label: "Asking for help" },
    { id: "clarify",     label: "Saying you don’t understand" }
  ],

  phrases: [
    // ── Greetings ──────────────────────────────────────────────
    { id:"greet-01", topic:"greetings", arabic:"إزيك؟", transliteration:"ezzayyak?", english:"How are you? (to a man)",
      promptEnglish:"Greet a male friend and ask how he’s doing.", suggestedResponse:"الحمد لله، وإنت؟", audio:"greet-01.ogg", difficulty:1 },
    { id:"greet-02", topic:"greetings", arabic:"صباح الخير", transliteration:"ṣabāḥ el-khēr", english:"Good morning",
      promptEnglish:"Say good morning to someone.", suggestedResponse:"صباح النور", audio:"greet-02.ogg", difficulty:1 },
    { id:"greet-03", topic:"greetings", arabic:"أهلاً!", transliteration:"ahlan!", english:"Hi! / Welcome!",
      promptEnglish:"Greet someone casually.", suggestedResponse:"أهلاً بيك", audio:"greet-03.ogg", difficulty:1 },

    // ── Introducing yourself ───────────────────────────────────
    { id:"intro-01", topic:"introducing", arabic:"اسمك إيه؟", transliteration:"esmak ēh?", english:"What’s your name? (to a man)",
      promptEnglish:"Ask a man his name.", suggestedResponse:"أنا اسمي كريم", audio:"intro-01.ogg", difficulty:1 },
    { id:"intro-02", topic:"introducing", arabic:"أنا اسمي نيكول", transliteration:"ana esmi Nicole", english:"My name is Nicole",
      promptEnglish:"Introduce yourself by name.", suggestedResponse:"أهلاً يا نيكول", audio:"intro-02.ogg", difficulty:1 },
    { id:"intro-03", topic:"introducing", arabic:"إنت منين؟", transliteration:"enta menēn?", english:"Where are you from? (to a man)",
      promptEnglish:"Ask a man where he’s from.", suggestedResponse:"أنا من أمريكا", audio:"intro-03.ogg", difficulty:2 },

    // ── Family & polite talk ───────────────────────────────────
    { id:"fam-01", topic:"family", arabic:"إزاي العيلة؟", transliteration:"ezzāy el-ʿēla?", english:"How’s the family?",
      promptEnglish:"Ask a friend about their family.", suggestedResponse:"كلهم بخير، الحمد لله", audio:"fam-01.ogg", difficulty:2 },
    { id:"fam-02", topic:"family", arabic:"ألف شكر", transliteration:"alf shukr", english:"Thanks a lot",
      promptEnglish:"Thank someone warmly.", suggestedResponse:"العفو", audio:"fam-02.ogg", difficulty:1 },
    { id:"fam-03", topic:"family", arabic:"اتفضل", transliteration:"etfaḍḍal", english:"Here you go / Please (offering, to a man)",
      promptEnglish:"Politely offer something to a man.", suggestedResponse:"شكراً", audio:"fam-03.ogg", difficulty:1 },

    // ── Food & ordering ────────────────────────────────────────
    { id:"food-01", topic:"food", arabic:"ممكن المنيو؟", transliteration:"momken el-menyu?", english:"Can I have the menu?",
      promptEnglish:"Ask for the menu.", suggestedResponse:"اتفضل", audio:"food-01.ogg", difficulty:1 },
    { id:"food-02", topic:"food", arabic:"أنا عايز قهوة، لو سمحت", transliteration:"ana ʿāyez ʾahwa, law samaḥt", english:"I’d like a coffee, please (m)",
      promptEnglish:"Order a coffee politely.", suggestedResponse:"حاضر", audio:"food-02.ogg", difficulty:2 },
    { id:"food-03", topic:"food", arabic:"الحساب، لو سمحت", transliteration:"el-ḥesāb, law samaḥt", english:"The bill, please",
      promptEnglish:"Ask for the bill.", suggestedResponse:"اتفضل", audio:"food-03.ogg", difficulty:1 },

    // ── Shopping ───────────────────────────────────────────────
    { id:"shop-01", topic:"shopping", arabic:"بكام ده؟", transliteration:"bekām da?", english:"How much is this?",
      promptEnglish:"Ask the price of something.", suggestedResponse:"بعشرة جنيه", audio:"shop-01.ogg", difficulty:1 },
    { id:"shop-02", topic:"shopping", arabic:"غالي أوي!", transliteration:"ghāli ʾawi!", english:"That’s very expensive!",
      promptEnglish:"Say something is too expensive.", suggestedResponse:"طيب، تسعة", audio:"shop-02.ogg", difficulty:1 },
    { id:"shop-03", topic:"shopping", arabic:"ممكن أشوفه؟", transliteration:"momken ashūfo?", english:"Can I see it?",
      promptEnglish:"Ask to see an item.", suggestedResponse:"اتفضل", audio:"shop-03.ogg", difficulty:2 },

    // ── Transportation ─────────────────────────────────────────
    { id:"trans-01", topic:"transport", arabic:"التاكسي بكام للمطار؟", transliteration:"et-taksi bekām lel-maṭār?", english:"How much is the taxi to the airport?",
      promptEnglish:"Ask a taxi fare to the airport.", suggestedResponse:"بمية جنيه", audio:"trans-01.ogg", difficulty:3 },
    { id:"trans-02", topic:"transport", arabic:"على طول، لو سمحت", transliteration:"ʿala ṭūl, law samaḥt", english:"Straight ahead, please",
      promptEnglish:"Tell the driver to keep going straight.", suggestedResponse:"حاضر", audio:"trans-02.ogg", difficulty:1 },
    { id:"trans-03", topic:"transport", arabic:"هنا كويس، شكراً", transliteration:"hena kwayyes, shukran", english:"Here is fine, thanks",
      promptEnglish:"Tell the driver to stop here.", suggestedResponse:"اتفضل", audio:"trans-03.ogg", difficulty:2 },

    // ── Asking directions ──────────────────────────────────────
    { id:"dir-01", topic:"directions", arabic:"فين أقرب محطة مترو؟", transliteration:"fēn aʾrab maḥaṭṭet metro?", english:"Where’s the nearest metro station?",
      promptEnglish:"Ask for the nearest metro station.", suggestedResponse:"على يمينك", audio:"dir-01.ogg", difficulty:3 },
    { id:"dir-02", topic:"directions", arabic:"المحطة بعيدة؟", transliteration:"el-maḥaṭṭa beʿīda?", english:"Is the station far?",
      promptEnglish:"Ask if a place is far.", suggestedResponse:"لأ، قريبة", audio:"dir-02.ogg", difficulty:2 },
    { id:"dir-03", topic:"directions", arabic:"أروح إزاي هناك؟", transliteration:"arūḥ ezzāy henāk?", english:"How do I get there?",
      promptEnglish:"Ask how to get somewhere.", suggestedResponse:"امشي على طول", audio:"dir-03.ogg", difficulty:2 },

    // ── Time & plans ───────────────────────────────────────────
    { id:"time-01", topic:"time", arabic:"الساعة كام؟", transliteration:"es-sāʿa kām?", english:"What time is it?",
      promptEnglish:"Ask what time it is.", suggestedResponse:"الساعة تلاتة", audio:"time-01.ogg", difficulty:1 },
    { id:"time-02", topic:"time", arabic:"نتقابل إمتى؟", transliteration:"netʾābel emta?", english:"When shall we meet?",
      promptEnglish:"Ask a friend when to meet.", suggestedResponse:"بكرة الصبح", audio:"time-02.ogg", difficulty:2 },
    { id:"time-03", topic:"time", arabic:"تعالى نخرج بكرة", transliteration:"taʿāla nokhrog bokra", english:"Let’s go out tomorrow",
      promptEnglish:"Suggest going out tomorrow.", suggestedResponse:"ماشي، اتفقنا", audio:"time-03.ogg", difficulty:2 },

    // ── Asking for help ────────────────────────────────────────
    { id:"help-01", topic:"help", arabic:"ممكن تساعدني؟", transliteration:"momken tesaʿedni?", english:"Can you help me?",
      promptEnglish:"Ask someone for help.", suggestedResponse:"أكيد، اتفضل", audio:"help-01.ogg", difficulty:1 },
    { id:"help-02", topic:"help", arabic:"أنا تايه", transliteration:"ana tāyeh", english:"I’m lost",
      promptEnglish:"Tell someone you’re lost.", suggestedResponse:"متقلقش، أنا هساعدك", audio:"help-02.ogg", difficulty:1 },
    { id:"help-03", topic:"help", arabic:"ممكن تتكلم إنجليزي؟", transliteration:"momken tetkallem engelīzi?", english:"Can you speak English?",
      promptEnglish:"Ask if someone speaks English.", suggestedResponse:"شوية", audio:"help-03.ogg", difficulty:2 },

    // ── Saying you don’t understand ────────────────────────────
    { id:"clar-01", topic:"clarify", arabic:"مش فاهم", transliteration:"mesh fāhem", english:"I don’t understand (m)",
      promptEnglish:"Say you don’t understand.", suggestedResponse:"طيب، هوضّحلك", audio:"clar-01.ogg", difficulty:1 },
    { id:"clar-02", topic:"clarify", arabic:"ممكن تعيد تاني؟", transliteration:"momken teʿīd tāni?", english:"Can you repeat that?",
      promptEnglish:"Ask someone to repeat.", suggestedResponse:"أكيد", audio:"clar-02.ogg", difficulty:1 },
    { id:"clar-03", topic:"clarify", arabic:"على مهلك، لو سمحت", transliteration:"ʿala mahlak, law samaḥt", english:"Slower, please",
      promptEnglish:"Ask someone to speak more slowly.", suggestedResponse:"حاضر", audio:"clar-03.ogg", difficulty:2 }
  ],

  // Mini-dialogues — original short exchanges. Each line: { role, arabic,
  // transliteration, english, audio }. roles[0] = A, roles[1] = B.
  dialogues: [
    { id:"dlg-meet", title:"Meeting someone", situation:"You meet someone new at a gathering.",
      roles:["A","B"], roleLabels:{ A:"You", B:"Nour" },
      lines:[
        { role:"A", arabic:"أهلاً، أنا اسمي كريم", transliteration:"ahlan, ana esmi Karim", english:"Hi, my name is Karim", audio:"dlg-meet-01.ogg" },
        { role:"B", arabic:"أهلاً يا كريم، أنا نور", transliteration:"ahlan ya Karim, ana Nour", english:"Hi Karim, I’m Nour", audio:"dlg-meet-02.ogg" },
        { role:"A", arabic:"إنتي منين يا نور؟", transliteration:"enti menēn ya Nour?", english:"Where are you from, Nour?", audio:"dlg-meet-03.ogg" },
        { role:"B", arabic:"أنا من القاهرة، وإنت؟", transliteration:"ana men el-ʾāhera, wenta?", english:"I’m from Cairo, and you?", audio:"dlg-meet-04.ogg" },
        { role:"A", arabic:"أنا من أمريكا", transliteration:"ana men Amrika", english:"I’m from America", audio:"dlg-meet-05.ogg" },
        { role:"B", arabic:"فرصة سعيدة!", transliteration:"forṣa saʿīda!", english:"Nice to meet you!", audio:"dlg-meet-06.ogg" }
      ] },
    { id:"dlg-family", title:"Visiting family", situation:"You visit a friend’s family at home.",
      roles:["A","B"], roleLabels:{ A:"Guest", B:"Host" },
      lines:[
        { role:"B", arabic:"اتفضل، خش", transliteration:"etfaḍḍal, khosh", english:"Come in, please", audio:"dlg-family-01.ogg" },
        { role:"A", arabic:"شكراً، البيت جميل", transliteration:"shukran, el-bēt gamīl", english:"Thanks, the house is beautiful", audio:"dlg-family-02.ogg" },
        { role:"B", arabic:"تشرب إيه؟ شاي ولا قهوة؟", transliteration:"teshrab ēh? shāy walla ʾahwa?", english:"What will you drink? Tea or coffee?", audio:"dlg-family-03.ogg" },
        { role:"A", arabic:"شاي، لو سمحت", transliteration:"shāy, law samaḥt", english:"Tea, please", audio:"dlg-family-04.ogg" },
        { role:"B", arabic:"حاضر، اتفضل اقعد", transliteration:"ḥāḍer, etfaḍḍal oʾʿod", english:"Sure, please have a seat", audio:"dlg-family-05.ogg" },
        { role:"A", arabic:"ألف شكر", transliteration:"alf shukr", english:"Thanks a lot", audio:"dlg-family-06.ogg" }
      ] },
    { id:"dlg-coffee", title:"Ordering coffee", situation:"You order at a coffee shop.",
      roles:["A","B"], roleLabels:{ A:"You", B:"Barista" },
      lines:[
        { role:"B", arabic:"أيوة يا فندم؟", transliteration:"aywa ya fandem?", english:"Yes, sir/madam?", audio:"dlg-coffee-01.ogg" },
        { role:"A", arabic:"قهوة واحدة، لو سمحت", transliteration:"ʾahwa waḥda, law samaḥt", english:"One coffee, please", audio:"dlg-coffee-02.ogg" },
        { role:"B", arabic:"سكر؟", transliteration:"sokkar?", english:"Sugar?", audio:"dlg-coffee-03.ogg" },
        { role:"A", arabic:"شوية سكر", transliteration:"shwayyet sokkar", english:"A little sugar", audio:"dlg-coffee-04.ogg" },
        { role:"B", arabic:"حاضر، بجنيه ونص", transliteration:"ḥāḍer, be-genēh w noṣ", english:"Sure — that’s 1.5 pounds", audio:"dlg-coffee-05.ogg" },
        { role:"A", arabic:"اتفضل", transliteration:"etfaḍḍal", english:"Here you go", audio:"dlg-coffee-06.ogg" }
      ] },
    { id:"dlg-restaurant", title:"At a restaurant", situation:"You order a meal at a restaurant.",
      roles:["A","B"], roleLabels:{ A:"You", B:"Waiter" },
      lines:[
        { role:"A", arabic:"ممكن المنيو؟", transliteration:"momken el-menyu?", english:"Can I have the menu?", audio:"dlg-restaurant-01.ogg" },
        { role:"B", arabic:"اتفضل. تحب تطلب إيه؟", transliteration:"etfaḍḍal. teḥeb teṭlob ēh?", english:"Here you go. What would you like to order?", audio:"dlg-restaurant-02.ogg" },
        { role:"A", arabic:"عايز فراخ ورز", transliteration:"ʿāyez firākh w roz", english:"I’d like chicken and rice", audio:"dlg-restaurant-03.ogg" },
        { role:"B", arabic:"تشرب حاجة؟", transliteration:"teshrab ḥāga?", english:"Anything to drink?", audio:"dlg-restaurant-04.ogg" },
        { role:"A", arabic:"مية، لو سمحت", transliteration:"mayya, law samaḥt", english:"Water, please", audio:"dlg-restaurant-05.ogg" },
        { role:"B", arabic:"حاضر", transliteration:"ḥāḍer", english:"Right away", audio:"dlg-restaurant-06.ogg" }
      ] },
    { id:"dlg-shopping", title:"Shopping", situation:"You buy a shirt and bargain a little.",
      roles:["A","B"], roleLabels:{ A:"You", B:"Vendor" },
      lines:[
        { role:"A", arabic:"بكام القميص ده؟", transliteration:"bekām el-ʾamīṣ da?", english:"How much is this shirt?", audio:"dlg-shopping-01.ogg" },
        { role:"B", arabic:"بمية جنيه", transliteration:"be-mīt genēh", english:"100 pounds", audio:"dlg-shopping-02.ogg" },
        { role:"A", arabic:"غالي أوي!", transliteration:"ghāli ʾawi!", english:"Too expensive!", audio:"dlg-shopping-03.ogg" },
        { role:"B", arabic:"طيب، بتمانين", transliteration:"ṭayyeb, be-tamanīn", english:"Okay — 80", audio:"dlg-shopping-04.ogg" },
        { role:"A", arabic:"ماشي، هاخده", transliteration:"māshi, hākhdo", english:"Fine, I’ll take it", audio:"dlg-shopping-05.ogg" },
        { role:"B", arabic:"مبروك", transliteration:"mabrūk", english:"Enjoy it!", audio:"dlg-shopping-06.ogg" }
      ] },
    { id:"dlg-taxi", title:"Taking a taxi", situation:"You take a taxi across town.",
      roles:["A","B"], roleLabels:{ A:"You", B:"Driver" },
      lines:[
        { role:"A", arabic:"للتحرير، لو سمحت", transliteration:"let-taḥrīr, law samaḥt", english:"To Tahrir, please", audio:"dlg-taxi-01.ogg" },
        { role:"B", arabic:"اتفضل، اركب", transliteration:"etfaḍḍal, erkab", english:"Sure, get in", audio:"dlg-taxi-02.ogg" },
        { role:"A", arabic:"بكام؟", transliteration:"bekām?", english:"How much?", audio:"dlg-taxi-03.ogg" },
        { role:"B", arabic:"بخمسين جنيه", transliteration:"be-khamsīn genēh", english:"50 pounds", audio:"dlg-taxi-04.ogg" },
        { role:"A", arabic:"على طول، وبعدين شمال", transliteration:"ʿala ṭūl, we baʿdēn shemāl", english:"Straight, then left", audio:"dlg-taxi-05.ogg" },
        { role:"B", arabic:"حاضر", transliteration:"ḥāḍer", english:"Got it", audio:"dlg-taxi-06.ogg" }
      ] },
    { id:"dlg-directions", title:"Asking directions", situation:"You ask a passer-by for the bank.",
      roles:["A","B"], roleLabels:{ A:"You", B:"Passer-by" },
      lines:[
        { role:"A", arabic:"لو سمحت، فين البنك؟", transliteration:"law samaḥt, fēn el-bank?", english:"Excuse me, where’s the bank?", audio:"dlg-directions-01.ogg" },
        { role:"B", arabic:"على طول وبعدين يمين", transliteration:"ʿala ṭūl we baʿdēn yemīn", english:"Straight, then right", audio:"dlg-directions-02.ogg" },
        { role:"A", arabic:"بعيد؟", transliteration:"beʿīd?", english:"Is it far?", audio:"dlg-directions-03.ogg" },
        { role:"B", arabic:"لأ، قريب", transliteration:"laʾ, ʾorayyeb", english:"No, it’s close", audio:"dlg-directions-04.ogg" },
        { role:"A", arabic:"شكراً جزيلاً", transliteration:"shukran gazīlan", english:"Thank you very much", audio:"dlg-directions-05.ogg" },
        { role:"B", arabic:"العفو", transliteration:"el-ʿafw", english:"You’re welcome", audio:"dlg-directions-06.ogg" }
      ] },
    { id:"dlg-plans", title:"Making weekend plans", situation:"You plan the weekend with a friend.",
      roles:["A","B"], roleLabels:{ A:"You", B:"Friend" },
      lines:[
        { role:"A", arabic:"تعمل إيه الأجازة؟", transliteration:"teʿmel ēh el-agāza?", english:"What are you doing this weekend?", audio:"dlg-plans-01.ogg" },
        { role:"B", arabic:"مفيش حاجة، وإنت؟", transliteration:"mafīsh ḥāga, wenta?", english:"Nothing — and you?", audio:"dlg-plans-02.ogg" },
        { role:"A", arabic:"تحب نروح السينما؟", transliteration:"teḥeb nerūḥ es-sinema?", english:"Want to go to the cinema?", audio:"dlg-plans-03.ogg" },
        { role:"B", arabic:"فكرة حلوة! إمتى؟", transliteration:"fekra ḥelwa! emta?", english:"Nice idea! When?", audio:"dlg-plans-04.ogg" },
        { role:"A", arabic:"بكرة الساعة سبعة", transliteration:"bokra es-sāʿa sabʿa", english:"Tomorrow at seven", audio:"dlg-plans-05.ogg" },
        { role:"B", arabic:"ماشي، اتفقنا", transliteration:"māshi, ettafaʾna", english:"Okay — it’s a deal", audio:"dlg-plans-06.ogg" }
      ] }
  ]
};
