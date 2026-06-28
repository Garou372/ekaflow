import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry auth errors or "not found" — only network/server errors
        if (error instanceof Error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("jwt") || msg.includes("unauthorized") || msg.includes("not found")) {
            return false;
          }
        }
        return failureCount < 2; // max 2 retries
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // Mutations should not auto-retry (could cause duplicates)
    },
  },
});
