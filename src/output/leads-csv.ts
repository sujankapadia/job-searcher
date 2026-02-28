import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { Parser } from "@json2csv/plainjs";
import type { LeadsResult, CompanyLead } from "../types.js";

interface LeadsCsvRow {
  Company: string;
  "Company Website": string;
  "Company Type": string;
  "Signal Score": number;
  "Signal Reasons": string;
  "Open Roles": number;
  "Matched Queries": string;
  "Role Titles": string;
  "Has Contractor Roles": string;
  "Salary Range": string;
  "Top Apply Link": string;
}

function formatSalaryRange(lead: CompanyLead): string {
  const salaries: number[] = [];
  for (const role of lead.roles) {
    if (role.minSalary) salaries.push(role.minSalary);
    if (role.maxSalary) salaries.push(role.maxSalary);
  }
  if (salaries.length === 0) return "";
  const min = Math.min(...salaries);
  const max = Math.max(...salaries);
  const currency = lead.roles.find((r) => r.salaryCurrency)?.salaryCurrency || "USD";
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
}

function toCsvRow(lead: CompanyLead): LeadsCsvRow {
  const hasContractor = lead.roles.some(
    (r) => r.employmentType === "CONTRACTOR"
  );

  return {
    Company: lead.company,
    "Company Website": lead.companyWebsite || "",
    "Company Type": lead.companyType || "",
    "Signal Score": lead.signalScore,
    "Signal Reasons": lead.signalReasons.join("; "),
    "Open Roles": lead.roles.length,
    "Matched Queries": lead.matchedQueries.join("; "),
    "Role Titles": lead.roles.map((r) => r.title).join("; "),
    "Has Contractor Roles": hasContractor ? "Yes" : "No",
    "Salary Range": formatSalaryRange(lead),
    "Top Apply Link": lead.roles[0]?.applyLink || "",
  };
}

export async function writeLeadsCsv(
  result: LeadsResult,
  outputDir: string
): Promise<string> {
  await mkdir(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `leads-${timestamp}.csv`;
  const filepath = path.join(outputDir, filename);

  const rows = result.leads.map(toCsvRow);
  const parser = new Parser<LeadsCsvRow, LeadsCsvRow>();
  const csv = parser.parse(rows);

  await writeFile(filepath, csv, "utf-8");

  return filepath;
}
