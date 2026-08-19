import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "./i18n";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { BusinessProvider } from "./business/BusinessProvider";
import { RequireBusiness } from "./business/RequireBusiness";
import { RootLayout } from "./routes/root";
import { StyleGuidePage } from "./routes/style-guide";
import { LandingPage } from "./routes/marketing/LandingPage";
import { DebugPresetsPage } from "./routes/debug-presets";
import { LoginPage } from "./routes/auth/LoginPage";
import { OnboardingLayout } from "./routes/onboarding/OnboardingLayout";
import { OnboardingIndex } from "./routes/onboarding/OnboardingIndex";
import { OnboardingGate } from "./routes/onboarding/OnboardingGate";
import { BusinessStep } from "./routes/onboarding/steps/BusinessStep";
import { ColorStep } from "./routes/onboarding/steps/ColorStep";
import { AccentStep } from "./routes/onboarding/steps/AccentStep";
import { StampStep } from "./routes/onboarding/steps/StampStep";
import { RewardStep } from "./routes/onboarding/steps/RewardStep";
import { AccountStep } from "./routes/onboarding/steps/AccountStep";
import { WalletStep } from "./routes/onboarding/steps/WalletStep";
import { BillingStep } from "./routes/onboarding/steps/BillingStep";
import { JoinPage } from "./routes/public/JoinPage";
import { CardStatusPage } from "./routes/public/CardStatusPage";
import { DashboardLayout } from "./routes/dashboard/DashboardLayout";
import { DashboardOverview } from "./routes/dashboard/DashboardOverview";
import { DesignPage } from "./routes/dashboard/DesignPage";
import { CustomersPage } from "./routes/dashboard/CustomersPage";
import { ActivityPage } from "./routes/dashboard/ActivityPage";
import { StandeePage } from "./routes/dashboard/StandeePage";
import { BillingSettingsPage } from "./routes/dashboard/BillingSettingsPage";
import { MessagesPage } from "./routes/dashboard/MessagesPage";
import { AutomationEditorPage } from "./routes/dashboard/AutomationEditorPage";
import { BroadcastComposerPage } from "./routes/dashboard/BroadcastComposerPage";
import { BillingSuccessPage } from "./routes/billing/BillingSuccessPage";
import { BillingCancelPage } from "./routes/billing/BillingCancelPage";
import { RequireStaff } from "./auth/RequireStaff";
import { AdminLayout } from "./routes/admin/AdminLayout";
import { AdminCatalogListPage } from "./routes/admin/AdminCatalogListPage";
import { AdminCatalogEditPage } from "./routes/admin/AdminCatalogEditPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "style-guide", element: <StyleGuidePage /> },
      { path: "debug/presets", element: <DebugPresetsPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "join/:templateId", element: <JoinPage /> },
      { path: "c/:serial", element: <CardStatusPage /> },
      {
        // Public: the owner designs the card before there is an account.
        // Only the last two steps (wallet, billing) need one, and
        // OnboardingGate asks for it there — inside the wizard, not via
        // /login — because by then the draft is what they came to keep.
        path: "onboarding",
        element: <OnboardingLayout />,
        children: [
          { index: true, element: <OnboardingIndex /> },
          { path: "business", element: <BusinessStep /> },
          { path: "color", element: <ColorStep /> },
          { path: "accent", element: <AccentStep /> },
          { path: "stamp", element: <StampStep /> },
          { path: "reward", element: <RewardStep /> },
          { path: "account", element: <AccountStep /> },
          {
            element: <OnboardingGate />,
            children: [
              { path: "wallet", element: <WalletStep /> },
              { path: "billing", element: <BillingStep /> },
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
                element: <AdminLayout />,
                children: [
                  { index: true, element: <AdminCatalogListPage /> },
                  { path: "catalog", element: <AdminCatalogListPage /> },
                  { path: "catalog/:catalogId", element: <AdminCatalogEditPage /> },
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
                    element: <DashboardLayout />,
                    children: [
                      { index: true, element: <DashboardOverview /> },
                      { path: "design", element: <DesignPage /> },
                      { path: "customers", element: <CustomersPage /> },
                      { path: "activity", element: <ActivityPage /> },
                      { path: "messages", element: <MessagesPage /> },
                      { path: "messages/new", element: <BroadcastComposerPage /> },
                      {
                        path: "messages/automations/new",
                        element: <AutomationEditorPage />,
                      },
                      {
                        path: "messages/automations/:automationId",
                        element: <AutomationEditorPage />,
                      },
                      { path: "standee", element: <StandeePage /> },
                      { path: "billing", element: <BillingSettingsPage /> },
                    ],
                  },
                  { path: "billing/success", element: <BillingSuccessPage /> },
                  { path: "billing/cancel", element: <BillingCancelPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
