import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { ToastProvider } from "../hooks/useToast";
import { SubscriptionProvider } from "../hooks/useSubscription";
import ToastContainer from "../components/common/ToastContainer";

import { WorkspaceProvider } from "../hooks/useWorkspace";

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <WorkspaceProvider>
          <SubscriptionProvider>
            {children}
          </SubscriptionProvider>
        </WorkspaceProvider>
        <ToastContainer />
      </ToastProvider>
    </QueryClientProvider>
  );
}
