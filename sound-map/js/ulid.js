/**
 * SOUND/ulid.js
 *
 * ULID — Universally Unique Lexicographically Sortable Identifier.
 * 26 characters: 10-char timestamp (48 bits, ms since epoch) + 16-char
 * randomness (80 bits). Crockford base32 (no I, L, O, U).
 *
 * Within the same millisecond, randomness is incremented monotonically so
 * back-to-back IDs remain in stable sort order.
 *
 * Public API:
 *   SOUND.ulid()         → "01HW2Z3K7N9XQR4M5S8YT6PFVB"
 *   SOUND.ulid("bar")    → "bar_01HW2Z3K7N9XQR4M5S8YT6PFVB"
 */
(function () {
  "use strict";
  if (!window.SOUND) window.SOUND = {};

  const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const ENCODING_LEN = 32;
  const TIME_LEN = 10;
  const RANDOM_LEN = 16;
  const MAX_TIME = 0xffffffffffff; // 48 bits

  let lastTime = 0;
  let lastRandom = null;

  function encodeTime(ms) {
    if (ms > MAX_TIME) throw new Error("ULID: timestamp exceeds 48 bits");
    let s = "";
    for (let i = TIME_LEN - 1; i >= 0; i--) {
      const mod = ms % ENCODING_LEN;
      s = ENCODING[mod] + s;
      ms = (ms - mod) / ENCODING_LEN;
    }
    return s;
  }

  function newRandom() {
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  function incrementRandom(bytes) {
    for (let i = bytes.length - 1; i >= 0; i--) {
      if (bytes[i] === 0xff) {
        bytes[i] = 0;
        if (i === 0) return newRandom();
      } else {
        bytes[i] += 1;
        return bytes;
      }
    }
    return newRandom();
  }

  function encodeRandom(bytes) {
    let n = 0n;
    for (const b of bytes) n = (n << 8n) | BigInt(b);
    let s = "";
    for (let i = 0; i < RANDOM_LEN; i++) {
      s = ENCODING[Number(n & 31n)] + s;
      n >>= 5n;
    }
    return s;
  }

  function ulid(prefix) {
    const now = Date.now();
    const random = (now === lastTime && lastRandom)
      ? incrementRandom(new Uint8Array(lastRandom))
      : newRandom();
    lastTime = now;
    lastRandom = random;
    const id = encodeTime(now) + encodeRandom(random);
    return prefix ? `${prefix}_${id}` : id;
  }

  SOUND.ulid = ulid;
})();
