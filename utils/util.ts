import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
// Util
import { printMessageForError } from "./print";

// Directory path
const CONFIG_DIR = join(__dirname, "../models/configs");
const PARAMS_DIR = join(__dirname, "../models/params");
const POLICY_DIR = join(__dirname, "../models/policies");

/**
 * Create a hash id for use in cdk
 * @param context context
 * @returns created hash id
 */
export function createHashId(context: string): string {
  return `TOV${createHash("sha256").update(context).digest("hex")}`;
}

/**
 * Load a configuration data
 * @param filename file name
 * @returns configuration data (json format)
 */
export function loadConfiguration(filename: string): any {
  try {
    // Create file path
    const filePath = join(CONFIG_DIR, `${filename}.json`);
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
  }
}

/**
 * Load a policy document for service
 * @param service service type
 * @returns policy document (json format)
 */
export function loadPolicyDocument(service: string): any {
  try {
    // Create file path
    const filePath = join(POLICY_DIR, `${service}.json`);
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

/**
 * Laad a raw data
 * @param filename file name
 * @returns loaded raw data
 */
export function loadRawData(filename: string): string {
  try {
    // Create file path
    const filePath = join(PARAMS_DIR, filename);
    // Read a file data and return
    return readFileSync(filePath).toString();
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