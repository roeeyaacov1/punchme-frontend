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
import { RootLayout } from "./routes/root";
import { StyleGuidePage } from "./routes/style-guide";
import { LandingPage } from "./routes/marketing/LandingPage";
import { DebugPresetsPage } from "./routes/debug-presets";
import { LoginPage } from "./routes/auth/LoginPage";
import { OnboardingLayout } from "./routes/onboarding/OnboardingLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "style-guide", element: <StyleGuidePage /> },
      { path: "debug/presets", element: <DebugPresetsPage /> },
      { path: "login", element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: (
              <BusinessProvider>
                <Outlet />
              </BusinessProvider>
            ),
            children: [{ path: "onboarding", element: <OnboardingLayout /> }],
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
