# Listening & Speaking — audio manifest
Required native **Egyptian (Cairene) Arabic** recordings for the Listening & Speaking
section. Files are **not present yet**; `window.MASRI.listening.audioReady` is `false`,
so the UI shows a clear "recording unavailable" state and never requests these files.

When real recordings are added here with the exact filenames below, flip `audioReady`
to `true` in `data/listening.js` to activate playback.

- Format: **OGG** (Vorbis), mono, normal speaking pace.
- One clip per phrase / per dialogue line. Filenames are stable ASCII tied to IDs.
- Optional **slow** variant per phrase for Shadow mode: `<id>-slow.ogg` (used only if present).
- Use natural Cairene pronunciation; no synthetic/TTS voices.

## Phrases (30)

### greetings
| File | Optional slow | Arabic | English |
|---|---|---|---|
| `greet-01.ogg` | `greet-01-slow.ogg` | إزيّك؟ | How are you? (to a man) |
| `greet-02.ogg` | `greet-02-slow.ogg` | صباح الخير | Good morning |
| `greet-03.ogg` | `greet-03-slow.ogg` | أهلاً! | Hi! / Welcome! |

### introducing
| File | Optional slow | Arabic | English |
|---|---|---|---|
| `intro-01.ogg` | `intro-01-slow.ogg` | اسمك إيه؟ | What’s your name? (to a man) |
| `intro-02.ogg` | `intro-02-slow.ogg` | أنا اسمي نيكول | My name is Nicole |
| `intro-03.ogg` | `intro-03-slow.ogg` | إنت منين؟ | Where are you from? (to a man) |

### family
| File | Optional slow | Arabic | English |
|---|---|---|---|
| `fam-01.ogg` | `fam-01-slow.ogg` | إزاي العيلة؟ | How’s the family? |
| `fam-02.ogg` | `fam-02-slow.ogg` | ألف شكر | Thanks a lot |
| `fam-03.ogg` | `fam-03-slow.ogg` | اتفضل | Here you go / Please (offering, to a man) |

### food
| File | Optional slow | Arabic | English |
|---|---|---|---|
| `food-01.ogg` | `food-01-slow.ogg` | ممكن المنيو؟ | Can I have the menu? |
| `food-02.ogg` | `food-02-slow.ogg` | أنا عايز قهوة، لو سمحت | I’d like a coffee, please (m) |
| `food-03.ogg` | `food-03-slow.ogg` | الحساب، لو سمحت | The bill, please |

### shopping
| File | Optional slow | Arabic | English |
|---|---|---|---|
| `shop-01.ogg` | `shop-01-slow.ogg` | بكام ده؟ | How much is this? |
| `shop-02.ogg` | `shop-02-slow.ogg` | غالي أوي! | That’s very expensive! |
| `shop-03.ogg` | `shop-03-slow.ogg` | ممكن أشوفه؟ | Can I see it? |

### transport
| File | Optional slow | Arabic | English |
|---|---|---|---|
| `trans-01.ogg` | `trans-01-slow.ogg` | التاكسي بكام للمطار؟ | How much is the taxi to the airport? |
| `trans-02.ogg` | `trans-02-slow.ogg` | على طول، لو سمحت | Straight ahead, please |
| `trans-03.ogg` | `trans-03-slow.ogg` | هنا كويس، شكراً | Here is fine, thanks |

### directions
| File | Optional slow | Arabic | English |
|---|---|---|---|
| `dir-01.ogg` | `dir-01-slow.ogg` | فين أقرب محطة مترو؟ | Where’s the nearest metro station? |
| `dir-02.ogg` | `dir-02-slow.ogg` | المحطة بعيدة؟ | Is the station far? |
| `dir-03.ogg` | `dir-03-slow.ogg` | أروح إزاي هناك؟ | How do I get there? |

### time
| File | Optional slow | Arabic | English |
|---|---|---|---|
| `time-01.ogg` | `time-01-slow.ogg` | الساعة كام؟ | What time is it? |
| `time-02.ogg` | `time-02-slow.ogg` | نتقابل إمتى؟ | When shall we meet? |
| `time-03.ogg` | `time-03-slow.ogg` | تعالى نخرج بكرة | Let’s go out tomorrow |

### help
| File | Optional slow | Arabic | English |
|---|---|---|---|
| `help-01.ogg` | `help-01-slow.ogg` | ممكن تساعدني؟ | Can you help me? |
| `help-02.ogg` | `help-02-slow.ogg` | أنا تُهت | I’m lost |
| `help-03.ogg` | `help-03-slow.ogg` | ممكن تتكلم إنجليزي؟ | Can you speak English? |

