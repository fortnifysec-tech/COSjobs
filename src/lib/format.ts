import type { SalaryPeriod } from "@/lib/eligibility/types";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const gbpPence = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 });

export function money(n: number) {
  return Number.isInteger(n) ? gbp.format(n) : gbpPence.format(n);
}

const PERIOD_LABEL: Record<SalaryPeriod, string> = {
  hour: "an hour",
  day: "a day",
  week: "a week",
  month: "a month",
  year: "",
};

export function salaryLabel(min: number | null, max: number | null, period: SalaryPeriod | null): string {
  if (min === null && max === null) return "Not stated";
  const suffix = period && period !== "year" ? ` ${PERIOD_LABEL[period]}` : "";
  if (min !== null && max !== null && max !== min) return `${money(min)}–${money(max)}${suffix}`;
  if (min !== null) return `${money(min)}${suffix}`;
  return `Up to ${money(max!)}${suffix}`;
}

export function timeAgo(date: Date, now = new Date()): string {
  const s = Math.max(0, (now.getTime() - date.getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export function isoDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function longDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
}

export function daysToYears(days: number): string {
  if (days < 365) return `${Math.floor(days / 30)} months`;
  const y = Math.floor(days / 365);
  return `${y} ${y === 1 ? "year" : "years"}`;
}

/** "10 Sep 2026, 06:00" in UK time. */
export function shortDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  });
}

/** "10 Sep 2026" in UK time. */
export function shortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString("en-GB")} ${n === 1 ? one : many}`;
}

export function num(n: number): string {
  return n.toLocaleString("en-GB");
}

/** Register names are upper case. Show them as a person would write them. */
export function titleCase(name: string): string {
  const keep = new Set(["NHS", "UK", "LLP", "PLC", "GSK", "IT", "GB"]);
  return name
    .split(" ")
    .map((w) => {
      if (keep.has(w)) return w;
      if (w === "HC-ONE") return "HC-One";
      if (/^\(.*\)$/.test(w)) return `(${titleCase(w.slice(1, -1))})`;
      return w.toLowerCase().replace(/(^|[-'’])([a-z])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
    })
    .join(" ")
    .replace(/\bAnd\b/g, "and")
    .replace(/\bOf\b/g, "of")
    .replace(/(.)\bThe\b/g, "$1the");
}

export function describeChange(c: { eventType: string; oldValue: string | null; newValue: string | null }): string {
  switch (c.eventType) {
    case "ADDED":
      return `Added to the register, rated ${c.newValue ?? "A"}.`;
    case "REMOVED":
      return "Removed from the register.";
    case "RATING_CHANGED":
      return `Rating changed from ${c.oldValue} to ${c.newValue}.${c.newValue === "B" ? " Cannot assign new certificates until it is back to A." : ""}`;
    case "ROUTE_ADDED":
      return `Route added: ${c.newValue}.`;
    case "ROUTE_REMOVED":
      return `Route removed: ${c.oldValue}.`;
    case "NAME_CHANGED":
      return `Name changed from ${c.oldValue} to ${c.newValue}.`;
    case "TOWN_CHANGED":
      return `Town changed from ${c.oldValue} to ${c.newValue}.`;
    default:
      return c.eventType;
  }
}
