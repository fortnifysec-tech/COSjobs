export type SponsorFixture = {
  rawName: string;
  town: string;
  routes: string[];
  rating: string;
  isActive: boolean;
  /** Days since the licence first appeared on the register. */
  tenureDays: number;
  companiesHouseNumber: string | null;
  websiteDomain: string | null;
  aliases: string[];
};

const SW = "Skilled Worker";
const GBM = "Global Business Mobility: Senior or Specialist Worker";

export const SPONSORS: SponsorFixture[] = [
  { rawName: "OCTOPUS ENERGY LTD", town: "London", routes: [SW, GBM], rating: "A", isActive: true, tenureDays: 2500, companiesHouseNumber: "09263424", websiteDomain: "octopus.energy", aliases: ["Octopus Energy", "Octopus Energy Group"] },
  { rawName: "GUY'S AND ST THOMAS' NHS FOUNDATION TRUST", town: "London", routes: [SW], rating: "A", isActive: true, tenureDays: 5000, companiesHouseNumber: null, websiteDomain: "guysandstthomas.nhs.uk", aliases: ["Guy's and St Thomas'", "GSTT"] },
  { rawName: "ARUP GROUP LIMITED", town: "London", routes: [SW, GBM], rating: "A", isActive: true, tenureDays: 4800, companiesHouseNumber: "01312453", websiteDomain: "arup.com", aliases: ["Arup", "Ove Arup & Partners"] },
  { rawName: "TESCO STORES LIMITED", town: "Welwyn Garden City", routes: [SW], rating: "A", isActive: true, tenureDays: 4600, companiesHouseNumber: "00519500", websiteDomain: "tesco.com", aliases: ["Tesco", "Tesco Technology"] },
  { rawName: "HC-ONE LIMITED", town: "Darlington", routes: [SW], rating: "A", isActive: true, tenureDays: 3200, companiesHouseNumber: "07712656", websiteDomain: "hc-one.co.uk", aliases: ["HC-One"] },
  { rawName: "MONZO BANK LIMITED", town: "London", routes: [SW], rating: "A", isActive: true, tenureDays: 2100, companiesHouseNumber: "09446231", websiteDomain: "monzo.com", aliases: ["Monzo"] },
  { rawName: "ROLLS-ROYCE PLC", town: "Derby", routes: [SW, GBM], rating: "A", isActive: true, tenureDays: 5200, companiesHouseNumber: "01003142", websiteDomain: "rolls-royce.com", aliases: ["Rolls-Royce"] },
  { rawName: "MANCHESTER UNIVERSITY NHS FOUNDATION TRUST", town: "Manchester", routes: [SW], rating: "A", isActive: true, tenureDays: 4900, companiesHouseNumber: null, websiteDomain: "mft.nhs.uk", aliases: ["MFT", "Manchester University NHS FT"] },
  { rawName: "THE UNIVERSITY OF EDINBURGH", town: "Edinburgh", routes: [SW, GBM], rating: "A", isActive: true, tenureDays: 5300, companiesHouseNumber: null, websiteDomain: "ed.ac.uk", aliases: ["University of Edinburgh"] },
  { rawName: "MOTT MACDONALD LIMITED", town: "Croydon", routes: [SW, GBM], rating: "A", isActive: true, tenureDays: 4700, companiesHouseNumber: "01243967", websiteDomain: "mottmac.com", aliases: ["Mott MacDonald"] },
  { rawName: "DELOITTE LLP", town: "London", routes: [SW, GBM], rating: "A", isActive: true, tenureDays: 5100, companiesHouseNumber: "OC303675", websiteDomain: "deloitte.co.uk", aliases: ["Deloitte"] },
  { rawName: "BOOTS UK LIMITED", town: "Nottingham", routes: [SW], rating: "A", isActive: true, tenureDays: 4400, companiesHouseNumber: "00928555", websiteDomain: "boots.com", aliases: ["Boots"] },
  { rawName: "HARRIS FEDERATION", town: "London", routes: [SW], rating: "A", isActive: true, tenureDays: 3900, companiesHouseNumber: "06022229", websiteDomain: "harrisfederation.org.uk", aliases: ["Harris Academy"] },
  { rawName: "OCADO GROUP PLC", town: "Hatfield", routes: [SW, GBM], rating: "A", isActive: true, tenureDays: 3600, companiesHouseNumber: "07098618", websiteDomain: "ocadogroup.com", aliases: ["Ocado", "Ocado Technology"] },
  { rawName: "BABCOCK INTERNATIONAL GROUP PLC", town: "London", routes: [SW], rating: "A", isActive: true, tenureDays: 4500, companiesHouseNumber: "02342138", websiteDomain: "babcockinternational.com", aliases: ["Babcock"] },
  { rawName: "REVOLUT LTD", town: "London", routes: [SW], rating: "A", isActive: true, tenureDays: 1900, companiesHouseNumber: "08804411", websiteDomain: "revolut.com", aliases: ["Revolut"] },
  { rawName: "LEEDS TEACHING HOSPITALS NHS TRUST", town: "Leeds", routes: [SW], rating: "A", isActive: true, tenureDays: 5000, companiesHouseNumber: null, websiteDomain: "leedsth.nhs.uk", aliases: ["Leeds Teaching Hospitals"] },
  { rawName: "AIRBUS OPERATIONS LIMITED", town: "Bristol", routes: [SW, GBM], rating: "A", isActive: true, tenureDays: 4800, companiesHouseNumber: "03465580", websiteDomain: "airbus.com", aliases: ["Airbus", "Airbus UK"] },
  { rawName: "JAGUAR LAND ROVER LIMITED", town: "Coventry", routes: [SW, GBM], rating: "A", isActive: true, tenureDays: 4600, companiesHouseNumber: "01672070", websiteDomain: "jaguarlandrover.com", aliases: ["JLR", "Jaguar Land Rover"] },
  { rawName: "THE UNIVERSITY OF BIRMINGHAM", town: "Birmingham", routes: [SW], rating: "A", isActive: true, tenureDays: 5200, companiesHouseNumber: null, websiteDomain: "birmingham.ac.uk", aliases: ["University of Birmingham"] },
  { rawName: "SKANSKA UK PLC", town: "Watford", routes: [SW], rating: "A", isActive: true, tenureDays: 4300, companiesHouseNumber: "00659226", websiteDomain: "skanska.co.uk", aliases: ["Skanska"] },
  { rawName: "GSK PLC", town: "Brentford", routes: [SW, GBM], rating: "A", isActive: true, tenureDays: 5100, companiesHouseNumber: "03888792", websiteDomain: "gsk.com", aliases: ["GSK", "GlaxoSmithKline"] },
  { rawName: "CAPGEMINI UK PLC", town: "London", routes: [SW, GBM], rating: "A", isActive: true, tenureDays: 4900, companiesHouseNumber: "00943935", websiteDomain: "capgemini.com", aliases: ["Capgemini"] },
  { rawName: "NORTHUMBRIAN WATER LIMITED", town: "Durham", routes: [SW], rating: "A", isActive: true, tenureDays: 3300, companiesHouseNumber: "02366703", websiteDomain: "nwl.co.uk", aliases: ["Northumbrian Water"] },
  { rawName: "BRISTOL CITY COUNCIL", town: "Bristol", routes: [SW], rating: "A", isActive: true, tenureDays: 4100, companiesHouseNumber: null, websiteDomain: "bristol.gov.uk", aliases: ["Bristol Council"] },
  // Newly licensed (NEW band)
  { rawName: "GREENFIELD ROBOTICS LTD", town: "Cambridge", routes: [SW], rating: "A", isActive: true, tenureDays: 90, companiesHouseNumber: "15422187", websiteDomain: "greenfieldrobotics.co.uk", aliases: ["Greenfield Robotics"] },
  { rawName: "NORTHLIGHT DATA LIMITED", town: "Sheffield", routes: [SW], rating: "A", isActive: true, tenureDays: 140, companiesHouseNumber: "15588210", websiteDomain: "northlightdata.com", aliases: ["Northlight Data"] },
  // B-rated (restricted)
  { rawName: "MERIDIAN CARE HOMES LIMITED", town: "Leicester", routes: [SW], rating: "B", isActive: true, tenureDays: 2200, companiesHouseNumber: "08811232", websiteDomain: "meridiancarehomes.co.uk", aliases: ["Meridian Care"] },
  { rawName: "ASHFORD LOGISTICS LTD", town: "Ashford", routes: [SW], rating: "B", isActive: true, tenureDays: 1500, companiesHouseNumber: "10233190", websiteDomain: "ashfordlogistics.co.uk", aliases: ["Ashford Logistics"] },
  // Licence without Skilled Worker route
  { rawName: "HELIOS CONSULTING (UK) LIMITED", town: "Reading", routes: [GBM], rating: "A", isActive: true, tenureDays: 1800, companiesHouseNumber: "09877102", websiteDomain: "heliosconsulting.co.uk", aliases: ["Helios Consulting"] },
  // Removed from register
  { rawName: "BLUESTONE HOSPITALITY LIMITED", town: "Liverpool", routes: [SW], rating: "A", isActive: false, tenureDays: 2600, companiesHouseNumber: "07655431", websiteDomain: "bluestonehospitality.co.uk", aliases: ["Bluestone Hospitality"] },
  // Dormant (no postings)
  { rawName: "PENNINE TIMBER FRAMES LIMITED", town: "Huddersfield", routes: [SW], rating: "A", isActive: true, tenureDays: 3000, companiesHouseNumber: "06120099", websiteDomain: null, aliases: ["Pennine Timber"] },
  { rawName: "SOUTHDOWN VETERINARY GROUP LTD", town: "Brighton", routes: [SW], rating: "A", isActive: true, tenureDays: 2800, companiesHouseNumber: "05880123", websiteDomain: "southdownvets.co.uk", aliases: ["Southdown Vets"] },
  // Low activity
  { rawName: "KESTREL PRECISION ENGINEERING LIMITED", town: "Stoke-on-Trent", routes: [SW], rating: "A", isActive: true, tenureDays: 1200, companiesHouseNumber: "09912344", websiteDomain: "kestrelprecision.co.uk", aliases: ["Kestrel Precision"] },
  { rawName: "ORWELL PHARMACY GROUP LIMITED", town: "Ipswich", routes: [SW], rating: "A", isActive: true, tenureDays: 900, companiesHouseNumber: "11002387", websiteDomain: "orwellpharmacy.co.uk", aliases: ["Orwell Pharmacy"] },
];

/** Employers that post jobs but are not on the register at all. */
export const UNLICENSED_EMPLOYERS = [
  "Fenwick & Marsh Recruitment",
  "Brightpath Digital Agency",
  "Castle Hill Bistro",
  "Riverside Property Services",
];
