const KNOWN_STAFFING_FIRMS = [
  "motion recruitment",
  "robert half",
  "teksystems",
  "insight global",
  "randstad",
  "kforce",
  "hays",
  "adecco",
  "manpower",
  "manpowergroup",
  "kelly services",
  "staffing technologies",
  "apex systems",
  "modis",
  "aerotek",
  "cybercoders",
  "dice",
  "hired",
  "jobot",
  "brooksource",
  "revature",
  "collabera",
  "infosys bpm",
  "genesis10",
  "mastech digital",
  "judge group",
  "eliassen group",
  "signature consultants",
  "beacon hill staffing",
  "mondo",
];

const STAFFING_TYPE_KEYWORDS = [
  "staffing",
  "recruiting",
  "human resources",
  "employment services",
  "employment placement",
];

export function isStaffingFirm(
  company: string,
  companyType: string | null
): boolean {
  const companyLower = company.toLowerCase().trim();

  if (KNOWN_STAFFING_FIRMS.some((firm) => companyLower.includes(firm))) {
    return true;
  }

  if (companyType) {
    const typeLower = companyType.toLowerCase();
    if (STAFFING_TYPE_KEYWORDS.some((kw) => typeLower.includes(kw))) {
      return true;
    }
  }

  return false;
}
