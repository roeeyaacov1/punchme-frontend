import type { User } from "../../../api/auth";

/** How the shell names whoever is signed in: their name as they gave it, or
 * their email when they gave none. From the user `/api/auth/me` already
 * returned, so it costs no call of its own. */
export function personName(user: User | null): string {
  if (!user) return "";
  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return name || user.email;
}

/** The first letter of a name, whole: a Hebrew name gives a Hebrew letter,
 * and `Array.from` keeps a surrogate pair together where `[0]` would halve
 * it. */
export function initialOf(name: string): string {
  return Array.from(name.trim())[0]?.toLocaleUpperCase() ?? "•";
}
