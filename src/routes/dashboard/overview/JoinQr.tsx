import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { Button, LitPanel, useToast } from "../../../components/kit";
import { buildEnrollUrl } from "../../../lib/enrollUrl";

/**
 * The join QR, and its link to copy. It keeps its light at night, because a
 * code has to be dark on light to scan, and it makes no call: the QR and
 * the link are both `/join/{template}`, built in the browser.
 */
export function JoinQr({ templateId, className }: { templateId: string; className?: string }) {
  const { t } = useTranslation();
  const toast = useToast();
  const url = buildEnrollUrl(templateId);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.show({ tone: "ok", title: t("common.copied") });
    } catch {
      // A clipboard the browser won't hand over: the code is on screen.
    }
  };

  return (
    <LitPanel light="lit" as="section" aria-labelledby="join-qr-title" className={className}>
      <div className="flex h-full flex-col items-center gap-4 p-4 sm:p-5">
        <h2 id="join-qr-title" className="type-card-title self-stretch text-ink">
          {t("dashboard.qr.title")}
        </h2>
        <QrCode url={url} size={168} />
        <Button variant="secondary" icon={<Copy aria-hidden />} onClick={copy}>
          {t("common.copyLink")}
        </Button>
      </div>
    </LitPanel>
  );
}

/** The code itself, ink on white with its own quiet zone. */
export function QrCode({ url, size }: { url: string; size: number }) {
  return (
    <div dir="ltr" className="rounded-field bg-white p-3">
      <QRCodeSVG value={url} size={size} fgColor="#2b2521" bgColor="#ffffff" />
    </div>
  );
}
