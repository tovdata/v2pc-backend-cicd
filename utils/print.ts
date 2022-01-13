/**
 * Print message for debug
 * @param message message content
 */
 export function printMessageForDebug(message: string) {
  console.error(`[DEBUG] ${message}`);
}

/**
 * Print message for error
 * @param message message content
 */
export function printMessageForError(message: string) {
  console.error(`[ERROR] ${message}`);
}

/**
 * Print message for notice
 * @param message message content
 */
 export function printMessageForNotice(message: string) {
  console.error(`[NOTICE] ${message}`);
}