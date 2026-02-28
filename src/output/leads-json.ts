import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { LeadsResult } from "../types.js";

export async function writeLeadsJson(
  result: LeadsResult,
  outputDir: string
): Promise<string> {
  await mkdir(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `leads-${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  await writeFile(filepath, JSON.stringify(result, null, 2), "utf-8");

  return filepath;
}
