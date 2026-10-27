// The dashboard, loaded on demand as one chunk: every route under
// /dashboard imports this module, so the first visit brings the whole
// dashboard and every page after it opens at once. A customer's phone on
// /join never downloads it.
export { DashboardLayout } from "../dashboard/DashboardLayout";
export { DashboardNotFound, DashboardPageError } from "../../components/dashboard/shell/ShellPages";
export { RequireRole } from "../../business/RequireRole";
export { DashboardOverview } from "../dashboard/DashboardOverview";
export { ScanPage } from "../dashboard/ScanPage";
export { CustomersPage } from "../dashboard/CustomersPage";
export { ActivityPage } from "../dashboard/ActivityPage";
export { DesignPage } from "../dashboard/DesignPage";
export { StandeePage } from "../dashboard/StandeePage";
export { MessagesPage } from "../dashboard/MessagesPage";
export { BroadcastComposerPage } from "../dashboard/BroadcastComposerPage";
export { AutomationEditorPage } from "../dashboard/AutomationEditorPage";
export { ReferralsPage } from "../dashboard/ReferralsPage";
export { TeamPage } from "../dashboard/TeamPage";
export { BillingSettingsPage } from "../dashboard/BillingSettingsPage";
