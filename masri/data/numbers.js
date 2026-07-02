// Numbers in Egyptian Arabic, with the Eastern Arabic digits Egypt uses.
window.MASRI = window.MASRI || {};
window.MASRI.numbers = {
  intro:
    "Egypt writes numerals with the Eastern Arabic digits <b>٠١٢٣٤٥٦٧٨٩</b> (still " +
    "left-to-right). The spoken words below are Cairene.",
  ones: [
    { digit: "٠", n: 0,  ar: "صفر",   tr: "sifr" },
    { digit: "١", n: 1,  ar: "واحد",  tr: "wāḥed" },
    { digit: "٢", n: 2,  ar: "اتنين", tr: "etnēn" },
    { digit: "٣", n: 3,  ar: "تلاتة", tr: "talāta" },
    { digit: "٤", n: 4,  ar: "أربعة", tr: "arbaʿa" },
    { digit: "٥", n: 5,  ar: "خمسة",  tr: "khamsa" },
    { digit: "٦", n: 6,  ar: "ستة",   tr: "setta" },
    { digit: "٧", n: 7,  ar: "سبعة",  tr: "sabʿa" },
    { digit: "٨", n: 8,  ar: "تمانية", tr: "tamanya" },
    { digit: "٩", n: 9,  ar: "تسعة",  tr: "tesʿa" },
    { digit: "١٠",n: 10, ar: "عشرة",  tr: "ʿashara" }
  ],
  teens: [
    { digit: "١١", n: 11, ar: "حداشر",   tr: "ḥedāshar" },
    { digit: "١٢", n: 12, ar: "اتناشر",  tr: "etnāshar" },
    { digit: "١٣", n: 13, ar: "تلاتاشر", tr: "talattāshar" },
    { digit: "١٤", n: 14, ar: "أربعتاشر",tr: "arbaʿtāshar" },
    { digit: "١٥", n: 15, ar: "خمستاشر", tr: "khamastāshar" },
    { digit: "٢٠", n: 20, ar: "عشرين",   tr: "ʿeshrīn" }
  ],
  tens: [
    { digit: "٢٠",  n: 20,   ar: "عشرين",  tr: "ʿeshrīn" },
    { digit: "٣٠",  n: 30,   ar: "تلاتين", tr: "talatīn" },
    { digit: "٤٠",  n: 40,   ar: "أربعين", tr: "arbeʿīn" },
    { digit: "٥٠",  n: 50,   ar: "خمسين",  tr: "khamsīn" },
    { digit: "٦٠",  n: 60,   ar: "ستين",   tr: "settīn" },
    { digit: "٧٠",  n: 70,   ar: "سبعين",  tr: "sabʿīn" },
    { digit: "٨٠",  n: 80,   ar: "تمانين", tr: "tamanīn" },
    { digit: "٩٠",  n: 90,   ar: "تسعين",  tr: "tesʿīn" },
    { digit: "١٠٠", n: 100,  ar: "مية",    tr: "meyya" },
    { digit: "١٠٠٠",n: 1000, ar: "ألف",    tr: "alf" }
  ],
  note:
    "Compounds join with و (we-, “and”): واحد وعشرين <i>wāḥed we-ʿeshrīn</i> = 21; " +
    "خمسة وتلاتين <i>khamsa we-talatīn</i> = 35."
};
