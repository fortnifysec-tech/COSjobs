/**
 * The advert text, structured for reading. Short lines that name a section
 * become headings; the rest are paragraphs. Long adverts fold after the first
 * few paragraphs so the evidence panel stays in view.
 */
const HEADING_WORDS = /^(?:job summary|main duties(?: of the job)?|about us|about the role|about you|the role|the team|responsibilities|job responsibilities|job description|person specification|qualifications|experience|skills|knowledge|essential|desirable|requirements|what you(?:'|’)ll (?:do|need|bring|get)|what we offer|benefits|disclosure and barring service check|certificate of sponsorship|uk registration|additional information|how to apply|salary|location|about [\w\s&'’-]{2,40})$/i;

function isHeading(p: string): boolean {
  if (p.length > 70 || /[.!?:]$/.test(p)) return false;
  if (HEADING_WORDS.test(p)) return true;
  // "Something Something" with no sentence punctuation and every word capitalised.
  const words = p.split(/\s+/);
  return words.length <= 6 && words.every((w) => /^[A-Z0-9&(]/.test(w) || /^(?:and|of|the|for|to|in|a|an)$/.test(w)) && !/,/.test(p);
}

/**
 * The part of the matched sentence that this paragraph contains. The sentence
 * can start in a heading ("Certificate of Sponsorship Applications from ...")
 * and finish here, so the longest suffix of it found in the paragraph is used,
 * as long as it is a meaningful length.
 */
function overlap(paragraph: string, highlight: string): string | null {
  const h = highlight.replace(/\s+/g, " ").trim();
  const p = paragraph.replace(/\s+/g, " ");
  if (p.includes(h)) return h;
  for (let i = 1; i <= h.length - 40; i++) {
    if (/\s/.test(h[i - 1]!) && p.includes(h.slice(i))) return h.slice(i);
  }
  return null;
}

function Mark({ children }: { children: string }) {
  return <mark className="bg-transparent text-ink underline decoration-stamp decoration-2 underline-offset-4">{children}</mark>;
}

export function AdvertBody({ text, highlight, foldAfter = 8 }: { text: string; highlight?: string | null; foldAfter?: number }) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const blocks = paragraphs.map((p, i) => {
    if (isHeading(p) && i < paragraphs.length - 1) {
      return (
        <h3 key={i} className="mt-6 text-[1rem] font-bold text-ink first:mt-0">
          {p}
        </h3>
      );
    }
    const hit = highlight ? overlap(p, highlight) : null;
    if (hit) {
      const at = p.indexOf(hit);
      return (
        <p key={i}>
          {p.slice(0, at)}
          <Mark>{hit}</Mark>
          {p.slice(at + hit.length)}
        </p>
      );
    }
    if (p.startsWith("• ")) {
      return (
        <p key={i} className="pl-4 -indent-4">
          {p}
        </p>
      );
    }
    return <p key={i}>{p}</p>;
  });

  if (blocks.length <= foldAfter + 3) return <div className="prose-body space-y-3">{blocks}</div>;

  // The quoted sentence must stay in sight. When it sits below the fold it is
  // pulled up, with its heading, so the reader sees it before opening the rest.
  const highlightAt = highlight ? paragraphs.findIndex((p) => overlap(p, highlight) !== null) : -1;
  const cut = foldAfter;
  const pulled = highlightAt >= cut ? highlightAt : -1;
  const pulledHeading = pulled > 0 && isHeading(paragraphs[pulled - 1]!) ? paragraphs[pulled - 1] : null;
  return (
    <div className="prose-body space-y-3">
      {blocks.slice(0, cut)}
      {pulled >= 0 ? (
        <div className="border-l-2 border-stamp py-1 pl-4">
          <p className="text-[0.8125rem] text-ink-45">Further down the advert{pulledHeading ? `, under “${pulledHeading}”` : ""}:</p>
          <div className="mt-1">{blocks[pulled]}</div>
        </div>
      ) : null}
      <details className="group pt-1">
        <summary className="cursor-pointer list-none text-[0.9375rem] font-medium text-ink underline underline-offset-4 hover:text-ink-70">
          <span className="group-open:hidden">Read the rest of the advert ({paragraphs.length - cut} more paragraphs)</span>
          <span className="hidden group-open:inline">Show less</span>
        </summary>
        <div className="mt-3 space-y-3">{blocks.slice(cut)}</div>
      </details>
    </div>
  );
}
