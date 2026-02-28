import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { Parser } from "@json2csv/plainjs";
import type { SearchResult, JobListing } from "../types.js";

function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9-_]/g, "_").toLowerCase();
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

function formatSalary(listing: JobListing): string {
  if (!listing.minSalary && !listing.maxSalary) return "";
  const currency = listing.salaryCurrency || "USD";
  const period = listing.salaryPeriod || "";
  const min = listing.minSalary ? `${currency} ${listing.minSalary.toLocaleString()}` : "?";
  const max = listing.maxSalary ? `${currency} ${listing.maxSalary.toLocaleString()}` : "?";
  return `${min} - ${max}${period ? ` (${period})` : ""}`;
}

interface CsvRow {
  Company: string;
  "Company Website": string;
  Title: string;
  Location: string;
  Remote: string;
  "Employment Type": string;
  "Salary Range": string;
  "Apply Link": string;
  "Posted Date": string;
  Source: string;
  "Required Skills": string;
  Benefits: string;
  Description: string;
}

function toCsvRow(listing: JobListing): CsvRow {
  return {
    Company: listing.company,
    "Company Website": listing.companyWebsite || "",
    Title: listing.title,
    Location: listing.location,
    Remote: listing.isRemote ? "Yes" : "No",
    "Employment Type": listing.employmentType,
    "Salary Range": formatSalary(listing),
    "Apply Link": listing.applyLink,
    "Posted Date": listing.postedAt ? listing.postedAt.split("T")[0] : "",
    Source: listing.source,
    "Required Skills": (listing.requiredSkills || []).join("; "),
    Benefits: (listing.benefits || []).join("; "),
    Description: truncate(listing.description, 500),
  };
}

export async function writeCsv(
  result: SearchResult,
  outputDir: string
): Promise<string> {
  await mkdir(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const querySlug = sanitizeFilename(result.query);
  const filename = `${querySlug}-${timestamp}.csv`;
  const filepath = path.join(outputDir, filename);

  const rows = result.listings.map(toCsvRow);
  const parser = new Parser<CsvRow, CsvRow>();
  const csv = parser.parse(rows);

  await writeFile(filepath, csv, "utf-8");

  return filepath;
}
