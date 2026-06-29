import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { ToastProvider } from "../hooks/useToast";
import { SubscriptionProvider } from "../hooks/useSubscription";
import ToastContainer from "../components/common/ToastContainer";

import { AuthProvider } from "../hooks/useAuth";
import { WorkspaceProvider } from "../hooks/useWorkspace";

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {/*
       * AuthProvider is the outermost content wrapper so every child —
       * including WorkspaceProvider and SubscriptionProvider — shares a
       * single onAuthStateChange subscription instead of each call to
       * useAuth() registering its own Supabase listener.
       */}
      <AuthProvider>
        <ToastProvider>
          <WorkspaceProvider>
            <SubscriptionProvider>{children}</SubscriptionProvider>
          </WorkspaceProvider>
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
