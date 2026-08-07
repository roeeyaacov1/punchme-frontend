/**
 * Throwaway route to eyeball the design-system primitives together.
 * Not linked from anywhere real — safe to delete once the landing page
 * and dashboard exist and exercise these components in context.
 */
import { useTranslation } from "react-i18next";
import { Button, Input, Card, Badge } from "../components/ui";
import { WalletCardPreview } from "../components/wallet-card/WalletCardPreview";
import logo from "../assets/logo.png";

export function StyleGuidePage() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.resolvedLanguage === "he" ? "en" : "he");
  };

  return (
    <div className="min-h-screen bg-white text-navy p-8 flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <img src={logo} alt={t("app.name")} className="w-40" />
        <Button variant="ghost" size="sm" onClick={toggleLanguage}>
          {t("language.switch")}
        </Button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>Neutral</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="success">Success</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Input</h2>
        <Input label="Business name" placeholder="e.g. Studio Café" />
        <Input
          label="With error"
          defaultValue="oops"
          error="This field is required"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Card</h2>
        <Card>
          <p className="font-body text-slate">
            A basic card container with the shared shadow/radius treatment.
          </p>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Wallet Card Preview</h2>
        <div className="flex flex-wrap gap-6 bg-navy/5 p-6 rounded-2xl justify-center">
          <WalletCardPreview
            backgroundColor="#0e1120"
            foregroundColor="#ffffff"
            labelColor="#a7adc9"
            businessName="Studio Café"
            stampsRequired={8}
            currentStamps={3}
            rewardDescription="A free coffee of your choice"
          />
          <WalletCardPreview
            backgroundColor="#7c3f1d"
            foregroundColor="#fff7ed"
            labelColor="#fbbf7a"
            businessName="מספרת שלמה"
            stampsRequired={10}
            currentStamps={9}
            rewardDescription="תספורת חינם בביקור הבא"
          />
          <WalletCardPreview
            backgroundColor="#134e3a"
            foregroundColor="#ecfdf5"
            labelColor="#86efac"
            businessName="No stamps yet"
            stampsRequired={6}
            currentStamps={0}
            rewardDescription=""
          />
        </div>
      </section>
    </div>
  );
}
