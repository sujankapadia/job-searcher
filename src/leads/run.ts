import { searchJobs } from "../search/jsearch.js";
import { aggregateLeads } from "./aggregate.js";
import { writeLeadsJson } from "../output/leads-json.js";
import { writeLeadsCsv } from "../output/leads-csv.js";
import type { LeadsParams, LeadsResult, SearchResult } from "../types.js";

export async function runLeads(params: LeadsParams): Promise<void> {
  const { queries, location, radius, datePosted, employmentTypes, remoteOnly, format, outputDir } = params;

  if (queries.length > 10) {
    console.warn(
      `Warning: ${queries.length} queries will use ${queries.length} API requests. Free tier = 200/month.`
    );
  }

  const results: SearchResult[] = [];

  for (const query of queries) {
    console.log(`Searching for "${query}" in ${location}...`);

    const result = await searchJobs({
      query,
      location,
      radius,
      datePosted,
      employmentTypes,
      remoteOnly,
      numPages: 1,
    });

    console.log(`  Found ${result.totalResults} listing(s).`);
    results.push(result);
  }

  const leads = aggregateLeads(results);
  const totalRoles = leads.reduce((sum, l) => sum + l.roles.length, 0);

  const leadsResult: LeadsResult = {
    queries,
    location,
    searchedAt: new Date().toISOString(),
    totalLeads: leads.length,
    totalRoles,
    apiRequestsUsed: queries.length,
    leads,
  };

  // Print summary
  console.log(`\n--- Leads Summary ---`);
  console.log(`Companies: ${leads.length} | Roles: ${totalRoles} | API requests used: ${queries.length}`);

  if (leads.length > 0) {
    console.log(`\nTop leads:`);
    const top = leads.slice(0, 5);
    for (const lead of top) {
      const queries = lead.matchedQueries.join(", ");
      console.log(
        `  ${lead.company} — score: ${lead.signalScore}, ${lead.roles.length} role(s), queries: [${queries}]`
      );
    }
  }

  // Write output files
  if (format === "json" || format === "both") {
    const jsonPath = await writeLeadsJson(leadsResult, outputDir);
    console.log(`\nJSON saved: ${jsonPath}`);
  }

  if (format === "csv" || format === "both") {
    const csvPath = await writeLeadsCsv(leadsResult, outputDir);
    console.log(`CSV saved:  ${csvPath}`);
  }
}
