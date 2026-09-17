/** Small HTML helpers for advert pages. No DOM, no dependency. */

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  pound: "£",
  ndash: "–",
  mdash: "—",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
};

export function unescapeHtml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === "#") {
      const n = code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

/**
 * HTML → plain text with paragraph breaks. Block elements become blank lines,
 * list items become lines, everything else is joined with spaces.
 */
export function htmlToText(html: string): string {
  const t = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|h[1-6]|li|ul|ol|table|tr|section|article|blockquote|dd|dt)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ");
  return unescapeHtml(t)
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Text between an opening tag with the given id and the next heading of the same or higher level. */
export function sectionById(html: string, id: string): string | null {
  const re = new RegExp(`<(h[1-6]|div|section|p)[^>]*\\bid="${id}"[^>]*>`, "i");
  const m = html.match(re);
  if (!m || m.index === undefined) return null;
  const start = m.index;
  const tag = m[1]!.toLowerCase();
  let end: number;
  if (tag.startsWith("h")) {
    const level = Number(tag[1]);
    const stop = new RegExp(`<h[1-${level}]\\b`, "i");
    const rest = html.slice(start + m[0].length);
    const s = rest.search(stop);
    end = s === -1 ? html.length : start + m[0].length + s;
    return htmlToText(html.slice(start, end));
  }
  // A container: take until its closing tag, allowing nesting of the same tag.
  const open = new RegExp(`<${tag}\\b`, "gi");
  const close = new RegExp(`</${tag}>`, "gi");
  let depth = 0;
  let pos = start;
  const tokens = [...html.slice(start).matchAll(new RegExp(`<${tag}\\b|</${tag}>`, "gi"))];
  for (const tk of tokens) {
    if (open.test(tk[0]) && !close.test(tk[0])) depth++;
    else depth--;
    open.lastIndex = 0;
    close.lastIndex = 0;
    if (depth === 0) {
      pos = start + tk.index! + tk[0].length;
      break;
    }
  }
  return htmlToText(html.slice(start, pos === start ? html.length : pos));
}
