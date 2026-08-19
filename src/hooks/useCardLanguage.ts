import { useQuery } from "@tanstack/react-query";
import { getTemplateDesign } from "../api/designs";
import type { MessageLanguage } from "../api/messaging";

/** The card's language decides the copy the recipes come in and the
 * placeholder spelling a chip inserts — not the dashboard's UI language,
 * which defaults to English for everyone. Same query key as the Card
 * Studio, so this is a cache read after it. */
export function useCardLanguage(
  businessId: string | undefined,
  templateId: string | undefined,
): MessageLanguage {
  const { data } = useQuery({
    queryKey: ["design", templateId],
    queryFn: () => getTemplateDesign(businessId!, templateId!),
    enabled: !!businessId && !!templateId,
    staleTime: 60_000,
  });
  return data?.design?.default_language === "EN" ? "EN" : "HE";
}
