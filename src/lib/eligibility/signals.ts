/**
 * Advert text classification. Deterministic pattern matching.
 * An LLM may propose candidates later; these patterns are the rule of record.
 */

const NEGATIVE_PATTERNS: RegExp[] = [
  /\b(?:no|not|cannot|can't|unable to|do(?:es)? not|won't|will not)\s+(?:offer|provide|support|sponsor|be able to (?:offer|provide|sponsor))\b[^.]{0,60}?\b(?:visa sponsorship|sponsorship|visa|work permit)/i,
  /\b(?:sponsorship|visa sponsorship)\s+(?:is\s+)?(?:not|un)available\b/i,
  /\bwithout\s+(?:the\s+need\s+for\s+)?(?:visa\s+)?sponsorship\b/i,
  /\bmust\s+(?:already\s+)?have\s+(?:the\s+)?(?:right|permission)\s+to\s+work\s+in\s+the\s+uk\b/i,
  /\bright\s+to\s+work\s+in\s+the\s+uk\s+(?:is\s+)?(?:required|essential|mandatory)\b/i,
  /\bno\s+(?:visa\s+)?sponsorship\b/i,
  /\bnot\s+(?:in\s+a\s+position|able)\s+to\s+(?:offer|provide)\s+sponsorship\b/i,
];

const POSITIVE_PATTERNS: RegExp[] = [
  /[^.]*\b(?:visa\s+)?sponsorship\s+(?:is|will be|can be|may be)\s+(?:available|offered|provided|considered)\b[^.]*\./i,
  /[^.]*\bwe\s+(?:can|will|are\s+(?:able|happy)\s+to)\s+(?:offer|provide|consider)\s+(?:skilled\s+worker\s+|tier\s*2\s+)?(?:visa\s+)?sponsorship\b[^.]*\./i,
  /[^.]*\b(?:skilled\s+worker|tier\s*2)\s+(?:visa\s+)?sponsorship\s+(?:is\s+)?(?:available|offered)\b[^.]*\./i,
  /[^.]*\bsponsorship\s+available\b[^.]*\./i,
  /[^.]*\blicensed\s+sponsor\b[^.]*\bsponsor(?:ship)?\b[^.]*\./i,
];

export type SignalResult = {
  positiveSnippet: string | null;
  negativeMatch: string | null;
};

export function extractSignals(text: string): SignalResult {
  const cleaned = text.replace(/\s+/g, " ").trim();
  let negativeMatch: string | null = null;
  for (const re of NEGATIVE_PATTERNS) {
    const m = cleaned.match(re);
    if (m) {
      negativeMatch = m[0].trim();
      break;
    }
  }
  let positiveSnippet: string | null = null;
  for (const re of POSITIVE_PATTERNS) {
    const m = cleaned.match(re);
    if (m) {
      positiveSnippet = m[0].trim();
      break;
    }
  }
  return { positiveSnippet, negativeMatch };
}
