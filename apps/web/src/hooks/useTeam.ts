import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceMembers, inviteMember, type WorkspaceRole } from "../services/workspace.service";
import { useWorkspaceContext } from "./useWorkspace";

export function useTeam() {
  const { activeWorkspace } = useWorkspaceContext();
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ["workspace_members", activeWorkspace?.id],
    queryFn: () => getWorkspaceMembers(activeWorkspace!.id),
    enabled: !!activeWorkspace,
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: WorkspaceRole }) => 
      inviteMember(activeWorkspace!.id, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace_members", activeWorkspace?.id] });
    },
  });

  return {
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    inviteMember: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
  };
}
