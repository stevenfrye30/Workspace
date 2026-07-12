# Listening & Speaking audio — credits and provenance

Every clip in this folder is listed here with its true source, license, and dialect. The
goal of this section is native Egyptian (Cairene) speech; where a clip is **not** Egyptian,
it says so plainly rather than passing as Egyptian.

Clips are only playable in the app if their filename appears in `audioAvailable` in
`data/listening.js`. Everything else stays visibly unavailable and is never requested.

**Never used here:** synthetic/TTS speech, copyrighted media (film, TV, music, podcasts,
YouTube, social media), or spliced-together words.

## Current clips (1 of 78)

| Local file | Phrase ID | Arabic | Source file | Author / speaker | Dialect | License | Modified? |
|---|---|---|---|---|---|---|---|
| `greet-03.ogg` | greet-03 | أهلاً | [File:Ar-أهلا.oga](https://commons.wikimedia.org/wiki/File:Ar-%D8%A3%D9%87%D9%84%D8%A7.oga) | TwoThirty (English Wikibooks), via Wikimedia Commons | **Not documented** — not verified Egyptian. Used because the recording does not materially conflict with the Egyptian learning form Masri displays (*ahlan!*) | **Public domain** | No. Renamed only; the Ogg Vorbis bitstream is byte-for-byte the original (no re-encode) |

### Attribution

Public domain imposes no attribution requirement. Credit is given anyway, as good practice:

> "أهلا" recorded by **TwoThirty** (English Wikibooks), via Wikimedia Commons. Public
> domain. Source: https://commons.wikimedia.org/wiki/File:Ar-%D8%A3%D9%87%D9%84%D8%A7.oga
> Dialect not documented. Used unmodified.

## Considered and rejected

| Candidate | For | License | Why rejected |
|---|---|---|---|
| [File:LL-Q13955 (ara)-Fjmustak-صباح الخير.wav](https://commons.wikimedia.org/wiki/File:LL-Q13955_(ara)-Fjmustak-%D8%B5%D8%A8%D8%A7%D8%AD_%D8%A7%D9%84%D8%AE%D9%8A%D8%B1.wav) | greet-02 | CC BY-SA 4.0 | Filed as **Modern Standard Arabic**; speaker origin undocumented. Egyptian says *ṣabāḥ el-khēr*, MSA says *ṣabāḥ al-khayr*. Audio is technically clean, but the clip would very likely contradict the transliteration printed directly beneath the play button. Held pending a human listen |
| Lingua Libre Egyptian corpus (`arz`, ~995 files) | all | CC BY-SA 4.0 | **Single words only** (`مش`, `ممكن`, `شوية`). Building phrases from them would mean splicing, which this project does not do |
| Tatoeba Egyptian Arabic audio | all | varies by contributor | Only 3 clips exist in total; none match any Masri phrase |
| Mozilla Common Voice (Arabic) | all | CC0 corpus | Prompts are MSA Wikipedia sentences; no colloquial Egyptian phrase matches, and per-clip speaker dialect is undocumented |

## Still needed

77 clips: 29 of the 30 standalone phrases and all 48 dialogue lines. The Egyptian-specific
phrases (`إزيك؟`, `مش فاهم`, `ممكن تساعدني؟`, `بكام ده؟`, `على مهلك`, `أنا عايز قهوة`) have **no
reusable open recording anywhere** and must be recorded by a native Cairene speaker. See
`RECORDING_GUIDE.md` (local, not deployed).
