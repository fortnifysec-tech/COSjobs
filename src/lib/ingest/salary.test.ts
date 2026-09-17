import { describe, expect, it } from "vitest";
import { findSalaryInText, parseSalaryField } from "./salary";

describe("parseSalaryField", () => {
  it("reads an NHS annual range", () => {
    expect(parseSalaryField("£58133.00 to £65261.00")).toEqual({ min: 58133, max: 65261, period: "year" });
  });
  it("reads a range with commas and 'per annum'", () => {
    expect(parseSalaryField("£49,387 - £56,515 per annum")).toEqual({ min: 49387, max: 56515, period: "year" });
  });
  it("reads an hourly rate with pence", () => {
    expect(parseSalaryField("£17.50 an hour")).toEqual({ min: 17.5, max: null, period: "hour" });
  });
  it("reads a monthly figure", () => {
    expect(parseSalaryField("£4,200 per month")).toEqual({ min: 4200, max: null, period: "month" });
  });
  it("infers the period from the size when the text does not say", () => {
    expect(parseSalaryField("£35000")).toEqual({ min: 35000, max: null, period: "year" });
    expect(parseSalaryField("£12.21")).toEqual({ min: 12.21, max: null, period: "hour" });
  });
  it("returns nulls when there is no figure", () => {
    expect(parseSalaryField("Depending on experience")).toEqual({ min: null, max: null, period: null });
    expect(parseSalaryField("")).toEqual({ min: null, max: null, period: null });
  });
  it("collapses an equal min and max", () => {
    expect(parseSalaryField("£40,000 to £40,000 a year")).toEqual({ min: 40000, max: null, period: "year" });
  });
});

describe("findSalaryInText", () => {
  it("finds a base salary range on an employer page", () => {
    const t = "What's in it for you: £85,000 - £110,000 base salary + incentive awards. ✅ We can sponsor visas.";
    expect(findSalaryInText(t)).toEqual({ min: 85000, max: 110000, period: "year" });
  });
  it("copes with a stray space in the thousands", () => {
    expect(findSalaryInText("£150,000 - £200, 000 + Equity")).toEqual({ min: 150000, max: 200000, period: "year" });
  });
  it("ignores benefit amounts", () => {
    expect(findSalaryInText("£1,000 a year for books and conferences.")).toEqual({ min: null, max: null, period: null });
  });
  it("accepts a single figure next to the word salary", () => {
    expect(findSalaryInText("Salary: £62,000 per annum plus bonus")).toEqual({ min: 62000, max: null, period: "year" });
  });
});
