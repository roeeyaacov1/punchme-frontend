import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button, Badge, buttonClasses } from "../../components/ui";
import { Reveal } from "../../components/motion/Reveal";
import { WalletCardPreview } from "../../components/wallet-card/WalletCardPreview";
import { SocialProofStrip } from "../../components/marketing/SocialProofStrip";
import { cn } from "../../lib/cn";
import logo from "../../assets/logo.png";

interface ValueItem {
  title: string;
  body: string;
}

interface StepItem {
  title: string;
  body: string;
}

export function LandingPage() {
  const { t, i18n } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.resolvedLanguage === "he" ? "en" : "he");
  };

  const valueItems = t("landing.values.items", {
    returnObjects: true,
  }) as ValueItem[];
  const steps = t("landing.howItWorks.steps", {
    returnObjects: true,
  }) as StepItem[];
  const niches = t("landing.niches.items", { returnObjects: true }) as string[];
  const trustBullets = t("landing.hero.trustBullets", {
    returnObjects: true,
  }) as string[];

  const stepVisual = (index: number) => {
    if (index === 1) {
      return (
        <div
          dir="ltr"
          className="bg-white rounded-2xl p-6 shadow-[0_20px_50px_rgba(14,17,32,0.25)]"
        >
          <QRCodeSVG value="https://punchme.app/join/demo" size={160} />
        </div>
      );
    }
    return (
      <WalletCardPreview
        backgroundColor="#1b2036"
        foregroundColor="#ffffff"
        labelColor="#a7adc9"
        businessName={t("landing.example.businessName")}
        stampsRequired={8}
        currentStamps={index === 2 ? 8 : 0}
        rewardDescription={t("landing.example.reward")}
      />
    );
  };

  return (
    <div className="bg-white text-navy overflow-x-clip">
      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-navy/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <img src={logo} alt={t("app.name")} className="h-7 w-auto" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={toggleLanguage}>
              {t("language.switch")}
            </Button>
            <Link to="/login" className={buttonClasses("secondary", "sm")}>
              {t("landing.nav.signIn")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div
          className="pointer-events-none absolute -top-32 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(240,180,41,0.55) 0%, rgba(240,180,41,0) 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 text-center md:text-start items-center md:items-start">
            <div className="animate-fade-up" style={{ animationDelay: "0s" }}>
              <Badge className="bg-white/10 text-gold-light">
                {t("landing.hero.eyebrow")}
              </Badge>
            </div>
            <h1
              className="animate-fade-up text-4xl md:text-5xl leading-tight"
              style={{ animationDelay: "0.1s" }}
            >
              {t("landing.hero.headline")}
            </h1>
            <p
              className="animate-fade-up text-lavender text-lg font-body max-w-md"
              style={{ animationDelay: "0.2s" }}
            >
              {t("landing.hero.subheadline")}
            </p>
            <div
              className="animate-fade-up flex flex-col items-center md:items-start gap-2"
              style={{ animationDelay: "0.3s" }}
            >
              <Link to="/login" className={buttonClasses("primary", "lg")}>
                {t("landing.hero.cta")}
              </Link>
              <span className="text-xs font-mono text-lavender/70 uppercase tracking-wide">
                {t("landing.hero.ctaHint")}
              </span>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 text-xs text-lavender/80 font-body mt-1">
                {trustBullets.map((bullet, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && (
                      <span className="text-lavender/40" aria-hidden="true">
                        ·
                      </span>
                    )}
                    {bullet}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div
            className="flex justify-center animate-scale-in"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="animate-float">
              <WalletCardPreview
                backgroundColor="#1b2036"
                foregroundColor="#ffffff"
                labelColor="#a7adc9"
                businessName={t("landing.example.businessName")}
                stampsRequired={8}
                currentStamps={5}
                rewardDescription={t("landing.example.reward")}
              />
            </div>
          </div>
        </div>
      </section>

      <SocialProofStrip />

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <Reveal>
          <h2 className="text-3xl text-center mb-12">
            {t("landing.values.title")}
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {valueItems.map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="flex flex-col gap-2 text-center md:text-start">
                <h3 className="text-lg font-heading font-bold">{item.title}</h3>
                <p className="text-slate font-body">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-navy/[0.03] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <h2 className="text-3xl text-center mb-12">
              {t("landing.howItWorks.title")}
            </h2>
          </Reveal>
          <Reveal>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="flex flex-col gap-2">
                {steps.map((step, i) => {
                  const isActive = i === activeStep;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveStep(i)}
                      className={cn(
                        "text-start rounded-2xl px-5 py-4 transition-all duration-200 border",
                        isActive
                          ? "bg-white border-navy/10 shadow-[0_1px_2px_rgba(14,17,32,0.06),0_8px_24px_rgba(14,17,32,0.08)]"
                          : "border-transparent opacity-60 hover:opacity-100",
                      )}
                    >
                      <span className="font-mono text-sm text-gold-dark">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-heading font-bold mt-1">
                        {step.title}
                      </h3>
                      {isActive && (
                        <p className="text-slate font-body mt-1">{step.body}</p>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-center items-center min-h-[280px] md:min-h-[360px]">
                <div key={activeStep} className="animate-fade-in">
                  {stepVisual(activeStep)}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Niches */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <Reveal>
          <h2 className="text-2xl mb-6">{t("landing.niches.title")}</h2>
        </Reveal>
        <div className="flex flex-wrap justify-center gap-3">
          {niches.map((niche, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <Badge className="text-sm px-4 py-2 cursor-default transition-all duration-200 hover:-translate-y-1 hover:scale-105 hover:bg-gold/15 hover:text-gold-dark">
                {niche}
              </Badge>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
        <Reveal>
          <h2 className="text-3xl mb-4">{t("landing.pricing.title")}</h2>
          <p className="text-slate font-body max-w-xl mx-auto mb-8">
            {t("landing.pricing.body")}
          </p>
          <Link to="/login" className={buttonClasses("primary", "lg")}>
            {t("landing.pricing.cta")}
          </Link>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt={t("app.name")}
              className="h-6 w-auto brightness-0 invert"
            />
            <span className="text-lavender text-sm font-body">
              {t("landing.footer.tagline")}
            </span>
          </div>
          <span className="text-lavender/60 text-xs font-mono">
            © {new Date().getFullYear()} {t("app.name")} —{" "}
            {t("landing.footer.rights")}
          </span>
        </div>
      </footer>
    </div>
  );
}
