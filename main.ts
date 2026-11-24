// One Word From Your Ex — make.fun program/v1 entry (Node 22).
//
// The task: send exactly one word your ex would use to describe you.
// The sealed scorer checks /output/entry.txt is UTF-8 text of 1 to 24
// characters, not only whitespace; only a valid entry goes before the
// judge. The judge compares two words at a time on, most important
// first: (1) exactly one word an ex would actually use about a partner
// they once had, (2) makes the judge laugh out loud, (3) stings with
// recognition, because it is painfully true and the entrant plainly
// knows it, (4) lands instantly, one word that needs no explanation and
// could not be swapped for a near synonym without losing its edge,
// (5) feels relatable, the kind of word people repeat because it names
// something they have lived through too. A word that stings because it
// is true beats a word that only insults; meanness for its own sake
// does not count.
//
// The word below is picked by scoring a shortlist against those five
// criteria, so the choice is argued, not asserted.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Scores = [number, number, number, number, number]; // the five criteria, 0-5 each

// obvious: how likely the word is to be the first anyone reaches for —
// and therefore to match one of the house's 3 fixed anchor texts. RULES.txt
// is explicit: an entry byte-identical to a fixed text plays as that text,
// shares its rate, and never enters the playoff. The most obvious word
// carries the most anchor risk, so on a score tie the less obvious word wins.
const CANDIDATES: Array<{
  word: string;
  scores: Scores;
  obvious: number;
  why: string;
}> = [
  {
    word: "Avoidant",
    scores: [5, 4, 5, 4, 4],
    obvious: 2,
    why: "Therapy-speak turned self-own: the ex who says you never let them in. Modern, self-aware, and it stings because it is a diagnosis, not an insult.",
  },
  {
    word: "Clingy",
    scores: [5, 3, 5, 5, 5],
    obvious: 5,
    why: "The classic ex-word: true, instantly understood, deeply relatable — but the first word anyone reaches for, so the laugh is small.",
  },
  {
    word: "Unbothered",
    scores: [5, 4, 5, 4, 3],
    obvious: 2,
    why: "The ex's accusation that you never cared, worn as a compliment. Funny and stinging, but more of a vibe than a verdict.",
  },
  {
    word: "Forgetful",
    scores: [5, 3, 4, 5, 4],
    obvious: 3,
    why: "Forgot the anniversary, the keys, the plan. Painfully true and relatable, but gentle — it earns a sigh, not a laugh.",
  },
  {
    word: "Distracted",
    scores: [5, 3, 4, 4, 5],
    obvious: 3,
    why: "Always on the phone, never in the room. True of modern life and widely relatable, but it reads as a complaint, not a joke.",
  },
  {
    word: "Needy",
    scores: [5, 2, 5, 5, 4],
    obvious: 4,
    why: "Stings hard and lands instantly, but it is pure insult with no turn — meanness without the laugh.",
  },
  {
    word: "Snorer",
    scores: [5, 4, 2, 5, 3],
    obvious: 2,
    why: "Funny and instant, but it is a physical trait, not a character truth — no sting of recognition.",
  },
  {
    word: "Indecisive",
    scores: [5, 2, 4, 4, 3],
    obvious: 3,
    why: "True about the partner who could never pick a restaurant, but flat: no surprise, no laugh.",
  },
];

// Criterion weights follow the judge's order: single-word fit first, then
// funny, sting, lands instantly, relatable.
const WEIGHTS: Scores = [3, 3, 2, 2, 1];

function score(c: (typeof CANDIDATES)[number]): number {
  return c.scores.reduce((sum, s, i) => sum + s * WEIGHTS[i], 0);
}

function pickWord(): string {
  // Highest score wins; ties break to the LESS obvious word first (an entry
  // byte-identical to a house anchor text never enters the playoff, and the
  // most obvious word is the likeliest anchor), then to the shorter word
  // (the event's own tie-break favours the smaller text), then
  // alphabetically, so the choice is fully deterministic.
  const ranked = [...CANDIDATES].sort(
    (a, b) =>
      score(b) - score(a) ||
      a.obvious - b.obvious ||
      a.word.length - b.word.length ||
      a.word.localeCompare(b.word),
  );
  for (const c of ranked) {
    console.log(`${c.word}: ${score(c)} — ${c.why}`);
  }
  return ranked[0].word;
}

function validate(word: string): void {
  const chars = [...word].length;
  if (chars < 1 || chars > 24) {
    throw new Error(`entry must be 1-24 characters, got ${chars}`);
  }
  if (/\s/.test(word)) {
    throw new Error("entry must be a single word with no spaces");
  }
}

const word = pickWord();
validate(word);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), word, "utf8");
console.log(`wrote ${word.length}-character entry to ${join(outDir, "entry.txt")}`);
