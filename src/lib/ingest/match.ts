import { and, inArray, like, sql } from "drizzle-orm";
import { schema, type Db } from "@/db/client";
import type { SponsorRecord } from "@/lib/eligibility/types";
import { nameVariants } from "@/lib/names";

const { sponsors, sponsorAliases } = schema;
const SW = "Skilled Worker";

export type MatchedSponsor = SponsorRecord & { rawName: string };

/** Words that say what kind of health body a name is, not which one. */
const HEALTH_TYPE_WORDS = new Set(["NHS", "FOUNDATION", "TRUST", "FT", "THE", "HOSPITAL", "HOSPITALS", "UNIVERSITY", "TEACHING", "AND", "LOCAL", "HEALTH", "BOARD", "ICB", "CCG", "INTEGRATED", "CARE", "PARTNERSHIP", "COMMUNITY", "SERVICES", "SERVICE", "GROUP", "OF", "NATIONAL"]);
const HEALTH_BODY = /\b(NHS|TRUST|HEALTH|ICB|CCG|BOARD|HOSPITAL|HOSPITALS|CARE)\b/;

/**
 * Significant tokens of an NHS-style name: "Norfolk & Suffolk Foundation NHS
 * Trust" gives ["NORFOLK", "SUFFOLK"]. Null when the name is not a health body
 * or has nothing distinctive left. Exported for tests.
 */
function expandHealthAbbreviations(n: string): string {
  return n
    .replace(/\bNHSFT\b/g, "NHS FOUNDATION TRUST")
    .replace(/\bFT\b/g, "FOUNDATION TRUST")
    .replace(/\bICB\b/g, "INTEGRATED CARE BOARD")
    .replace(/\bCCG\b/g, "CLINICAL COMMISSIONING GROUP");
}

export function healthBodyTokens(raw: string): string[] | null {
  const n = expandHealthAbbreviations(nameVariants(raw)[0] ?? "");
  if (!HEALTH_BODY.test(n)) return null;
  const tokens = n.split(" ").filter((t) => t.length >= 3 && !HEALTH_TYPE_WORDS.has(t));
  if (tokens.length === 0 || tokens.length > 4) return null;
  return tokens;
}

/**
 * Find the register entry for an employer name. Tries the normalised name and
 * its variants against the register, then against known aliases. When several
 * entries match, an active A-rated Skilled Worker licence wins.
 */
export async function matchSponsor(d: Db, names: string[], cache: Map<string, MatchedSponsor | null>): Promise<MatchedSponsor | null> {
  const key = names.join("|");
  if (cache.has(key)) return cache.get(key)!;

  const variants = [...new Set(names.flatMap((n) => nameVariants(n)))];
  const rows = await d
    .select({ id: sponsors.id, rawName: sponsors.rawName, routes: sponsors.routes, rating: sponsors.rating, isActive: sponsors.isActive, normalisedName: sponsors.normalisedName })
    .from(sponsors)
    .where(inArray(sponsors.normalisedName, variants))
    .limit(50);

  let candidates = rows;
  if (candidates.length === 0) {
    const aliasRows = await d
      .select({ sponsorId: sponsorAliases.sponsorId })
      .from(sponsorAliases)
      .where(inArray(sql`upper(${sponsorAliases.alias})`, variants))
      .limit(20);
    if (aliasRows.length) {
      candidates = await d
        .select({ id: sponsors.id, rawName: sponsors.rawName, routes: sponsors.routes, rating: sponsors.rating, isActive: sponsors.isActive, normalisedName: sponsors.normalisedName })
        .from(sponsors)
        .where(inArray(sponsors.id, aliasRows.map((a) => a.sponsorId)));
    }
  }

  // NHS bodies: the register spells them many ways. Find entries carrying every
  // distinctive word of the name, and prefer the one that is also an NHS body
  // of the same kind (foundation trust, trust, board).
  let fuzzyPenalty = new Map<string, number>();
  if (candidates.length === 0) {
    for (const name of names) {
      const tokens = healthBodyTokens(name);
      if (!tokens) continue;
      const found = await d
        .select({ id: sponsors.id, rawName: sponsors.rawName, routes: sponsors.routes, rating: sponsors.rating, isActive: sponsors.isActive, normalisedName: sponsors.normalisedName })
        .from(sponsors)
        .where(and(...tokens.map((t) => like(sponsors.normalisedName, `%${t}%`))))
        .limit(20);
      if (found.length === 0) continue;
      const wanted = new Set(expandHealthAbbreviations(nameVariants(name)[0] ?? "").split(" ").filter((t) => HEALTH_TYPE_WORDS.has(t) && t !== "THE" && t !== "AND" && t !== "OF"));
      // A candidate must be the same kind of body: share at least one type word.
      const kindred = found.filter((f) => f.normalisedName.split(" ").some((t) => wanted.has(t)));
      if (kindred.length === 0) continue;
      fuzzyPenalty = new Map(
        kindred.map((f) => {
          const have = new Set(f.normalisedName.split(" "));
          const nhs = have.has("NHS") || have.has("NATIONAL") ? 0 : 20;
          const typeMiss = [...wanted].filter((w) => !have.has(w)).length;
          const extra = f.normalisedName.split(" ").filter((t) => !tokens.includes(t) && !HEALTH_TYPE_WORDS.has(t)).length;
          return [f.id, 100 + nhs + typeMiss * 3 + extra * 2];
        }),
      );
      candidates = kindred;
      break;
    }
  }

  // Prefer the earliest variant (closest to the given name), then licence quality.
  const rank = (r: (typeof rows)[number]) => {
    const v = variants.indexOf(r.normalisedName);
    const base = fuzzyPenalty.get(r.id) ?? (v === -1 ? 99 : v) * 8;
    return base + (r.isActive ? 0 : 4) + (r.rating === "A" ? 0 : 2) + (r.routes.includes(SW) ? 0 : 1);
  };
  const best = [...candidates].sort((a, b) => rank(a) - rank(b))[0];
  const result: MatchedSponsor | null = best
    ? { id: best.id, name: best.rawName, rawName: best.rawName, routes: best.routes, rating: best.rating, isActive: best.isActive }
    : null;
  cache.set(key, result);
  return result;
}
