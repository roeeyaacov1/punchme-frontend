// Minimal RFC 4180 writer. Small enough not to be worth a dependency, but the
// two hazards below are real and easy to get wrong by hand.

/** Excel and Sheets execute a cell that opens with one of these. Customer
 * display names come straight from the public join form, so an export is a
 * path from "anyone who can scan the QR" to "formula runs on the owner's
 * machine". Prefixing with an apostrophe keeps the text readable (both apps
 * treat it as a text marker and hide it) and inert. */
const FORMULA_LEAD = /^[=+\-@\t\r]/;

/** U+FEFF byte-order mark, spelled as a code point so it can't be mistaken for
 * stray whitespace in this file. Without it, Excel on Windows reads a UTF-8
 * CSV as the local ANSI codepage and every Hebrew name arrives as mojibake. */
const UTF8_BOM = String.fromCharCode(0xfeff);

function escapeCell(value: string): string {
  const safe = FORMULA_LEAD.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Force a cell to import as text. Israeli mobile numbers start with a 0 that
 * Excel strips the moment it decides the column is numeric — which ruins the
 * main reason an owner exports this list (feeding it to an SMS tool). */
export function csvText(value: string): string {
  return value ? `'${value}` : value;
}

export function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([UTF8_BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
