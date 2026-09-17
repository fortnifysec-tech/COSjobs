/**
 * The sponsored work routes that appear on the register of licensed sponsors,
 * in plain words. Only routes that need an employer's sponsorship are listed.
 * Figures are not given here: the route pages show live counts from the register.
 */
export type RouteInfo = {
  name: string;
  /** One sentence: who it is for. */
  summary: string;
  /** What the reader should know before they chase a role on this route. */
  notes: string[];
  govuk: string;
  /** True for the route this site checks in full. */
  checked?: boolean;
};

export const ROUTE_INFO: RouteInfo[] = [
  {
    name: "Skilled Worker",
    summary: "The main route for a job offer from a licensed employer in an eligible occupation, paid at or above the threshold.",
    notes: [
      "The role must be in an occupation code at RQF level 6 or above, or on the Temporary Shortage List or Immigration Salary List.",
      "The salary must meet the higher of the general threshold and the going rate for the code. Every role on this site is checked against both.",
      "It leads to settlement. Time on the route counts towards indefinite leave to remain.",
    ],
    govuk: "https://www.gov.uk/skilled-worker-visa",
    checked: true,
  },
  {
    name: "Global Business Mobility: Senior or Specialist Worker",
    summary: "For established employees of an overseas business transferring to a linked UK branch. You cannot apply from the open jobs market.",
    notes: [
      "You must already work for the overseas company, usually for at least 12 months, unless you are a high earner.",
      "It does not lead to settlement on its own. Many people switch to Skilled Worker later.",
      "A licence for this route alone does not let an employer sponsor a new hire from outside the group.",
    ],
    govuk: "https://www.gov.uk/senior-specialist-worker-visa",
  },
  {
    name: "Global Business Mobility: Graduate Trainee",
    summary: "For graduates on a structured training programme with an overseas employer, placed in the UK branch for a fixed period.",
    notes: ["You must already be on the employer's graduate scheme abroad.", "It does not lead to settlement."],
    govuk: "https://www.gov.uk/graduate-trainee-visa",
  },
  {
    name: "Global Business Mobility: UK Expansion Worker",
    summary: "For senior staff sent to set up a new UK branch of an overseas business that does not trade here yet.",
    notes: ["The sponsor licence is provisional until the UK branch is up and running.", "Not a route for job seekers; the employer chooses who to send."],
    govuk: "https://www.gov.uk/uk-expansion-worker-visa",
  },
  {
    name: "Global Business Mobility: Service Supplier",
    summary: "For contractual service suppliers and self-employed professionals delivering a contract covered by a UK trade agreement.",
    notes: ["Tied to a specific contract between a UK sponsor and an overseas supplier."],
    govuk: "https://www.gov.uk/service-supplier-visa",
  },
  {
    name: "Global Business Mobility: Secondment Worker",
    summary: "For staff seconded to the UK as part of a high-value contract or investment by their overseas employer.",
    notes: ["The contract must be registered with the Home Office and worth at least the published minimum."],
    govuk: "https://www.gov.uk/secondment-worker-visa",
  },
  {
    name: "Scale-up Worker",
    summary: "For a job offer from a fast-growing UK business with scale-up sponsor status. Sponsorship is only needed for the first six months.",
    notes: ["After six months you can change employer without a new sponsor.", "The role must still be at graduate level and paid at the route's threshold."],
    govuk: "https://www.gov.uk/scale-up-worker-visa",
  },
  {
    name: "Creative Worker",
    summary: "A temporary route for performers, artists and film, television and theatre crew engaged by a UK sponsor.",
    notes: ["Stays are for up to 12 months at a time, extendable to 24.", "It does not lead to settlement."],
    govuk: "https://www.gov.uk/creative-worker-visa",
  },
  {
    name: "Charity Worker",
    summary: "A temporary route for unpaid voluntary work with a registered charity that holds a sponsor licence.",
    notes: ["The work must be unpaid, apart from expenses.", "Maximum stay is 12 months."],
    govuk: "https://www.gov.uk/charity-worker-visa",
  },
  {
    name: "Religious Worker",
    summary: "A temporary route for work such as preaching, pastoral duties or work in a religious order, for up to 24 months.",
    notes: ["Different from the Minister of Religion route, which is for leading a congregation and can lead to settlement."],
    govuk: "https://www.gov.uk/religious-worker-visa",
  },
  {
    name: "Tier 2 Ministers of Religion",
    summary: "For a leading role in a faith community, such as a minister, missionary or member of a religious order.",
    notes: ["Still labelled Tier 2 on the register. Leads to settlement."],
    govuk: "https://www.gov.uk/minister-of-religion-visa",
  },
  {
    name: "International Sportsperson",
    summary: "For elite sportspeople and coaches endorsed by their sport's governing body.",
    notes: ["The governing body endorsement comes before the sponsor's certificate."],
    govuk: "https://www.gov.uk/international-sportsperson-visa",
  },
  {
    name: "Government Authorised Exchange",
    summary: "A temporary route for approved exchange schemes: work experience, training, research and fellowships.",
    notes: ["The sponsor is usually the scheme operator, not the host organisation.", "Maximum stay is 12 or 24 months depending on the scheme."],
    govuk: "https://www.gov.uk/government-authorised-exchange",
  },
  {
    name: "International Agreement",
    summary: "For work covered by international law, such as private servants in diplomatic households or employees of overseas governments.",
    notes: ["Narrow and specific. Not a general work route."],
    govuk: "https://www.gov.uk/international-agreement-visa",
  },
  {
    name: "Seasonal Worker",
    summary: "For short seasonal work in horticulture and poultry, arranged through a licensed scheme operator.",
    notes: ["Up to six months in any 12-month period.", "You apply through an operator, not an individual farm."],
    govuk: "https://www.gov.uk/seasonal-worker-visa",
  },
];

export function routeInfo(name: string): RouteInfo | undefined {
  return ROUTE_INFO.find((r) => r.name === name);
}
