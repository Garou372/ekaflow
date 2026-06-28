import { useQuery } from "@tanstack/react-query";
import { getUsageMetrics } from "../services/usage.service";
import useAuth from "./useAuth";

export function useUsage() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["usage_metrics", user?.id],
    queryFn: () => getUsageMetrics(),
    enabled: !!user,
  });
}
