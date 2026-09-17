/**
 * Job title → SOC 2020 occupation code.
 *
 * Deterministic keyword rules, most specific first. Codes and the example
 * titles behind them come from Appendix Skilled Occupations (Tables 1, 1a, 3
 * and 3a). A title that matches no rule returns null and the role is shown as
 * "no code could be assigned", never guessed.
 */

type Rule = { soc: string; re: RegExp };

const R = (soc: string, re: RegExp): Rule => ({ soc, re });

const RULES: Rule[] = [
  /* ---- health, pay-scale occupations (Table 3) ---- */
  R("6131", /\b(?:health\s*care|healthcare|nursing|clinical\s+support|care\s+support)\s+(?:assistant|support\s+worker)s?\b|\bnursing\s+auxiliar/),
  R("6133", /\bdental\s+nurse\b/),
  R("3213", /\bdental\s+(?:hygienist|technician|therapist)\b|\bradiography\s+assistant|\bcardiographer|\bmedical\s+technical\s+officer|\borthopaedic\s+technician/),
  R("2231", /\bmidwi(?:fe|ves|fery)\b/),
  R("2235", /\bmental\s+health\s+(?:nurse|practitioner)\b|\bpsychiatric\s+nurse\b|\bcamhs\s+nurse\b|\brmn\b/),
  R("2236", /\b(?:paediatric|children'?s|neonatal|school)\s+nurse\b/),
  R("2232", /\b(?:district|community|practice)\s+nurse\b|\bhealth\s+visitor\b/),
  R("2234", /\b(?:advanced|senior)?\s*(?:nurse|clinical)\s+practitioner\b|\banp\b|\bacp\b/),
  R("2233", /\b(?:clinical\s+nurse\s+specialist|specialist\s+nurse|nurse\s+specialist|(?:icu|itu|intensive\s+care|critical\s+care|theatre|emergency|a&e|oncology|renal|diabetes|cardiac|research|infection\s+control)\s+nurse)\b|\btheatre\s+manager\b/),
  R("2237", /\b(?:staff|registered|charge|lead|senior|deputy|band\s+\d\s+)?\s*nurse\b|\bward\s+(?:manager|sister)\b|\bmatron\b|\bsister\b|\bnurse\s+(?:educator|manager|consultant)\b|\brgn\b/),
  R("2211", /\b(?:salaried\s+)?(?:gp|general\s+practitioner)\b|\bhouse\s+officer\b|\bfoundation\s+(?:year\s+)?doctor\b|\bfy[12]\b/),
  R("2212", /\bconsultant\s+(?:in\s+|-\s*)?(?:anaesthe|cardio|dermat|emergency|endocrin|gastro|geriat|haemat|histo|intensive|microbi|neph|neuro|obstet|oncol|ophthal|orthop|paediat|pathol|psychiat|radiol|respir|rheumat|surg|urolog|general\s+medicine|acute|stroke|palliative|renal|sexual|elderly|old\s+age|medical|physician|psychiatrist)|\b(?:specialty|speciality|specialist|trust\s+grade|resident|junior|senior|locum|staff|associate\s+specialist)\s+(?:doctor|registrar|physician)\b|\bregistrar\b|\bclinical\s+fellow\b|\bsho\b|\b(?:anaesthetist|surgeon|psychiatrist|radiologist|paediatrician|pathologist|physician|cardiologist|oncologist|neurologist|dermatologist|obstetrician|gynaecologist|ophthalmologist|urologist|haematologist|geriatrician|rheumatologist|histopathologist|microbiologist\s+\(medical\)|st[1-8]|ct[1-3])\b/),
  R("2251", /\bpharmacist\b/),
  R("3212", /\bpharmacy\s+technician\b|\bpharmaceutical\s+technician\b/),
  R("2221", /\bphysiotherap/),
  R("2222", /\boccupational\s+therap/),
  R("2223", /\bspeech\s+(?:and|&)\s+language\s+therap/),
  R("2225", /\bclinical\s+psycholog/),
  R("2226", /\b(?:counselling|forensic|educational|health|occupational)\s+psycholog|\bpsychologist\b/),
  R("2224", /\bpsychotherap|\bcbt\s+therapist|\bcognitive\s+behaviou?ral\s+therap|\bhigh\s+intensity\s+therapist|\bpsychological\s+(?:wellbeing|therapist)/),
  R("2254", /\b(?:radiographer|sonographer|mammographer|nuclear\s+medicine\s+practitioner|medical\s+photographer|vascular\s+technologist)\b/),
  R("2255", /\bparamedic\b|\bemergency\s+care\s+practitioner\b/),
  R("2256", /\bpodiatrist\b|\bchiropodist\b/),
  R("2252", /\boptometrist\b/),
  R("2253", /\bdentist\b|\bdental\s+(?:practitioner|surgeon|officer)\b|\borthodontist\b/),
  R("2259", /\bdietitian\b|\bdietician\b|\borthoptist\b|\baudiologist\b|\bosteopath\b|\bchiropractor\b|\bphysician\s+associate\b|\boperating\s+department\s+practitioner\b|\bodp\b|\bart\s+therapist\b|\bmusic\s+therapist\b|\bdrama\s+therapist\b|\bprosthetist\b|\borthotist\b/),
  R("2461", /\bsocial\s+worker\b/),

  /* ---- science ---- */
  R("2113", /\b(?:biomedical|clinical|healthcare)\s+scientist\b|\bbiochemist\b|\bbiotechnolog|\bclinical\s+(?:embryolog|bioinformatic)|\bgenomic\s+(?:practitioner|scientist)/),
  R("2112", /\b(?:microbiolog|biolog|zoolog|botan|pharmacolog|toxicolog|immunolog|agricultural\s+scientist|ecolog)/),
  R("2111", /\bchemist\b|\bchemical\s+scientist\b|\banalytical\s+scientist\b|\bformulation\s+scientist\b/),
  R("2114", /\bphysicist\b|\bgeolog|\bgeophysic|\bhydrolog|\bmeteorolog|\bmedical\s+physics\b/),
  R("2115", /\bepidemiolog|\bgis\s+analyst\b|\barchaeolog|\banthropolog|\bpolitical\s+scientist|\bbehavioural\s+scientist/),
  R("2152", /\benvironmental\s+(?:consultant|scientist|engineer|advisor|adviser|officer|manager)\b|\bsustainability\s+(?:manager|officer|consultant|lead)\b|\benergy\s+manager\b/),
  R("2161", /\b(?:r&d|research\s+(?:and|&)\s+development)\s+(?:manager|director|lead)\b|\blaboratory\s+manager\b/),
  R("3111", /\b(?:laboratory|lab)\s+(?:technician|assistant|analyst)\b/),

  /* ---- engineering, specific disciplines ---- */
  R("2127", /\b(?:engineering\s+)?project\s+engineer\b|\bengineering\s+(?:project|programme)\s+manager\b/),
  R("2121", /\b(?:civil|structural|geotechnical|highways?|bridge|rail|railway|water|drainage|flood|building\s+services|transport(?:ation)?|infrastructure\s+design|tunnel|pavement|environmental\s+civil|mining)\s+engineer\b/),
  R("2122", /\b(?:mechanical|automotive|marine|hvac|piping|rotating\s+equipment|mechanical\s+design|design|thermal|fluid|powertrain|vehicle|chassis|stress)\s+engineer\b|\bnaval\s+architect\b/),
  R("2123", /\b(?:electrical|power|power\s+systems|high\s+voltage|hv|substation|protection|signalling|e&i|electrical\s+design|electrification|lighting|transmission|distribution)\s+engineer\b/),
  R("2124", /\b(?:electronics?|electronic\s+design|hardware|rf|fpga|asic|pcb|microelectronics|semiconductor|analog|analogue|digital\s+design|control\s+systems?|instrumentation|controls?)\s+engineer\b/),
  R("2125", /\b(?:process|production|manufacturing|industrial|chemical|lean|continuous\s+improvement|nuclear\s+process)\s+engineer\b/),
  R("2126", /\b(?:aerospace|aeronautical|aircraft|avionics|flight|propulsion|space|satellite|spacecraft)\s+engineer\b/),
  R("2481", /\b(?:quality|planning|quality\s+control|quality\s+assurance)\s+engineer\b/),

  /* ---- IT ---- */
  R("2134", /\bsoftware\s+(?:engineer|developer)s?\b/),
  R("1137", /\b(?:chief\s+(?:technology|information|data|digital)\s+officer|cto|cio|cdo)\b|\b(?:it|technology|engineering|data|information\s+security|digital)\s+director\b|\bdirector\s+of\s+(?:engineering|technology|data|it|digital|information\s+security)\b|\bvp\s+(?:of\s+)?engineering\b|\bhead\s+of\s+engineering\b/),
  R("2135", /\b(?:cyber|information|application|cloud|product|network)\s*security\b|\bsecurity\s+(?:engineer|analyst|architect|consultant|researcher|operations|specialist|lead|manager)\b|\bpenetration\s+test|\bpen\s*tester|\bsoc\s+analyst\b|\bthreat\s+(?:intelligence|hunter)|\bdevsecops\b|\bsecops\b|\bappsec\b|\binfosec\b/),
  R("2141", /\b(?:ux|ui|ux\/ui|ui\/ux|product|interaction|service|experience|web)\s+(?:designer|researcher|design\s+lead|design\s+manager)\b|\buser\s+(?:experience|interface)\b|\bdesign\s+(?:lead|manager|director)\b|\bvisual\s+designer\b/),
  R("2136", /\b(?:qa|quality\s+assurance|test|test\s+automation|automation\s+test|software\s+test|software\s+quality)\s+(?:engineer|analyst|lead|manager|specialist)\b|\bsdet\b|\bsoftware\s+tester\b|\btester\b/),
  R("2137", /\bnetwork\s+(?:engineer|architect|specialist|consultant|analyst)\b|\bnetworks?\s+(?:and|&)\s+(?:security|infrastructure)\b|\btelecoms?\s+engineer\b|\bwireless\s+engineer\b/),
  R("2139", /\b(?:devops|sre|site\s+reliability|platform|cloud|infrastructure|systems?|reliability|release|build|integration|automation|observability|it)\s+(?:engineer|architect|consultant|specialist|lead)\b|\bdevops\b|\bcloud\s+(?:architect|consultant)\b|\bit\s+consultant\b|\btechnical\s+consultant\b|\bsolutions?\s+engineer\b|\bimplementation\s+(?:engineer|consultant)\b|\bsystems\s+administrator\b/),
  R("2133", /\b(?:solutions?|systems?|enterprise|technical|data|software|cloud|information|security)\s+architect\b|\bdata\s+engineer\b|\banalytics\s+engineer\b|\b(?:it|business|systems|technical|product|digital)\s+(?:business\s+)?analyst\b|\bbusiness\s+intelligence\s+(?:developer|engineer|analyst)\b|\bbi\s+(?:developer|engineer)\b|\bdata\s+(?:warehouse|platform)\s+(?:engineer|developer)\b|\bcomputer\s+scientist\b|\betl\s+developer\b/),
  R("2433", /\bdata\s+scientist\b|\b(?:machine\s+learning|ml|ai|applied|research)\s+scientist\b|\bstatistician\b|\bactuar|\beconomist\b|\bmathematician\b|\bquantitative\s+(?:analyst|researcher|developer)\b|\bquant\b|\bbiostatistic/),
  R("2134", /\b(?:software|backend|back-end|frontend|front-end|full[\s-]?stack|web|mobile|ios|android|game|games|embedded|firmware|application|applications|java|python|\.net|c\+\+|golang|go|rust|ruby|php|javascript|typescript|react|node|salesforce|sap|dynamics|servicenow|machine\s+learning|ml|ai|computer\s+vision|nlp|blockchain|graphics|systems|kernel|compiler|simulation|robotics\s+software|research)\s+(?:engineer|developer|programmer|scientist\/software\s+engineer|development\s+engineer)s?\b|\bsoftware\s+(?:development|engineering)\b|\b(?:senior|lead|principal|staff|junior|graduate)\s+(?:engineer|developer)\b|\bprogrammer\b|\bdeveloper\b|\bengineer\s+(?:i{1,3}|iv|v)\b|\bcomputer\s+games\s+designer\b|\btechnical\s+lead\b|\btech\s+lead\b/),
  R("2131", /\b(?:it|technical|technology|software|digital|delivery|agile|scrum)\s+(?:project|programme|program|delivery)\s+manager\b|\bdelivery\s+manager\b|\bscrum\s+master\b|\bproject\s+manager\s*[-–(]\s*(?:it|digital|software|technology)/),
  R("2132", /\b(?:engineering|software\s+development|development|it|technology|technical|infrastructure|data|data\s+science|machine\s+learning|analytics|platform|product|it\s+service|service\s+delivery|it\s+operations|systems|network)\s+(?:manager|head)\b|\bhead\s+of\s+(?:it|data|product|platform|software|technology|infrastructure|devops)\b|\bproduct\s+(?:owner|lead)\b|\btechnical\s+product\s+manager\b/),
  R("3544", /\bdata\s+analyst\b|\b(?:reporting|insight|insights|analytics|performance|mi|management\s+information|business\s+intelligence)\s+analyst\b|\banalyst\s*[-–,]\s*data\b/),
  R("3133", /\bdatabase\s+administrator\b|\bdba\b|\bweb\s+content\b/),
  R("3131", /\b(?:network|systems?|it)\s+administrator\b|\bit\s+operations\s+(?:technician|analyst)\b|\bgames?\s+tester\b/),
  R("3132", /\b(?:it|service\s+desk|help\s*desk|desktop|technical|application|1st\s+line|2nd\s+line|first\s+line|second\s+line|end\s+user)\s+support\b|\bit\s+technician\b/),

  /* ---- engineering, general (after IT so "systems engineer" in IT stays IT) ---- */
  R("2129", /\b(?:systems|clinical|medical|biomedical|rehabilitation|nuclear|materials|acoustic|fire|safety|reliability|test|validation|commissioning|r&d|research|robotics|mechatronics|optical|photonics|petroleum|energy|renewables?|wind|solar|offshore|subsea|welding|metallurg\w+|packaging|automation\s+and\s+controls?|integration|verification|engineering)\s+engineer\b|\bengineer\b/),
  R("3113", /\bengineering\s+technician\b|\bmaintenance\s+technician\b|\bmechanical\s+technician\b|\belectrical\s+technician\b/),

  /* ---- built environment ---- */
  R("2451", /\barchitect\b|\blandscape\s+architect/),
  R("2452", /\barchitectural\s+technologist\b|\btown\s+planner\b|\bplanning\s+officer\b|\burban\s+designer\b|\bplanner\s*[-–(]\s*(?:town|urban)/),
  R("2453", /\bquantity\s+surveyor\b|\bcost\s+(?:manager|consultant|engineer)\b|\bcommercial\s+manager\s*[-–(]\s*construction/),
  R("2455", /\b(?:construction|site|contracts?|build)\s+(?:project\s+)?manager\b|\btransport\s+planner\b|\bconstruction\s+manager\b/),
  R("3120", /\b(?:cad|bim|architectural|drawing)\s+technician\b|\bcad\s+(?:designer|operator)\b/),
  R("3114", /\b(?:civil\s+engineering|building|surveying)\s+technician\b/),

  /* ---- finance and business ---- */
  R("1131", /\b(?:chief\s+financial\s+officer|cfo|finance\s+director|financial\s+controller|head\s+of\s+finance|treasurer|finance\s+manager|director\s+of\s+finance)\b/),
  R("2421", /\b(?:chartered|certified|financial|management|fund|forensic|group|senior|assistant|cost|project|tax|systems|technical)\s+accountant\b|\baccountant\b|\bauditor\b|\baudit\s+(?:senior|manager|associate|assistant)\b|\binsolvency\b/),
  R("2422", /\b(?:financial|finance|credit|investment|equity|research|fp&a|treasury|pricing|valuation|portfolio)\s+analyst\b|\bfinancial\s+(?:adviser|advisor|planner)\b|\bmortgage\s+(?:adviser|advisor)\b|\bparaplanner\b|\bwealth\s+manager\b/),
  R("2440", /\b(?:business\s+change|change|transformation|risk|programme|program|pmo|portfolio|business\s+project|project)\s+manager\b|\bclinical\s+trials?\s+(?:coordinator|manager)\b|\bproject\s+lead\b/),
  R("2431", /\bmanagement\s+consultant\b|\bbusiness\s+consultant\b|\bstrategy\s+(?:consultant|analyst|manager)\b|\brisk\s+(?:analyst|consultant|specialist)\b|\bbusiness\s+analyst\b|\bconsultant\b/),
  R("2432", /\b(?:marketing|commercial|brand\s+marketing|digital\s+marketing|growth|product\s+marketing|performance\s+marketing|crm|category)\s+(?:manager|director|lead|head)\b|\bhead\s+of\s+(?:marketing|growth|commercial)\b/),
  R("3556", /\b(?:business\s+development|sales|account|key\s+account|partnerships?|enterprise\s+sales|brand|customer\s+success|revenue|commercial\s+partnerships?)\s+(?:manager|director|executive|lead|head)\b|\bhead\s+of\s+sales\b|\bsales\s+(?:representative|specialist)\b/),
  R("3534", /\b(?:relationship|credit|investment|claims|lending|portfolio)\s+manager\b/),
  R("2493", /\b(?:public\s+relations|pr|press|communications|comms|social\s+media|content)\s+(?:manager|officer|executive|lead|specialist|director)\b|\bpress\s+officer\b/),
  R("2494", /\bcreative\s+director\b|\badvertising\s+account\s+manager\b|\bfundraising\s+manager\b/),
  R("1136", /\b(?:hr|human\s+resources|people|talent|learning\s+and\s+development|l&d|reward|recruitment|talent\s+acquisition|employee\s+relations|diversity)\s+(?:manager|director|head|business\s+partner|lead)\b|\bhead\s+of\s+(?:people|hr|talent)\b|\bchief\s+people\s+officer\b/),
  R("3571", /\b(?:hr|human\s+resources|people|recruitment|talent)\s+(?:adviser|advisor|officer|coordinator|consultant|partner|generalist|specialist|executive)\b|\brecruiter\b|\btalent\s+acquisition\b/),
  R("1134", /\b(?:procurement|purchasing|sourcing|supply\s+chain|category|contracts?|estimating)\s+(?:manager|director|head|lead)\b|\bhead\s+of\s+procurement\b/),
  R("3543", /\b(?:project|programme|pmo)\s+(?:support|coordinator|officer|administrator)\b/),
  R("2434", /\b(?:market|user|social|insight|policy|business)\s+researcher\b|\bresearch\s+(?:analyst|executive|manager)\b|\bintelligence\s+analyst\b/),
  R("2142", /\b(?:graphic|multimedia|motion|digital|brand|3d|visual\s+effects|vfx|creative)\s+designer\b|\banimator\b|\billustrator\b/),

  /* ---- education ---- */
  R("2321", /\bhead\s*teacher\b|\bheadteacher\b|\bprincipal\b|\bhead\s+of\s+school\b|\bhead\s+master\b|\bhead\s+mistress\b/),
  R("2316", /\b(?:sen|send|sen\/d|special\s+(?:educational\s+)?needs|learning\s+support|behaviour\s+support)\s+(?:teacher|coordinator|co-ordinator|lead)\b|\bsenco\b|\bteacher\s*[-–(]\s*(?:sen|send)/),
  R("2315", /\b(?:nursery|early\s+years|eyfs|pre-?school|kindergarten|reception)\s+(?:teacher|class\s+teacher)\b/),
  R("2314", /\b(?:primary|ks1|ks2|key\s+stage\s+[12]|year\s+[1-6]|infant|junior)\s+(?:school\s+)?(?:class\s+)?teacher\b|\bprimary\s+teacher\b/),
  R("2313", /\bteacher\s+of\s+\w+|\b(?:secondary|ks3|ks4|ks5|sixth\s+form|maths|mathematics|science|physics|chemistry|biology|english|history|geography|computing|computer\s+science|mfl|french|spanish|german|music|art|drama|pe|physical\s+education|re|religious\s+education|business|economics|psychology|sociology|design\s+technology|dt|food\s+technology)\s+teacher\b|\bhead\s+of\s+(?:maths|mathematics|science|english|department|year|faculty|physics|chemistry|biology|history|geography|computing|music|art|drama|pe)\b|\bcurriculum\s+lead(?:er)?\b|\bsecondary\s+teacher\b|\bteacher\b/),
  R("2312", /\b(?:fe|further\s+education|college)\s+(?:lecturer|teacher|tutor)\b|\blecturer\s*[-–(]\s*(?:fe|further\s+education|college)/),
  R("2311", /\b(?:lecturer|senior\s+lecturer|associate\s+professor|professor|reader|research\s+fellow|postdoctoral|post-doctoral|postdoc|teaching\s+fellow|research\s+associate|research\s+assistant)\b/),
  R("2322", /\b(?:education|academic|curriculum|school\s+business|learning)\s+(?:manager|director)\b|\bdirector\s+of\s+(?:education|learning)\b|\bschool\s+business\s+manager\b/),
  R("2317", /\b(?:tefl|tesol|esol|efl)\b|\benglish\s+(?:as\s+a\s+)?(?:foreign|second|additional)\s+language\s+teacher\b/),

  /* ---- management ---- */
  R("1171", /\b(?:health\s+services?|healthcare|clinical\s+services?|nhs|hospital|practice|primary\s+care|clinical\s+governance|service|operations|general|divisional|directorate|operational)\s+manager\b|\b(?:service|operations|clinical)\s+(?:director|lead)\b|\bhead\s+of\s+(?:service|operations|nursing|midwifery|clinical)/),
  R("1121", /\b(?:production|manufacturing|plant|factory|operations)\s+(?:manager|director|head)\s*(?:[-–(]\s*manufacturing)?\b/),
  R("1122", /\bconstruction\s+(?:director|operations\s+manager)\b|\bproduction\s+manager\s*[-–(]\s*construction/),
  R("2462", /\bprobation\s+officer\b/),
  R("2471", /\blibrarian\b/),
  R("2472", /\barchivist\b|\bcurator\b|\bconservator\b/),
  R("2491", /\beditor\b/),
  R("2492", /\bjournalist\b|\breporter\b|\bcorrespondent\b/),

  /* ---- legal, tax and general management ---- */
  R("2412", /\b(?:solicitor|lawyer|legal\s+counsel|counsel|attorney|associate\s*[-–(]\s*legal|legal\s+(?:director|adviser|advisor|manager|lead))\b/),
  R("2411", /\bbarrister\b/),
  R("2419", /\b(?:paralegal|legal\s+(?:officer|executive|assistant))\b/),
  R("2423", /\btax\s+(?:manager|adviser|advisor|consultant|specialist|senior\s+manager|director|analyst|associate)\b|\b(?:operational|corporate|indirect|personal)\s+tax\b/),
  R("1139", /\b(?:director|head)\s+of\s+\w+|\b(?:senior\s+|managing\s+|executive\s+|associate\s+)?director\b|\bvice\s+president\b|\bvp\b|\bchief\s+\w+\s+officer\b|\bgeneral\s+manager\b/),

  /* ---- below RQF 6, listed so the reader sees why they fail ---- */
  R("1232", /\b(?:care\s+home|registered|home\s+care|domiciliary|residential)\s+manager\b/),
  R("6135", /\b(?:care|support|home\s+care|domiciliary\s+care)\s+(?:worker|assistant)s?\b|\bcarer\b/),
  R("5434", /\b(?:head|sous|pastry|commis|executive|junior)\s+chef\b|\bchef\b|\bcook\b/),
  R("4122", /\b(?:payroll|accounts|purchase\s+ledger|sales\s+ledger)\s+(?:administrator|clerk|assistant|officer)\b|\bbook-?keeper\b/),
  R("4141", /\boffice\s+manager\b/),
  R("4143", /\bcustomer\s+service\s+manager\b|\bcall\s+centre\s+manager\b/),
];

/** Bracketed band and grade info and other noise that does not help matching. */
function cleanTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\((?:band\s*\d[a-c]?|afc\s*\d|grade\s*\w+|[\d.]+\s*(?:fte|wte)|fixed[\s-]term|permanent|part[\s-]time|full[\s-]time|maternity\s+cover|\d+\s*(?:hours?|hrs)[^)]*|remote|hybrid)\)/g, " ")
    .replace(/\bband\s*[1-9][a-c]?\b/g, " ")
    .replace(/[|/]/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns the SOC 2020 code for a job title, or null when no rule matches. */
export function matchOccupation(title: string): string | null {
  const t = cleanTitle(title);
  if (!t) return null;
  for (const rule of RULES) {
    if (rule.re.test(t)) return rule.soc;
  }
  return null;
}

/** Every code the matcher can return. Used to check the reference table covers them. */
export const MATCHER_CODES: string[] = [...new Set(RULES.map((r) => r.soc))];
