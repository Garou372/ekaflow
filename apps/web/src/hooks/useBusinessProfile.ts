import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBusinessProfile,
  upsertBusinessProfile,
  uploadBusinessLogo,
  type UpdateBusinessProfilePayload,
} from "../services/business-profile.service";
import { useToast } from "./useToast";

export const BUSINESS_PROFILE_KEY = ["business_profile"];

export default function useBusinessProfile() {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

  const profileQuery = useQuery({
    queryKey: BUSINESS_PROFILE_KEY,
    queryFn: getBusinessProfile,
    staleTime: 1000 * 60 * 30, // 30 minutes — settings rarely change
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<UpdateBusinessProfilePayload>) =>
      upsertBusinessProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_PROFILE_KEY });
      success("Settings saved", "Your business profile has been updated.");
    },
    onError: (err: Error) => {
      errorToast("Failed to save settings", err.message);
    },
  });

  const logoMutation = useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadBusinessLogo(file);
      if (!url) throw new Error("Logo upload failed");
      return upsertBusinessProfile({ logo_url: url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_PROFILE_KEY });
      success("Logo updated", "Your business logo has been saved.");
    },
    onError: (err: Error) => {
      errorToast("Logo upload failed", err.message);
    },
  });

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateMutation.mutateAsync,
    uploadLogo: logoMutation.mutateAsync,
    updating: updateMutation.isPending,
    uploadingLogo: logoMutation.isPending,
  };
}
