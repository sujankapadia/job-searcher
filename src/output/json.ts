import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { SearchResult } from "../types.js";

function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9-_]/g, "_").toLowerCase();
}

export async function writeJson(
  result: SearchResult,
  outputDir: string
): Promise<string> {
  await mkdir(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const querySlug = sanitizeFilename(result.query);
  const filename = `${querySlug}-${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  await writeFile(filepath, JSON.stringify(result, null, 2), "utf-8");

  return filepath;
}
