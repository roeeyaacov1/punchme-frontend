import { AppleCardPreview } from "../card-studio/CardPreviews";
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
  summary,
  className,
}: {
  businessName: string;
  template: CardTemplate;
  design: DesignOut;
  notification: Omit<LockNotification, "sender">;
  /** What a screen reader hears instead of the picture. */
  summary: string;
  className?: string;
}) {
  const images = designImageUrls(design);
  const doc = design.design as DesignDoc;
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
        stampsRequired={template.stamps_required}
        currentStamps={0}
        rewardDescription={template.reward_description}
        backgroundColor={template.background_color}
        foregroundColor={template.foreground_color}
        labelColor={template.label_color}
        design={design.design}
        logoUrl={images.logo ?? template.logo_url ?? undefined}
        appleLogoUrl={images.apple_logo}
        stripBaseUrl={images.strip_base}
      />
    </WallpaperStage>
  );
}
