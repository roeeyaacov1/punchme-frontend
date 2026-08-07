// Light client-side shape check for an Israeli phone number — a UX nicety
// only. The backend (normalize_il_phone) is the real validator; a garbage
// value that slips past this still gets a clean 422, not a crash.
const IL_PHONE_RE = /^(0|\+972)5\d([-\s]?\d){7}$/;

export function isLikelyIlPhone(value: string): boolean {
  return IL_PHONE_RE.test(value.trim());
}
