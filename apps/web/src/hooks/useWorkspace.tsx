import { useState, useEffect, createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAuth from "./useAuth";
import {
  getMyWorkspaces,
  createWorkspace,
  type Workspace,
} from "../services/workspace.service";

const ACTIVE_WORKSPACE_STORAGE_KEY = "ekaflow.activeWorkspaceId";

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (name: string, slug?: string) => Promise<Workspace>;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error(
      "useWorkspaceContext must be used within a WorkspaceProvider",
    );
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: workspaces, isLoading } = useWorkspaces();
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(
    null,
  );

  // Persist the active workspace choice so switching survives reloads.
  const setActiveWorkspace = (workspace: Workspace | null) => {
    setActiveWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspace.id);
    } else {
      localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
    }
  };

  // Select a workspace once the list loads: prefer the previously
  // persisted workspace if it still exists, otherwise fall back to the
  // first workspace available.
  useEffect(() => {
    if (!workspaces || workspaces.length === 0) {
      if (activeWorkspace) {
        setActiveWorkspaceState(null);
      }
      return;
    }

    const stillExists = activeWorkspace
      ? workspaces.some((ws) => ws.id === activeWorkspace.id)
      : false;

    if (stillExists) return;

    const storedId = localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);
    const stored = storedId
      ? workspaces.find((ws) => ws.id === storedId)
      : undefined;

    setActiveWorkspaceState(stored || workspaces[0]);
  }, [workspaces, activeWorkspace]);

  // Reset the active workspace whenever the authenticated user changes
  // (login/logout/account switch) so a stale workspace isn't carried over.
  useEffect(() => {
    if (!user) {
      setActiveWorkspaceState(null);
    }
  }, [user?.id]);

  const handleCreateWorkspace = async (name: string, slug?: string) => {
    const ws = await createWorkspace(name, slug);
    await queryClient.invalidateQueries({ queryKey: ["workspaces", user?.id] });
    setActiveWorkspace(ws);
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
