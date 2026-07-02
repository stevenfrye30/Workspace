// Time & Days — telling time, days, and simple scheduling in Egyptian (Cairene)
// Arabic. Reference tables, beginner-friendly. Not a grammar lesson.
window.MASRI = window.MASRI || {};
window.MASRI.time = {
  intro:
    "Days, parts of the day, and simple scheduling. The Egyptian week starts on " +
    "<b>Saturday</b>. “O'clock” is <b>الساعة</b> (es-sāʿa), literally “the hour.” " +
    "Forms are the everyday spoken ones; a woman adds -a (e.g. أنا متأخرة " +
    "<i>ana metʾakhkhara</i>, I'm late).",
  tables: [
    {
      title: "Days of the week",
      note: "يوم <i>yōm</i> = day. The week runs Saturday → Friday; Friday (الجمعة) is the day off.",
      headers: ["Arabic", "Masri", "English"],
      rows: [
        ["السبت",   "es-sabt",   "Saturday"],
        ["الحد",    "el-ḥadd",   "Sunday"],
        ["الاتنين", "el-etnēn",  "Monday"],
        ["التلات",  "et-talāt",  "Tuesday"],
        ["الأربع",  "el-arbaʿ",  "Wednesday"],
        ["الخميس",  "el-khamīs", "Thursday"],
        ["الجمعة",  "el-gomʿa",  "Friday"]
      ]
    },
    {
      title: "Parts of the day & when",
      note: "These pair with الساعة and with verbs (هاجي بكرة = I'll come tomorrow).",
      headers: ["Arabic", "Masri", "English"],
      rows: [
        ["الصبح",      "eṣ-ṣobḥ",     "morning"],
        ["بعد الضهر",  "baʿd eḍ-ḍohr","afternoon"],
        ["المسا",      "el-masa",     "evening"],
        ["الليل",      "el-lēl",      "night"],
        ["النهارده",   "en-naharda",  "today"],
        ["بكرة",       "bokra",       "tomorrow"],
        ["إمبارح",     "embāreḥ",     "yesterday"],
        ["دلوقتي",     "delwaʾti",    "now"],
        ["بعدين",      "baʿdēn",      "later"],
        ["بدري",       "badri",       "early"],
        ["متأخر",      "metʾakhkhar", "late"]
      ]
    },
    {
      title: "Time phrases",
      note: "Clock hours use الساعة + the number (see the Numbers tab). “At …” is just الساعة + number.",
      headers: ["Arabic", "Masri", "English"],
      rows: [
        ["الساعة كام؟",   "es-sāʿa kām?",     "what time is it?"],
        ["الساعة واحدة",  "es-sāʿa waḥda",    "it's one o'clock"],
        ["الساعة اتنين",  "es-sāʿa etnēn",    "it's two o'clock"],
        ["الساعة تلاتة",  "es-sāʿa talāta",   "at 3 o'clock"],
        ["الصبح",         "eṣ-ṣobḥ",          "in the morning"],
        ["بالليل",        "bel-lēl",          "at night"],
        ["أنا متأخر",     "ana metʾakhkhar",  "I'm late (m)"],
        ["أنا بدري",      "ana badri",        "I'm early"],
        ["هاجي بكرة",     "hāgi bokra",       "I'll come tomorrow"],
        ["هروح بعدين",    "harūḥ baʿdēn",     "I'll go later"],
        ["أشوفك بكرة",    "ashūfak bokra",    "see you tomorrow (to m)"],
        ["أشوفك بعدين",   "ashūfak baʿdēn",   "see you later (to m)"]
      ]
    },
    {
      title: "Scheduling words",
      note: "A class/lesson is حصة <i>ḥessa</i>; مدرسة is the school itself.",
      headers: ["Arabic", "Masri", "English"],
      rows: [
        ["معاد",          "miʿād",         "appointment"],
        ["شغل",           "shoghl",        "work"],
        ["مدرسة",         "madrasa",       "school / class"],
        ["اجتماع",        "egtimāʿ",       "meeting"],
        ["راحة",          "rāḥa",          "break / rest"],
        ["قبل",           "ʾabl",          "before"],
        ["بعد",           "baʿd",          "after"],
        ["كل يوم",        "koll yōm",      "every day"],
        ["الأسبوع ده",    "el-osbūʿ da",   "this week"],
        ["الأسبوع الجاي", "el-osbūʿ el-gayy","next week"]
      ]
    }
  ]
};
