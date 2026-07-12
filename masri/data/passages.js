// Type → Test → Passage Typing content.
//
// Two content sets ship now — original Egyptian Arabic passages written for Masri,
// and a tiny, carefully verified set of short Quranic (Classical Arabic) passages —
// plus category metadata reserving future sets (Songs, Egyptian News, Short Stories,
// Dialogue) which carry NO content here (no copyrighted lyrics/news, nothing fetched).
//
// Passage shape:
//   { id, title, difficulty, variety, source, ref?, lines:[{ ar, tr?, en?, ref? }] }
// Each `lines` entry is one practice segment. The displayed Arabic is authoritative
// and is never normalized; only the typing COMPARISON normalizes (see index.html).
//
// Quranic Arabic is standard Hafs diacritized orthography, kept separate from the
// Egyptian word pool and Egyptian pronunciation guidance. English lines are plain
// meaning glosses (not a specific copyrighted translation).
window.MASRI = window.MASRI || {};
window.MASRI.passages = {
  categories: [
    { id:'egyptian', label:'Egyptian Arabic',     variety:'Egyptian Arabic (Cairene)', available:true },
    { id:'quran',    label:'Quranic Arabic',       variety:'Classical / Quranic Arabic', available:true, formal:true },
    { id:'custom',   label:'Paste your own text',  variety:'Your text', available:true, custom:true },
    { id:'songs',    label:'Songs',                available:false, note:'Future set — no lyrics included yet.' },
    { id:'news',     label:'Egyptian News',        available:false, note:'Future set — no articles included yet.' },
    { id:'stories',  label:'Short Stories',        available:false, note:'Future set.' },
    { id:'dialogue', label:'Dialogue',             available:false, note:'Future set.' }
  ],

  egyptian: [
    // ── Beginner (4) ──────────────────────────────────────────────────────
    { id:'eg-b1', title:'Introducing yourself', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'أنا اسمي منى.', tr:'ana esmi Mona.', en:'My name is Mona.' },
      { ar:'أنا من مصر.', tr:'ana men Maṣr.', en:"I'm from Egypt." },
      { ar:'تشرفنا.', tr:'tsharrafna.', en:'Nice to meet you.' }
    ]},
    { id:'eg-b2', title:'Ordering coffee', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'عايز قهوة لو سمحت.', tr:'ʿāyez ʾahwa law samaḥt.', en:"I'd like a coffee, please." },
      { ar:'بسكر شوية.', tr:'be-sokkar shwayya.', en:'With a little sugar.' },
      { ar:'شكراً.', tr:'shukran.', en:'Thank you.' }
    ]},
    { id:'eg-b3', title:'Asking for directions', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'فين المترو؟', tr:'fēn el-metro?', en:'Where is the metro?' },
      { ar:'على طول وبعدين شمال.', tr:'ʿala ṭūl we-baʿdēn shemāl.', en:'Straight ahead, then left.' },
      { ar:'متشكر.', tr:'motshakker.', en:'Thanks.' }
    ]},
    { id:'eg-b4', title:'A normal morning', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'أنا في البيت.', tr:'ana fel-bēt.', en:"I'm at home." },
      { ar:'بشرب شاي.', tr:'bashrab shāy.', en:"I'm drinking tea." },
      { ar:'الجو حلو النهارده.', tr:'el-gaww ḥelw en-naharda.', en:'The weather is nice today.' }
    ]},
    // ── Intermediate (4) ──────────────────────────────────────────────────
    { id:'eg-i1', title:'Taking a taxi', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'لو سمحت، أنا رايح وسط البلد.', tr:'law samaḥt, ana rāyeḥ wesṭ el-balad.', en:"Excuse me, I'm going downtown." },
      { ar:'الزحمة كتير النهارده.', tr:'ez-zaḥma ketīr en-naharda.', en:'There is a lot of traffic today.' },
      { ar:'كام الأجرة؟', tr:'kām el-ogra?', en:'How much is the fare?' }
    ]},
    { id:'eg-i2', title:'Shopping in the market', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'بكام الكيلو؟', tr:'be-kām el-kīlo?', en:'How much per kilo?' },
      { ar:'ده غالي شوية، ممكن تنزل السعر؟', tr:'da ghāli shwayya, momken tenazzel es-seʿr?', en:'That is a bit expensive — can you lower the price?' },
      { ar:'طيب، هاخد اتنين كيلو.', tr:'ṭayyeb, hākhod etnēn kīlo.', en:"OK, I'll take two kilos." }
    ]},
    { id:'eg-i3', title:'Visiting family', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'رحنا بيت جدو امبارح.', tr:'roḥna bēt geddo embāreḥ.', en:"We went to grandpa's house yesterday." },
      { ar:'اتغدينا وقعدنا نتكلم.', tr:'etghaddēna we-ʾaʿadna netkallem.', en:'We had lunch and sat talking.' },
      { ar:'الأكل كان لذيذ.', tr:'el-akl kān lazīz.', en:'The food was delicious.' }
    ]},
    { id:'eg-i4', title:'Making plans', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'تعالى نخرج بكرة.', tr:'taʿāla nokhrog bokra.', en:"Let's go out tomorrow." },
      { ar:'ممكن نروح السينما أو نتمشى على النيل.', tr:'momken nerūḥ es-sinema aw netmasha ʿala en-Nīl.', en:'We could go to the cinema or walk along the Nile.' },
      { ar:'اتصل بيا بالليل.', tr:'ettaṣel biyya bel-lēl.', en:'Call me at night.' }
    ]},
    // ── Advanced (2) ──────────────────────────────────────────────────────
    { id:'eg-a1', title:'Describing a normal day', difficulty:'advanced', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'بصحى الصبح بدري وبفطر.', tr:'baṣḥa eṣ-ṣobḥ badri we-bafṭar.', en:'I wake up early and have breakfast.' },
      { ar:'بروح الشغل بالمترو عشان الزحمة.', tr:'barūḥ esh-shoghl bel-metro ʿashān ez-zaḥma.', en:'I go to work by metro because of the traffic.' },
      { ar:'بالليل بقعد مع العيلة أو بقرا شوية.', tr:'bel-lēl baʾʿod maʿa el-ʿēla aw baʾra shwayya.', en:'At night I sit with the family or read a bit.' }
    ]},
    { id:'eg-a2', title:'Asking for help', difficulty:'advanced', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'لو سمحت، أنا تايه ومش عارف الطريق.', tr:'law samaḥt, ana tāyeh we-mesh ʿāref eṭ-ṭarīʾ.', en:"Excuse me, I'm lost and don't know the way." },
      { ar:'ممكن تساعدني أوصل للمحطة؟', tr:'momken tesaʿedni awṣal lel-maḥaṭṭa?', en:'Can you help me get to the station?' },
      { ar:'متشكر جدا على مساعدتك.', tr:'motshakker gedan ʿala mosaʿdetak.', en:'Thank you very much for your help.' }
    ]},
    // ── Beginner (more) ───────────────────────────────────────────────────
    { id:'eg-b5', title:'Greetings and small talk', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'إزيك؟', tr:'ezzayyak?', en:'How are you?' },
      { ar:'أنا كويس الحمد لله.', tr:'ana kwayyes el-ḥamdu lellāh.', en:"I'm fine, thank God." },
      { ar:'وإنت عامل إيه؟', tr:'wenta ʿāmel ēh?', en:'And how are you doing?' }
    ]},
    { id:'eg-b6', title:'Paying at a restaurant', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'الحساب لو سمحت.', tr:'el-ḥesāb law samaḥt.', en:'The bill, please.' },
      { ar:'الأكل كان جميل.', tr:'el-akl kān gamīl.', en:'The food was lovely.' },
      { ar:'متشكرين.', tr:'motshakkerīn.', en:'Thank you.' }
    ]},
    { id:'eg-b7', title:'Talking about the weather', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'النهارده حر.', tr:'en-naharda ḥarr.', en:'It is hot today.' },
      { ar:'بكرة هيكون أحسن.', tr:'bokra haykūn aḥsan.', en:'Tomorrow will be better.' },
      { ar:'خد معاك مية.', tr:'khod maʿāk mayya.', en:'Take water with you.' }
    ]},
    { id:'eg-b8', title:'Asking the time', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'الساعة كام؟', tr:'es-sāʿa kām?', en:'What time is it?' },
      { ar:'الساعة تلاتة.', tr:'es-sāʿa talāta.', en:"It's three o'clock." },
      { ar:'لسه بدري.', tr:'lessa badri.', en:'It is still early.' }
    ]},
    { id:'eg-b9', title:'My family', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'ده بابا وده أخويا.', tr:'da bāba we-da akhūya.', en:'This is my dad and this is my brother.' },
      { ar:'دي ماما ودي أختي.', tr:'di māma we-di okhti.', en:'This is my mom and this is my sister.' },
      { ar:'إحنا ساكنين مع بعض.', tr:'eḥna sakenīn maʿa baʿḍ.', en:'We all live together.' }
    ]},
    { id:'eg-b10', title:'Buying bread', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'عايز عيش بخمسة جنيه لو سمحت.', tr:'ʿāyez ʿēsh be-khamsa geneh law samaḥt.', en:"I'd like five pounds' worth of bread, please." },
      { ar:'اتفضل، معاك فكة؟', tr:'etfaḍḍal, maʿāk fakka?', en:'Here you go. Do you have change?' },
      { ar:'أيوة، اتفضل خمسة بالظبط.', tr:'aywa, etfaḍḍal khamsa bez-zabṭ.', en:'Yes, here you go, exactly five.' }
    ]},
    { id:'eg-b11', title:'What do you do', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'إنتي بتشتغلي إيه؟', tr:'enti beteshtaghali ēh?', en:'What do you do for work?' },
      { ar:'أنا مدرسة، وإنت؟', tr:'ana modarresa, wenta?', en:"I'm a teacher. And you?" },
      { ar:'أنا لسه طالب في الجامعة.', tr:'ana lessa ṭāleb fel-gamʿa.', en:"I'm still a student at university." }
    ]},
    { id:'eg-b12', title:'Evening at home', difficulty:'beginner', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'بتعشى بدري مع أهلي.', tr:'batʿashsha badri maʿa ahli.', en:'I have dinner early with my family.' },
      { ar:'وبعدين بتفرج على التلفزيون.', tr:'we-baʿdēn batfarrag ʿala et-telefezyōn.', en:'Then I watch television.' },
      { ar:'وبنام قبل الساعة اتناشر.', tr:'we-banām ʾabl es-sāʿa etnāshar.', en:'And I go to sleep before twelve.' }
    ]},
    // ── Intermediate (more) ───────────────────────────────────────────────
    { id:'eg-i5', title:'At the pharmacy', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'عندي صداع من الصبح.', tr:'ʿandi ṣodāʿ men eṣ-ṣobḥ.', en:'I have had a headache since the morning.' },
      { ar:'عايز حاجة للصداع لو سمحت.', tr:'ʿāyez ḥāga leṣ-ṣodāʿ law samaḥt.', en:"I'd like something for a headache, please." },
      { ar:'خد قرص كل تمن ساعات.', tr:'khod ʾorṣ koll taman sāʿāt.', en:'Take one pill every eight hours.' }
    ]},
    { id:'eg-i6', title:'A phone call', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'ألو، مساء الخير.', tr:'alu, masāʾ el-khēr.', en:'Hello, good evening.' },
      { ar:'ممكن أكلم أحمد؟', tr:'momken akallem Aḥmad?', en:'Can I speak to Ahmad?' },
      { ar:'هو مش موجود دلوقتي.', tr:'howwa mesh mawgūd delwaʾti.', en:'He is not here right now.' }
    ]},
    { id:'eg-i7', title:'Describing your neighborhood', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'أنا ساكن في المعادي.', tr:'ana sāken fel-Maʿādi.', en:'I live in Maadi.' },
      { ar:'فيها محلات ومطاعم كتير.', tr:'fīha maḥallāt we-maṭāʿem ketīr.', en:'It has lots of shops and restaurants.' },
      { ar:'المكان هادي وحلو.', tr:'el-makān hādi we-ḥelw.', en:'The place is quiet and nice.' }
    ]},
    { id:'eg-i8', title:'Weekend plans', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'الجمعة الجاية عندنا أجازة.', tr:'el-gomʿa el-gayya ʿandena agāza.', en:'Next Friday we have a day off.' },
      { ar:'يمكن نروح البحر.', tr:'yemken nerūḥ el-baḥr.', en:"Maybe we'll go to the sea." },
      { ar:'لازم نحجز بدري.', tr:'lāzem neḥgez badri.', en:'We need to book early.' }
    ]},
    { id:'eg-i9', title:'Ordering a meal', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'عايز طبق كشري وسط.', tr:'ʿāyez ṭabaʾ koshari wesṭ.', en:"I'd like a medium plate of koshari." },
      { ar:'من غير شطة لو سمحت.', tr:'men ghēr shaṭṭa law samaḥt.', en:'Without hot sauce, please.' },
      { ar:'وهات معاه إزازة مية.', tr:'we-hāt maʿāh ezāzet mayya.', en:'And bring a bottle of water with it.' },
      { ar:'هاكله هنا مش سفري.', tr:'hākolo hena mesh safari.', en:"I'll eat it here, not takeaway." }
    ]},
    { id:'eg-i10', title:'Metro and microbus', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'الخط ده بيروح التحرير؟', tr:'el-khaṭṭ da beyrūḥ et-Taḥrīr?', en:'Does this line go to Tahrir?' },
      { ar:'عايز تذكرة واحدة لو سمحت.', tr:'ʿāyez tazkara waḥda law samaḥt.', en:'One ticket, please.' },
      { ar:'وبعد المترو هاركب ميكروباص.', tr:'we-baʿd el-metro harkab mikrobāṣ.', en:"And after the metro I'll take a microbus." },
      { ar:'لو سمحت نزلني عند الجامع.', tr:'law samaḥt nazzelni ʿand el-gāmeʿ.', en:'Please let me off at the mosque.' }
    ]},
    { id:'eg-i11', title:'At the doctor', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'حاسس بتعب ومش قادر أنام.', tr:'ḥāses be-taʿab we-mesh ʾāder anām.', en:"I feel unwell and I can't sleep." },
      { ar:'عندي سخونية وزوري وجعني.', tr:'ʿandi sokhoneyya we-zōri wagaʿni.', en:'I have a fever and my throat hurts.' },
      { ar:'بقالك كام يوم عندك حرارة؟', tr:'baʾālak kām yōm ʿandak ḥarāra?', en:'How many days have you had a fever?' },
      { ar:'بقالي يومين، والتعب زايد.', tr:'baʾāli yomēn, wet-taʿab zāyed.', en:'Two days now, and it keeps getting worse.' }
    ]},
    { id:'eg-i12', title:'A problem in the flat', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'المية قطعت من الصبح.', tr:'el-mayya ʾaṭaʿet men eṣ-ṣobḥ.', en:'The water has been cut off since the morning.' },
      { ar:'والحنفية في المطبخ بايظة.', tr:'wel-ḥanafeyya fel-maṭbakh bāyẓa.', en:'And the tap in the kitchen is broken.' },
      { ar:'ممكن تبعتلي البواب دلوقتي؟', tr:'momken tebʿatli el-bawwāb delwaʾti?', en:'Can you send me the doorman now?' }
    ]},
    { id:'eg-i13', title:'Running late', difficulty:'intermediate', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'آسفة، أنا اتأخرت شوية.', tr:'asfa, ana etʾakhkhart shwayya.', en:"Sorry, I'm running a little late." },
      { ar:'الزحمة كانت فظيعة في الطريق.', tr:'ez-zaḥma kānet faẓīʿa feṭ-ṭarīʾ.', en:'The traffic on the way was terrible.' },
      { ar:'هبقى عندك بعد تلت ساعة.', tr:'habʾa ʿandak baʿd telt sāʿa.', en:"I'll be at your place in a third of an hour, about twenty minutes." }
    ]},
    // ── Advanced (more) ───────────────────────────────────────────────────
    { id:'eg-a3', title:'A short trip', difficulty:'advanced', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'الأسبوع اللي فات رحنا الإسكندرية.', tr:'el-osbūʿ elli fāt roḥna el-Eskendereyya.', en:'Last week we went to Alexandria.' },
      { ar:'قعدنا على البحر وأكلنا سمك.', tr:'ʾaʿadna ʿala el-baḥr we-akalna samak.', en:'We sat by the sea and ate fish.' },
      { ar:'الجو كان لطيف والرحلة كانت ممتعة.', tr:'el-gaww kān laṭīf we-r-reḥla kānet momteʿa.', en:'The weather was pleasant and the trip was enjoyable.' }
    ]},
    { id:'eg-a4', title:'Sharing an opinion', difficulty:'advanced', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'في رأيي القراية حاجة مهمة جدا.', tr:'fi raʾyi el-ʾerāya ḥāga mohemma gedan.', en:'In my opinion, reading is a very important thing.' },
      { ar:'بتفتح العقل وبتعلمنا حاجات كتير.', tr:'beteftaḥ el-ʿaʾl we-beteʿallemna ḥagāt ketīr.', en:'It opens the mind and teaches us many things.' },
      { ar:'أنا بحاول أقرا كل يوم شوية.', tr:'ana baḥāwel aʾra koll yōm shwayya.', en:'I try to read a little every day.' }
    ]},
    { id:'eg-a5', title:'A day at work', difficulty:'advanced', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'بوصل الشغل الساعة تسعة الصبح.', tr:'bawṣal esh-shoghl es-sāʿa tesʿa eṣ-ṣobḥ.', en:'I get to work at nine in the morning.' },
      { ar:'بقعد مع زمايلي نراجع الشغل.', tr:'baʾʿod maʿa zamayli nerāgeʿ esh-shoghl.', en:'I sit with my colleagues and we go over the work.' },
      { ar:'بعد الضهر باخد بريك وبشرب شاي.', tr:'baʿd eḍ-ḍohr bākhod brēk we-bashrab shāy.', en:'In the afternoon I take a break and drink tea.' },
      { ar:'وبمشي الساعة خمسة لو مفيش شغل زيادة.', tr:'we-bamshi es-sāʿa khamsa law mafīsh shoghl zeyāda.', en:'And I leave at five if there is no extra work.' }
    ]},
    { id:'eg-a6', title:'Something that happened to me', difficulty:'advanced', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'إمبارح كنت راجع من الشغل بالليل.', tr:'embāreḥ kont rāgeʿ men esh-shoghl bel-lēl.', en:'Yesterday I was coming home from work at night.' },
      { ar:'وبعدين اكتشفت إن موبايلي ضاع مني.', tr:'we-baʿdēn ektashaft en mobayli ḍāʿ menni.', en:'Then I realized my phone was gone.' },
      { ar:'فضلت أدور عليه لحد ما لقيته في العربية.', tr:'feḍelt adawwar ʿalēh laḥadd ma laʾēto fel-ʿarabeyya.', en:'I kept looking for it until I found it in the car.' },
      { ar:'الحمد لله، ومن ساعتها بقيت آخد بالي.', tr:'el-ḥamdu lellāh, we-men sāʿetha beʾēt ākhod bāli.', en:"Thank God, and since then I've been more careful." }
    ]},
    { id:'eg-a7', title:'Advice for a visitor to Cairo', difficulty:'advanced', variety:'Egyptian Arabic', source:'Original — written for Masri', lines:[
      { ar:'لو جيت القاهرة، خد بالك من الزحمة.', tr:'law gēt el-ʾāhera, khod bālak men ez-zaḥma.', en:'If you come to Cairo, watch out for the traffic.' },
      { ar:'متركبش تاكسي من غير ما تتفق على السعر.', tr:'materkabsh taksi men ghēr ma tettefeʾ ʿala es-seʿr.', en:"Don't get in a taxi without agreeing on the price." },
      { ar:'لازم تجرب الأكل في وسط البلد.', tr:'lāzem tegarrab el-akl fe-wesṭ el-balad.', en:'You have to try the food downtown.' },
      { ar:'ومتقلقش، الناس هنا بتساعد أي حد تايه.', tr:'we-matʾlaʾsh, en-nās hena betsāʿed ayy ḥadd tāyeh.', en:"And don't worry, people here help anyone who's lost." }
    ]}
  ],

  quran: [
    { id:'qr-fatiha', title:'Al-Fātiḥa (opening)', difficulty:'intermediate', variety:'Quranic Arabic (Classical)',
      source:'Qur’an — Sūrat al-Fātiḥa (1)', ref:'Sūrah 1 (Al-Fātiḥa), verses 1–4', lines:[
      { ar:'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', tr:'bismi llāhi r-raḥmāni r-raḥīm', en:'In the name of God, the Most Merciful, the Most Compassionate.', ref:'1:1' },
      { ar:'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', tr:'al-ḥamdu lillāhi rabbi l-ʿālamīn', en:'Praise be to God, Lord of all the worlds.', ref:'1:2' },
      { ar:'الرَّحْمَٰنِ الرَّحِيمِ', tr:'ar-raḥmāni r-raḥīm', en:'The Most Merciful, the Most Compassionate.', ref:'1:3' },
      { ar:'مَالِكِ يَوْمِ الدِّينِ', tr:'māliki yawmi d-dīn', en:'Master of the Day of Judgement.', ref:'1:4' }
    ]},
    { id:'qr-ikhlas', title:'Al-Ikhlāṣ', difficulty:'beginner', variety:'Quranic Arabic (Classical)',
      source:'Qur’an — Sūrat al-Ikhlāṣ (112)', ref:'Sūrah 112 (Al-Ikhlāṣ), verses 1–4', lines:[
      { ar:'قُلْ هُوَ اللَّهُ أَحَدٌ', tr:'qul huwa llāhu aḥad', en:'Say: He is God, One.', ref:'112:1' },
      { ar:'اللَّهُ الصَّمَدُ', tr:'allāhu ṣ-ṣamad', en:'God, the Eternal, the Absolute.', ref:'112:2' },
      { ar:'لَمْ يَلِدْ وَلَمْ يُولَدْ', tr:'lam yalid wa-lam yūlad', en:'He did not beget, nor was He begotten.', ref:'112:3' },
      { ar:'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', tr:'wa-lam yakun lahu kufuwan aḥad', en:'And there is none comparable to Him.', ref:'112:4' }
    ]}
  ]
};
