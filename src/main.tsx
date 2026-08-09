import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
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
import { JoinPage } from "./routes/public/JoinPage";
import { CardStatusPage } from "./routes/public/CardStatusPage";
import { DashboardLayout } from "./routes/dashboard/DashboardLayout";
import { DashboardOverview } from "./routes/dashboard/DashboardOverview";
import { DesignPage } from "./routes/dashboard/DesignPage";
import { CustomersPage } from "./routes/dashboard/CustomersPage";
import { ActivityPage } from "./routes/dashboard/ActivityPage";
import { StandeePage } from "./routes/dashboard/StandeePage";
import { BillingSettingsPage } from "./routes/dashboard/BillingSettingsPage";
import { BillingSuccessPage } from "./routes/billing/BillingSuccessPage";
import { BillingCancelPage } from "./routes/billing/BillingCancelPage";

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
        element: <ProtectedRoute />,
        children: [
          {
            element: (
              <BusinessProvider>
                <Outlet />
              </BusinessProvider>
            ),
            children: [
              { path: "onboarding", element: <OnboardingLayout /> },
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
