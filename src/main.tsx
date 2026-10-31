import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "./i18n";
import { queryClient } from "./lib/queryClient";
import { watchForInstallPrompt } from "./pwa/installPrompt";
import { registerServiceWorker } from "./pwa/registerServiceWorker";
import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RequireStaff } from "./auth/RequireStaff";
import { BusinessProvider } from "./business/BusinessProvider";
import { RequireBusiness } from "./business/RequireBusiness";
import { BusinessLoading } from "./components/dashboard/shell/BusinessPages";
import { RootLayout } from "./routes/root";
import { RouteLoading } from "./routes/RouteLoading";
import { DebugPresetsPage } from "./routes/debug-presets";
import { LoginPage } from "./routes/auth/LoginPage";
import { JoinPage } from "./routes/public/JoinPage";
import { InvitePage } from "./routes/invite/InvitePage";
import { CardStatusPage } from "./routes/public/CardStatusPage";
import { PublicCardPage } from "./routes/public/PublicCardPage";

// The dashboard, the wizard, admin and the checkout returns load on demand,
// each group as one chunk, and the landing page on its own, so a customer
// at a counter downloads none of them before /join can draw a field. The
// five public pages stay in the entry, so /join draws after one script
// (on demand they would save the landing page 19 kB gzipped and cost
// /join a round trip), and /login above all: the dashboard's sign-out
// relies on a navigation to /login with nothing to load, which commits at
// once.
const dashboard = () => import("./routes/lazy/dashboard");
const onboarding = () => import("./routes/lazy/onboarding");
const admin = () => import("./routes/lazy/admin");
const billing = () => import("./routes/lazy/billing");
const info = () => import("./routes/lazy/info");

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import("./routes/marketing/LandingPage")).LandingPage }) },
      // Loaded on its own: the guide carries the whole redesign kit, and none
      // of it should ship to someone opening the landing page.
      {
        path: "style-guide",
        lazy: async () => ({ Component: (await import("./routes/style-guide")).StyleGuidePage }),
      },
      { path: "debug/presets", element: <DebugPresetsPage /> },
      // The site's reading pages, linked from the landing page's footer and
      // from the back of every pass. Static: no API call and no session, so
      // they load as a chunk of their own and no one else downloads them.
      { path: "contact", lazy: async () => ({ Component: (await info()).ContactPage }) },
      { path: "support", element: <Navigate to="/contact" replace /> },
      { path: "privacy", lazy: async () => ({ Component: (await info()).PrivacyPage }) },
      { path: "terms", lazy: async () => ({ Component: (await info()).TermsPage }) },
      { path: "login", element: <LoginPage /> },
      { path: "join/:templateId", element: <JoinPage /> },
      // Public like the join flow, and for the same reason: it is opened
      // from a chat message by someone who has no account yet. The page
      // signs them in itself rather than sending them to /login, so the
      // invitation is still on screen while they type.
      { path: "invite/:token", element: <InvitePage /> },
      { path: "c/:serial", element: <CardStatusPage /> },
      // The page behind the wallet QR once it is a URL. Public, because a
      // customer's friend opens it from a plain camera; but it reads the
      // owner's session when there is one and turns into a stamp screen.
      { path: "p/:token", element: <PublicCardPage /> },
      {
        // Public: the owner designs the card before there is an account.
        // Only the last two steps (wallet, billing) need one, and
        // OnboardingGate asks for it there — inside the wizard, not via
        // /login — because by then the draft is what they came to keep.
        path: "onboarding",
        lazy: async () => ({ Component: (await onboarding()).OnboardingLayout }),
        children: [
          { index: true, lazy: async () => ({ Component: (await onboarding()).OnboardingIndex }) },
          { path: "business", lazy: async () => ({ Component: (await onboarding()).BusinessStep }) },
          { path: "color", lazy: async () => ({ Component: (await onboarding()).ColorStep }) },
          { path: "accent", lazy: async () => ({ Component: (await onboarding()).AccentStep }) },
          { path: "stamp", lazy: async () => ({ Component: (await onboarding()).StampStep }) },
          { path: "reward", lazy: async () => ({ Component: (await onboarding()).RewardStep }) },
          { path: "account", lazy: async () => ({ Component: (await onboarding()).AccountStep }) },
          {
            lazy: async () => ({ Component: (await onboarding()).OnboardingGate }),
            children: [
              { path: "wallet", lazy: async () => ({ Component: (await onboarding()).WalletStep }) },
              { path: "billing", lazy: async () => ({ Component: (await onboarding()).BillingStep }) },
            ],
          },
          { path: "*", element: <Navigate to="/onboarding" replace /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            // Staff-only catalog area — outside BusinessProvider/RequireBusiness:
            // staff accounts don't necessarily own a Business. The API is the
            // real gate (403 for non-staff); this is UX.
            element: <RequireStaff />,
            children: [
              {
                path: "admin",
                lazy: async () => ({ Component: (await admin()).AdminLayout }),
                children: [
                  { index: true, lazy: async () => ({ Component: (await admin()).AdminCatalogListPage }) },
                  { path: "catalog", lazy: async () => ({ Component: (await admin()).AdminCatalogListPage }) },
                  {
                    path: "catalog/:catalogId",
                    lazy: async () => ({ Component: (await admin()).AdminCatalogEditPage }),
                  },
                ],
              },
            ],
          },
          {
            element: (
              <BusinessProvider>
                <Outlet />
              </BusinessProvider>
            ),
            children: [
              {
                element: <RequireBusiness />,
                children: [
                  {
                    path: "dashboard",
                    lazy: async () => ({ Component: (await dashboard()).DashboardLayout }),
                    children: [
                      {
                        // Between the shell and the pages, so a page that
                        // throws shows inside the shell, with the bar or the
                        // rail still there.
                        lazy: async () => {
                          const { DashboardPageError } = await dashboard();
                          return { errorElement: <DashboardPageError /> };
                        },
                        children: [
                          // The counter — everyone on the team, staff included.
                          { index: true, lazy: async () => ({ Component: (await dashboard()).DashboardOverview }) },
                          { path: "scan", lazy: async () => ({ Component: (await dashboard()).ScanPage }) },
                          { path: "customers", lazy: async () => ({ Component: (await dashboard()).CustomersPage }) },
                          { path: "activity", lazy: async () => ({ Component: (await dashboard()).ActivityPage }) },
                          {
                            // Anything that changes what customers see. The nav
                            // already hides these from a hire; this is what
                            // answers when one types the URL anyway — and it
                            // says so, rather than bouncing them somewhere and
                            // looking like a broken link.
                            lazy: async () => {
                              const { RequireRole } = await dashboard();
                              return { element: <RequireRole minimum="manager" /> };
                            },
                            children: [
                              { path: "design", lazy: async () => ({ Component: (await dashboard()).DesignPage }) },
                              { path: "standee", lazy: async () => ({ Component: (await dashboard()).StandeePage }) },
                              { path: "messages", lazy: async () => ({ Component: (await dashboard()).MessagesPage }) },
                              {
                                path: "messages/new",
                                lazy: async () => ({ Component: (await dashboard()).BroadcastComposerPage }),
                              },
                              {
                                path: "messages/automations/new",
                                lazy: async () => ({ Component: (await dashboard()).AutomationEditorPage }),
                              },
                              {
                                path: "messages/automations/:automationId",
                                lazy: async () => ({ Component: (await dashboard()).AutomationEditorPage }),
                              },
                              { path: "referrals", lazy: async () => ({ Component: (await dashboard()).ReferralsPage }) },
                            ],
                          },
                          {
                            // Money and the team.
                            lazy: async () => {
                              const { RequireRole } = await dashboard();
                              return { element: <RequireRole minimum="owner" /> };
                            },
                            children: [
                              { path: "team", lazy: async () => ({ Component: (await dashboard()).TeamPage }) },
                              {
                                path: "billing",
                                lazy: async () => ({ Component: (await dashboard()).BillingSettingsPage }),
                              },
                            ],
                          },
                          // No page here: an old or mistyped link, said
                          // inside the shell rather than on the router's
                          // English developer page.
                          { path: "*", lazy: async () => ({ Component: (await dashboard()).DashboardNotFound }) },
                        ],
                      },
                    ],
                  },
                  { path: "billing/success", lazy: async () => ({ Component: (await billing()).BillingSuccessPage }) },
                  { path: "billing/cancel", lazy: async () => ({ Component: (await billing()).BillingCancelPage }) },
                  // Where Stripe's portal sends the owner back by default.
                  // Billing lives in the dashboard, so this only forwards,
                  // the dashboard's stand-in on screen while its code arrives.
                  {
                    path: "billing",
                    element: (
                      <>
                        <Navigate to="/dashboard/billing" replace />
                        <BusinessLoading />
                      </>
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

// A tab left open across a release asks for chunks the new build no longer
// has. One reload fetches the new entry instead of landing on the router's
// error page; the mark keeps a chunk that is really missing from looping.
window.addEventListener("vite:preloadError", () => {
  try {
    const key = "punchme.chunkReload";
    if (Date.now() - Number(sessionStorage.getItem(key) ?? 0) < 10_000) return;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    /* storage refused: reload all the same */
  }
  window.location.reload();
});

// Before render on purpose: `beforeinstallprompt` can fire while React is
// still mounting, it only fires once, and there is no way to ask for it back.
watchForInstallPrompt();
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} fallbackElement={<RouteLoading />} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
