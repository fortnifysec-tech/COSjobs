import { describe, expect, it } from "vitest";
import { extractSignals } from "@/lib/eligibility";
import { parseAdvertHtml, parseSearchXml } from "./nhs";

const XML = `<?xml version='1.0' encoding='UTF-8'?><nhsJobs><vacancyDetails><id>5604299</id><reference>C9273-26-0229</reference><title>Data Scientist/Software Engineer (AI and Computer Vision)</title><description>Previous applicants need not apply The NIHR...</description><employer>Moorfields Eye Hospital NHS Foundation Trust</employer><type>Fixed-Term</type><salary>£58133.00 to £65261.00</salary><closeDate>2026-09-23</closeDate><postDate>2026-09-16T15:15:34.938827718</postDate><url>https://beta.jobs.nhs.uk/candidate/jobadvert/C9273-26-0229</url><locations><location>London, EC1V 2PD</location></locations></vacancyDetails><totalPages>23</totalPages><totalResults>223</totalResults></nhsJobs>`;

const HTML = `<html><body><header>Skip to main content</header><main>
<span id="employer_name">Moorfields Eye Hospital NHS Foundation Trust</span>
<h1 id="heading">Data Scientist/Software Engineer</h1>
<h2>Job summary</h2><p>We are looking for a data scientist to join the CRF.</p>
<h2>Main duties of the job</h2><p>Build tools.</p>
<h3 id="tier-two-sponsorship" class="nhsuk-heading-m">Certificate of Sponsorship</h3>
<p>Applications from job seekers who require current Skilled worker sponsorship to work in the UK are welcome and will be considered alongside all other applications. For further information visit the <a href="#">UK Visas and Immigration website</a>.</p>
<h2>Employer details</h2><p>Employer name</p><p>Moorfields</p>
</main><footer>Footer</footer></body></html>`;

describe("nhs search xml", () => {
  it("reads vacancies and paging", () => {
    const { vacancies, totalPages } = parseSearchXml(XML);
    expect(totalPages).toBe(23);
    expect(vacancies).toHaveLength(1);
    expect(vacancies[0]).toMatchObject({ id: "5604299", employer: "Moorfields Eye Hospital NHS Foundation Trust", salary: "£58133.00 to £65261.00", location: "London, EC1V 2PD" });
  });
});

describe("nhs advert page", () => {
  it("keeps the advert body and drops employer contact details", () => {
    const body = parseAdvertHtml(HTML)!;
    expect(body.startsWith("Job summary")).toBe(true);
    expect(body).toContain("Certificate of Sponsorship");
    expect(body).not.toContain("Employer details");
  });

  it("yields a positive sponsorship signal from the Certificate of Sponsorship section", () => {
    const body = parseAdvertHtml(HTML)!;
    const s = extractSignals(body);
    expect(s.negativeMatch).toBeNull();
    expect(s.positiveSnippet).toMatch(/require current Skilled worker sponsorship to work in the UK are welcome/);
  });
});
