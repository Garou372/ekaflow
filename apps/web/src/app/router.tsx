import { createBrowserRouter } from "react-router-dom";

import App from "./App";

import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";

import ProtectedRoute from "../components/common/ProtectedRoute";

import DashboardPage from "../features/dashboard/pages/DashboardPage";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import ClientsPage from "../features/clients/pages/ClientsPage";
import ProposalsPage from "../features/proposals/pages/ProposalsPage";
import InvoicesPage from "../features/invoices/pages/InvoicesPage";
import SettingsPage from "../features/settings/pages/SettingsPage";

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
                path: "proposals",
                element: <ProposalsPage />,
              },
              {
                path: "invoices",
                element: <InvoicesPage />,
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
    ],
  },
]);
