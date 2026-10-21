import type { CustomerListItem } from "../../api/loyalty";

/**
 * Finding a customer the way they are spoken of at the counter.
 *
 * The roster stores numbers the international way, "+972500009242", and a
 * customer says theirs the national way, "050-000-9242". Compared digit by
 * digit as typed, the second never finds the first, and a new staff member
 * concludes the customer isn't enrolled and signs them up again. So both
 * sides are also read as national numbers: digits only, Israel's country
 * code turned back into the trunk 0.
 */

/** "+972 50-000-9242", "00972500009242" and "050-000-9242" all read
 * "0500009242". Anything without the country code is its digits as typed, so
 * a fragment such as the last four still finds its number. */
export function nationalNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("00972")
    ? digits.slice(5)
    : digits.startsWith("972")
      ? digits.slice(3)
      : null;
  if (local === null) return digits;
  if (!local) return "";
  return local.startsWith("0") ? local : `0${local}`;
}

/** The number as an Israeli reads it: "050-000-9242", or "03-123-4567" for a
 * landline. Anything that isn't a whole Israeli number is shown as stored. */
export function phoneForDisplay(phone: string): string {
  const national = nationalNumber(phone);
  if (/^0[5-9]\d{8}$/.test(national)) {
    return `${national.slice(0, 3)}-${national.slice(3, 6)}-${national.slice(6)}`;
  }
  if (/^0[2-4]\d{7}$/.test(national)) {
    return `${national.slice(0, 2)}-${national.slice(2, 5)}-${national.slice(5)}`;
  }
  return phone;
}

/** Lower case, without accents or niqqud, so "jose" finds "José". */
function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();
}

/**
 * A name or a card's name, folded, or a number in any of the ways it is
 * said. The digits are tried as typed and as a national number, against the
 * stored number's digits and its national form.
 */
export function matchesSearch(customer: CustomerListItem, query: string): boolean {
  const typed = query.trim();
  if (!typed) return true;
  const folded = fold(typed);
  if (fold(customer.customer_display_name).includes(folded)) return true;
  if (fold(customer.template_name).includes(folded)) return true;

  const digits = typed.replace(/\D/g, "");
  if (!digits || !customer.customer_phone) return false;
  const stored = [customer.customer_phone.replace(/\D/g, ""), nationalNumber(customer.customer_phone)];
  const asked = [digits, nationalNumber(typed)].filter(Boolean);
  return asked.some((a) => stored.some((s) => s.includes(a)));
}
