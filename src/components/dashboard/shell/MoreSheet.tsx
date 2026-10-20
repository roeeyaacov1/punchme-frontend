import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useBusiness } from "../../../business/useBusiness";
import { List, ListRow, Sheet } from "../../kit";
import { isAt, moreGroups } from "../navigation";
import { PersonMark, PersonLine } from "./Person";

/**
 * What "More" opens on a phone, for a manager or an owner: what customers
 * see and, for the owner, the business, each under its heading, then one row
 * for the person, which opens the account sheet. About 550px for the owner,
 * so it doesn't scroll on an 812px phone.
 *
 * The kit's sheet: a native dialog with a real focus trap, closed by Escape,
 * the back gesture, the scrim or its close button.
 */
export function MoreSheet({
  open,
  onClose,
  onAccount,
  returnFocus,
}: {
  open: boolean;
  onClose: () => void;
  /** The person row: closes this and opens the account sheet. */
  onAccount: () => void;
  returnFocus?: RefObject<HTMLElement>;
}) {
  const { t } = useTranslation();
  const { role } = useBusiness();
  const { pathname } = useLocation();
  return (
    <Sheet open={open} onClose={onClose} title={t("dashboard.nav.more")} returnFocus={returnFocus}>
      <div className="-mx-6 flex flex-col gap-4">
        {moreGroups(role).map((group) => (
          <section key={group.key} className="flex flex-col gap-1">
            <h3 className="type-label px-6 text-ink-muted">{t(`dashboard.groups.${group.key}`)}</h3>
            <List>
              {group.items.map((item) => (
                <ListRow
                  key={item.key}
                  to={item.to}
                  current={isAt(item, pathname)}
                  leading={<item.Icon aria-hidden className="size-5 text-ink-muted" />}
                  title={t(`dashboard.nav.${item.key}`)}
                  chevron
                />
              ))}
            </List>
          </section>
        ))}
        <List className="border-t border-border">
          <ListRow onClick={onAccount} leading={<PersonMark />} title={<PersonLine />} chevron />
        </List>
      </div>
    </Sheet>
  );
}
