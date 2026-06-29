import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import App from "./App";

import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import PortalLayout from "../layouts/PortalLayout";

import ProtectedRoute from "../components/common/ProtectedRoute";
import LoadingPage from "../components/common/LoadingPage";

const DashboardPage = lazy(
  () => import("../features/dashboard/pages/DashboardPage"),
);
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const SignupPage = lazy(() => import("../features/auth/pages/SignupPage"));
const ForgotPasswordPage = lazy(
  () => import("../features/auth/pages/ForgotPasswordPage"),
);
const AuthCallbackPage = lazy(
  () => import("../features/auth/pages/AuthCallbackPage"),
);

const ClientsPage = lazy(() => import("../features/clients/pages/ClientsPage"));
const ProjectsPage = lazy(
  () => import("../features/projects/pages/ProjectsPage"),
);
const ProposalsPage = lazy(
  () => import("../features/proposals/pages/ProposalsPage"),
);
const CalendarPage = lazy(
  () => import("../features/calendar/pages/CalendarPage"),
);
const TimeTrackingPage = lazy(
  () => import("../features/time/pages/TimeTrackingPage"),
);
const InvoicesPage = lazy(
  () => import("../features/invoices/pages/InvoicesPage"),
);
const ExpensesPage = lazy(
  () => import("../features/expenses/pages/ExpensesPage"),
);
const BillingPage = lazy(() => import("../features/billing/pages/BillingPage"));
const TeamPage = lazy(() => import("../features/team/pages/TeamPage"));
const AcceptInvitePage = lazy(
  () => import("../features/team/pages/AcceptInvitePage"),
);
const AdminPage = lazy(() => import("../features/admin/pages/AdminPage"));
const SettingsPage = lazy(
  () => import("../features/settings/pages/SettingsPage"),
);
const TemplatesPage = lazy(
  () => import("../features/settings/pages/TemplatesPage"),
);
const InsightsPage = lazy(
  () => import("../features/insights/pages/InsightsPage"),
);
const PortalDashboardPage = lazy(
  () => import("../features/portal/pages/PortalDashboardPage"),
);
const FollowUpPage = lazy(
  () => import("../features/followup/pages/FollowUpPage"),
);
const GoalsPage = lazy(() => import("../features/goals/pages/GoalsPage"));
const AIAssistantPage = lazy(
  () => import("../features/ai/pages/AIAssistantPage"),
);

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingPage />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                element: (
                  <SuspenseWrapper>
                    <DashboardPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "clients",
                element: (
                  <SuspenseWrapper>
                    <ClientsPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "projects",
                element: (
                  <SuspenseWrapper>
                    <ProjectsPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "proposals",
                element: (
                  <SuspenseWrapper>
                    <ProposalsPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "calendar",
                element: (
                  <SuspenseWrapper>
                    <CalendarPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "time",
                element: (
                  <SuspenseWrapper>
                    <TimeTrackingPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "invoices",
                element: (
                  <SuspenseWrapper>
                    <InvoicesPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "expenses",
                element: (
                  <SuspenseWrapper>
                    <ExpensesPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "billing",
                element: (
                  <SuspenseWrapper>
                    <BillingPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "team",
                element: (
                  <SuspenseWrapper>
                    <TeamPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "admin",
                element: (
                  <SuspenseWrapper>
                    <AdminPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "settings",
                element: (
                  <SuspenseWrapper>
                    <SettingsPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "templates",
                element: (
                  <SuspenseWrapper>
                    <TemplatesPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "insights",
                element: (
                  <SuspenseWrapper>
                    <InsightsPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "followup",
                element: (
                  <SuspenseWrapper>
                    <FollowUpPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "goals",
                element: (
                  <SuspenseWrapper>
                    <GoalsPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "assistant",
                element: (
                  <SuspenseWrapper>
                    <AIAssistantPage />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: (
              <SuspenseWrapper>
                <LoginPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "signup",
            element: (
              <SuspenseWrapper>
                <SignupPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "forgot-password",
            element: (
              <SuspenseWrapper>
                <ForgotPasswordPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "auth/callback",
            element: (
              <SuspenseWrapper>
                <AuthCallbackPage />
              </SuspenseWrapper>
            ),
          },
          // AcceptInvitePage is accessible to unauthenticated users
          // (invitees who don't have an account yet) so it belongs under
          // AuthLayout, not behind ProtectedRoute.
          {
            path: "accept-invite/:token",
            element: (
              <SuspenseWrapper>
                <AcceptInvitePage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        // Relative path — the previous "/portal" leading slash caused React
        // Router v6 to treat this as an absolute route, breaking layout nesting.
        path: "portal",
        element: <PortalLayout />,
        children: [
          {
            path: ":token",
            element: (
              <SuspenseWrapper>
                <PortalDashboardPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
]);
