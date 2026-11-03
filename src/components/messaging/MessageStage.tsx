import { AppleCardPreview } from "../card-studio/CardPreviews";
import { designOptions, drawnState, isStyled, picturesAt } from "../card-studio/designOptions";
import { WallpaperStage, type LockNotification } from "../kit";
import type { CardTemplate } from "../../api/businesses";
import { designImageUrls, type DesignDoc, type DesignOut } from "../../api/designs";

/**
 * A message as it lands: the owner's own pass standing on a wallpaper of its
 * colours, under the notification it brings. The pass is the Apple preview,
 * because a lock-screen notification is what an iPhone shows; what Android
 * does is said in words beside it (`messaging.phones`).
 *
 * The pass is drawn from the template and the design the page already reads
 * for the card's language, untouched in its 300px slot. With no serial, its
 * code is the preview's own simulation. The sender is the business name,
 * and the stage truncates it inside its own width, so no name can push a
 * page sideways.
 */
export function MessageStage({
  businessName,
  template,
  design,
  notification,
  holderName,
  summary,
  className,
}: {
  businessName: string;
  template: CardTemplate;
  design: DesignOut;
  notification: Omit<LockNotification, "sender">;
  /** Whose pass it landed on, when it went to one customer; else the sample. */
  holderName?: string;
  /** What a screen reader hears instead of the picture. */
  summary: string;
  className?: string;
}) {
  const images = designImageUrls(design);
  const doc = design.design as DesignDoc;
  // A card built from the wallet's design options (`isStyled`) is the
  // wallet's own drawing: the one the design read holds, at its count.
  const state = isStyled(doc) ? drawnState(design.images) : null;
  const drawn = state === null ? undefined : picturesAt(design.images, state);
  return (
    <WallpaperStage
      cardColor={template.background_color}
      stampColor={doc.stamp?.color || template.foreground_color}
      foregroundColor={template.foreground_color}
      notification={{ sender: businessName, ...notification }}
      summary={summary}
      className={className}
    >
      <AppleCardPreview
        businessName={businessName}
        cardName={template.name}
        holderName={holderName}
        stampsRequired={template.stamps_required}
        currentStamps={state ?? 0}
        rewardDescription={template.reward_description}
        backgroundColor={template.background_color}
        foregroundColor={template.foreground_color}
        labelColor={template.label_color}
        design={design.design}
        logoUrl={images.logo ?? template.logo_url ?? undefined}
        appleLogoUrl={images.apple_logo}
        stripBaseUrl={images.strip_base}
        stripStates={state !== null && drawn?.strip ? { [state]: drawn.strip } : undefined}
        logoText={designOptions(doc).logoText && design.pictures.includes("logo")}
      />
    </WallpaperStage>
  );
}
