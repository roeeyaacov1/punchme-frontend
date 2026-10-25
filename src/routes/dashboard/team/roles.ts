import type { TFunction } from "i18next";
import type { AssignableRole } from "../../../api/team";
import type { RadioOption } from "../../../components/kit";

/**
 * The two roles a link can hand out, each with what it opens, because
 * "Manager" means nothing on its own. Staff first: the least a hire can
 * open is the one a slip of the thumb should land on.
 */
export function roleOptions(t: TFunction): RadioOption<AssignableRole>[] {
  return (["staff", "manager"] as const).map((role) => ({
    value: role,
    label: t(`team.role.${role}`),
    description: t(`team.roleBody.${role}`),
  }));
}
