import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
// Util
import { printMessageForError } from "./print";

/**
 * Create a hash id for use in cdk
 * @param context context
 * @returns created hash id
 */
export function createHashId(context: string): string {
  return `TOV${createHash("sha256").update(context).digest("hex")}`;
}

/**
 * Load a policy document for service
 * @param service service type
 * @returns policy document (json format)
 */
export function loadPolicyDocument(service: string): any {
  try {
    // Create file path
    const filePath = join(__dirname, "../models/policies", `${service}.json`);
    // Read a file data
    const data = readFileSync(filePath).toString();
    // Transform to json and return transformed data
    return JSON.parse(data);
  } catch (err) {
    if (typeof err === "string") {
      printMessageForError(err);
    } else if (err instanceof Error) {
      printMessageForError(err.message);
    }
    // Exit
    process.exit(1);
  }
}