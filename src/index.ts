import { Command } from "commander";
import { config, validateConfig } from "./config.js";
import { searchJobs } from "./search/jsearch.js";
import { writeJson } from "./output/json.js";
import { writeCsv } from "./output/csv.js";
import { runLeads } from "./leads/run.js";
import type { SearchParams, LeadsParams } from "./types.js";

const program = new Command();

program
  .name("job-searcher")
  .description("Search for job openings to find consulting/staffing leads")
  .version("1.0.0");

program
  .command("search")
  .description("Search for job listings by title and location")
  .argument("<query>", "Job title to search for (e.g. 'Java Developer')")
  .option("-l, --location <location>", "Location to search", config.defaults.location)
  .option("-r, --radius <km>", "Search radius in kilometers", String(config.defaults.radius))
  .option("-d, --days <period>", "Date posted filter: today, 3days, week, month", config.defaults.datePosted)
  .option("-t, --type <types>", "Employment types, comma-separated: fulltime, contractor, parttime, intern")
  .option("--remote", "Remote jobs only", false)
  .option("-p, --pages <count>", "Number of pages to fetch (10 results per page)", String(config.defaults.numPages))
  .option("-f, --format <format>", "Output format: json, csv, both", "both")
  .option("-o, --output <dir>", "Output directory", "./output")
  .action(async (query: string, opts) => {
    validateConfig();

    const employmentTypeMap: Record<string, string> = {
      fulltime: "FULLTIME",
      contractor: "CONTRACTOR",
      parttime: "PARTTIME",
      intern: "INTERN",
    };

    const employmentTypes = opts.type
      ? opts.type.split(",").map((t: string) => employmentTypeMap[t.trim().toLowerCase()] || t.trim().toUpperCase())
      : undefined;

    const params: SearchParams = {
      query,
      location: opts.location,
      radius: parseInt(opts.radius, 10),
      datePosted: opts.days,
      employmentTypes,
      remoteOnly: opts.remote,
      numPages: parseInt(opts.pages, 10),
    };

    console.log(`Searching for "${query}" in ${params.location}...`);

    try {
      const result = await searchJobs(params);

      console.log(`Found ${result.totalResults} job listing(s).`);

      if (result.totalResults === 0) {
        console.log("No results found. Try broadening your search.");
        return;
      }

      const format = opts.format.toLowerCase();
      const outputDir = opts.output;

      if (format === "json" || format === "both") {
        const jsonPath = await writeJson(result, outputDir);
        console.log(`JSON saved: ${jsonPath}`);
      }

      if (format === "csv" || format === "both") {
        const csvPath = await writeCsv(result, outputDir);
        console.log(`CSV saved:  ${csvPath}`);
      }
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  });

program
  .command("leads")
  .description("Batch search multiple job titles and generate company-centric leads")
  .argument("<queries>", "Comma-separated job titles (e.g. 'Java Developer,React Developer,DevOps')")
  .option("-l, --location <location>", "Location to search", config.defaults.location)
  .option("-r, --radius <km>", "Search radius in kilometers", String(config.defaults.radius))
  .option("-d, --days <period>", "Date posted filter: today, 3days, week, month", config.defaults.datePosted)
  .option("-t, --type <types>", "Employment types, comma-separated: fulltime, contractor, parttime, intern")
  .option("--remote", "Remote jobs only", false)
  .option("-f, --format <format>", "Output format: json, csv, both", "both")
  .option("-o, --output <dir>", "Output directory", "./output")
  .action(async (queriesArg: string, opts) => {
    validateConfig();

    const employmentTypeMap: Record<string, string> = {
      fulltime: "FULLTIME",
      contractor: "CONTRACTOR",
      parttime: "PARTTIME",
      intern: "INTERN",
    };

    const employmentTypes = opts.type
      ? opts.type.split(",").map((t: string) => employmentTypeMap[t.trim().toLowerCase()] || t.trim().toUpperCase())
      : undefined;

    const queries = queriesArg.split(",").map((q: string) => q.trim()).filter(Boolean);

    if (queries.length === 0) {
      console.error("Error: provide at least one job title.");
      process.exit(1);
    }

    const params: LeadsParams = {
      queries,
      location: opts.location,
      radius: parseInt(opts.radius, 10),
      datePosted: opts.days,
      employmentTypes,
      remoteOnly: opts.remote,
      format: opts.format.toLowerCase(),
      outputDir: opts.output,
    };

    try {
      await runLeads(params);
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  });

program.parse();
