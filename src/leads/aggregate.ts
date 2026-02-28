import type {
  SearchResult,
  JobListing,
  CompanyLead,
  LeadRole,
} from "../types.js";
import { isStaffingFirm } from "./filter.js";

interface TaggedListing extends JobListing {
  sourceQuery: string;
}

function toLeadRole(listing: TaggedListing): LeadRole {
  return {
    jobId: listing.jobId,
    title: listing.title,
    employmentType: listing.employmentType,
    location: listing.location,
    isRemote: listing.isRemote,
    applyLink: listing.applyLink,
    postedAt: listing.postedAt,
    minSalary: listing.minSalary,
    maxSalary: listing.maxSalary,
    salaryCurrency: listing.salaryCurrency,
    salaryPeriod: listing.salaryPeriod,
    sourceQuery: listing.sourceQuery,
  };
}

function scoreCompany(
  matchedQueries: string[],
  roles: LeadRole[]
): { signalScore: number; signalReasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // +1 per open role
  score += roles.length;
  reasons.push(`${roles.length} open role(s)`);

  // +N if matched multiple different queries
  if (matchedQueries.length > 1) {
    score += matchedQueries.length;
    reasons.push(`Matched ${matchedQueries.length} search queries`);
  }

  // +2 per contractor role
  const contractorCount = roles.filter(
    (r) => r.employmentType === "CONTRACTOR"
  ).length;
  if (contractorCount > 0) {
    score += contractorCount * 2;
    reasons.push(
      `${contractorCount} contractor role(s) — signals openness to external help`
    );
  }

  // +1 if any role has salary info
  const hasSalary = roles.some((r) => r.minSalary || r.maxSalary);
  if (hasSalary) {
    score += 1;
    reasons.push("Salary info available");
  }

  return { signalScore: score, signalReasons: reasons };
}

export function aggregateLeads(
  results: SearchResult[]
): CompanyLead[] {
  // 1. Flatten and tag each listing with its source query
  const tagged: TaggedListing[] = [];
  for (const result of results) {
    for (const listing of result.listings) {
      tagged.push({ ...listing, sourceQuery: result.query });
    }
  }

  // 2. Filter out staffing firms
  const filtered = tagged.filter(
    (l) => !isStaffingFirm(l.company, l.companyType)
  );

  // 3. Deduplicate by jobId, tracking all matching queries
  const byJobId = new Map<string, TaggedListing & { queries: Set<string> }>();
  for (const listing of filtered) {
    const existing = byJobId.get(listing.jobId);
    if (existing) {
      existing.queries.add(listing.sourceQuery);
    } else {
      byJobId.set(listing.jobId, {
        ...listing,
        queries: new Set([listing.sourceQuery]),
      });
    }
  }

  // 4. Group by company (case-insensitive)
  const companyGroups = new Map<
    string,
    {
      company: string;
      companyWebsite: string | null;
      companyType: string | null;
      matchedQueries: Set<string>;
      roles: LeadRole[];
    }
  >();

  for (const entry of byJobId.values()) {
    const key = entry.company.toLowerCase().trim();
    let group = companyGroups.get(key);
    if (!group) {
      group = {
        company: entry.company,
        companyWebsite: entry.companyWebsite,
        companyType: entry.companyType,
        matchedQueries: new Set(),
        roles: [],
      };
      companyGroups.set(key, group);
    }

    for (const q of entry.queries) {
      group.matchedQueries.add(q);
    }
    group.roles.push(toLeadRole({ ...entry, sourceQuery: [...entry.queries].join(", ") }));

    // Keep the most informative website/type
    if (!group.companyWebsite && entry.companyWebsite) {
      group.companyWebsite = entry.companyWebsite;
    }
    if (!group.companyType && entry.companyType) {
      group.companyType = entry.companyType;
    }
  }

  // 5. Build CompanyLead objects with scoring
  const leads: CompanyLead[] = [];
  for (const group of companyGroups.values()) {
    const matchedQueries = [...group.matchedQueries];
    const { signalScore, signalReasons } = scoreCompany(
      matchedQueries,
      group.roles
    );

    leads.push({
      company: group.company,
      companyWebsite: group.companyWebsite,
      companyType: group.companyType,
      matchedQueries,
      roles: group.roles,
      signalScore,
      signalReasons,
    });
  }

  // 6. Sort by signalScore descending
  leads.sort((a, b) => b.signalScore - a.signalScore);

  return leads;
}
