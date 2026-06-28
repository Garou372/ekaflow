import { createBrowserRouter } from "react-router-dom";

import App from "./App";

import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import PortalLayout from "../layouts/PortalLayout";

import ProtectedRoute from "../components/common/ProtectedRoute";

import DashboardPage from "../features/dashboard/pages/DashboardPage";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import ClientsPage from "../features/clients/pages/ClientsPage";
import ProjectsPage from "../features/projects/pages/ProjectsPage";
import ProposalsPage from "../features/proposals/pages/ProposalsPage";
import CalendarPage from "../features/calendar/pages/CalendarPage";
import TimeTrackingPage from "../features/time/pages/TimeTrackingPage";
import InvoicesPage from "../features/invoices/pages/InvoicesPage";
import ExpensesPage from "../features/expenses/pages/ExpensesPage";
import SettingsPage from "../features/settings/pages/SettingsPage";
import PortalDashboardPage from "../features/portal/pages/PortalDashboardPage";

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
                element: <DashboardPage />,
              },
              {
                path: "clients",
                element: <ClientsPage />,
              },
              {
                path: "projects",
                element: <ProjectsPage />,
              },
              {
                path: "proposals",
                element: <ProposalsPage />,
              },
              {
                path: "calendar",
                element: <CalendarPage />,
              },
              {
                path: "time",
                element: <TimeTrackingPage />,
              },
              {
                path: "invoices",
                element: <InvoicesPage />,
              },
              {
                path: "expenses",
                element: <ExpensesPage />,
              },
              {
                path: "settings",
                element: <SettingsPage />,
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
            element: <LoginPage />,
          },
          {
            path: "signup",
            element: <SignupPage />,
          },
        ],
      },
      {
        path: "/portal",
        element: <PortalLayout />,
        children: [
          {
            path: ":token",
            element: <PortalDashboardPage />,
          },
        ],
      },
    ],
  },
]);
