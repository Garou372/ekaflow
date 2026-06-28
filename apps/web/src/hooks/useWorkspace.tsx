import { useState, useEffect, createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import { getMyWorkspaces, createWorkspace, type Workspace } from "../services/workspace.service";

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (name: string, slug?: string) => Promise<Workspace>;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return context;
}

export function useWorkspaces() {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: ["workspaces", user?.id],
    queryFn: () => getMyWorkspaces(),
    enabled: !!user,
  });

  return query;
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: workspaces, isLoading } = useWorkspaces();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  // Auto-select first workspace if none selected
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !activeWorkspace) {
      setActiveWorkspace(workspaces[0]);
    }
  }, [workspaces, activeWorkspace]);

  const handleCreateWorkspace = async (name: string, slug?: string) => {
    const ws = await createWorkspace(name, slug);
    // Usually we would invalidate queries, but here we can just return it
    // The query invalidation should happen via queryClient
    return ws;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        workspaces: workspaces || [],
        isLoading,
        setActiveWorkspace,
        createWorkspace: handleCreateWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