### clarify
| File | Optional slow | Arabic | English |
|---|---|---|---|
| `clar-01.ogg` | `clar-01-slow.ogg` | مش فاهم | I don’t understand (m) |
| `clar-02.ogg` | `clar-02-slow.ogg` | ممكن تعيد؟ | Can you repeat that? |
| `clar-03.ogg` | `clar-03-slow.ogg` | على مهلك، لو سمحت | Slower, please |

## Mini-dialogues (8)

### Meeting someone (`dlg-meet`)
| File | Arabic |
|---|---|
| `dlg-meet-01.ogg` | أهلاً، أنا اسمي كريم |
| `dlg-meet-02.ogg` | أهلاً يا كريم، أنا نور |
| `dlg-meet-03.ogg` | إنتي منين يا نور؟ |
| `dlg-meet-04.ogg` | أنا من القاهرة، وإنت؟ |
| `dlg-meet-05.ogg` | أنا من أمريكا |
| `dlg-meet-06.ogg` | فرصة سعيدة! |

### Visiting family (`dlg-family`)
| File | Arabic |
|---|---|
| `dlg-family-01.ogg` | اتفضل، خُش |
| `dlg-family-02.ogg` | شكراً، البيت جميل |
| `dlg-family-03.ogg` | تشرب إيه؟ شاي ولا قهوة؟ |
| `dlg-family-04.ogg` | شاي، لو سمحت |
| `dlg-family-05.ogg` | حاضر، اتفضل اقعد |
| `dlg-family-06.ogg` | ألف شكر |

### Ordering coffee (`dlg-coffee`)
| File | Arabic |
|---|---|
| `dlg-coffee-01.ogg` | أيوة يا فندم؟ |
| `dlg-coffee-02.ogg` | قهوة واحدة، لو سمحت |
| `dlg-coffee-03.ogg` | سكر؟ |
| `dlg-coffee-04.ogg` | شوية سكر |
| `dlg-coffee-05.ogg` | حاضر، بجنيه ونص |
| `dlg-coffee-06.ogg` | اتفضل |

### At a restaurant (`dlg-restaurant`)
| File | Arabic |
|---|---|
| `dlg-restaurant-01.ogg` | ممكن المنيو؟ |
| `dlg-restaurant-02.ogg` | اتفضل. تحب تطلب إيه؟ |
| `dlg-restaurant-03.ogg` | عايز فراخ ورز |
| `dlg-restaurant-04.ogg` | تشرب حاجة؟ |
| `dlg-restaurant-05.ogg` | مية، لو سمحت |
| `dlg-restaurant-06.ogg` | حاضر |

### Shopping (`dlg-shopping`)
| File | Arabic |
|---|---|
| `dlg-shopping-01.ogg` | بكام القميص ده؟ |
| `dlg-shopping-02.ogg` | بمية جنيه |
| `dlg-shopping-03.ogg` | غالي أوي! |
| `dlg-shopping-04.ogg` | طيب، بتمانين |
| `dlg-shopping-05.ogg` | ماشي، هاخده |
| `dlg-shopping-06.ogg` | مبروك |

### Taking a taxi (`dlg-taxi`)
| File | Arabic |
|---|---|
| `dlg-taxi-01.ogg` | للتحرير، لو سمحت |
| `dlg-taxi-02.ogg` | اتفضل، اركب |
| `dlg-taxi-03.ogg` | بكام؟ |
| `dlg-taxi-04.ogg` | بخمسين جنيه |
| `dlg-taxi-05.ogg` | على طول، وبعدين شمال |
| `dlg-taxi-06.ogg` | حاضر |

### Asking directions (`dlg-directions`)
| File | Arabic |
|---|---|
| `dlg-directions-01.ogg` | لو سمحت، فين البنك؟ |
| `dlg-directions-02.ogg` | على طول وبعدين يمين |
| `dlg-directions-03.ogg` | بعيد؟ |
| `dlg-directions-04.ogg` | لأ، قريّب |
| `dlg-directions-05.ogg` | شكراً جزيلاً |
| `dlg-directions-06.ogg` | العفو |

### Making weekend plans (`dlg-plans`)
| File | Arabic |
|---|---|
| `dlg-plans-01.ogg` | تعمل إيه الأجازة؟ |
| `dlg-plans-02.ogg` | مفيش حاجة، وإنت؟ |
| `dlg-plans-03.ogg` | تحب نروح السينما؟ |
| `dlg-plans-04.ogg` | فكرة حلوة! إمتى؟ |
| `dlg-plans-05.ogg` | بكرة الساعة سبعة |
| `dlg-plans-06.ogg` | ماشي، اتفقنا |

## Totals
- Phrase clips (required): **30**
- Phrase slow clips (optional): up to **30**
- Dialogue line clips (required): **48**
- **Total required: 78** (+ up to 30 optional slow clips)
