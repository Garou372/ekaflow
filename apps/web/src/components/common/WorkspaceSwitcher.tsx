import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Check, Briefcase } from "lucide-react";
import { useWorkspaceContext } from "../../hooks/useWorkspace";

export default function WorkspaceSwitcher() {
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspaceContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeWorkspace) {
    return (
      <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 transition-colors w-full sm:w-48 justify-between border border-transparent hover:border-gray-200"
      >
        <div className="flex items-center gap-2 truncate">
          <div className="bg-indigo-100 text-indigo-700 p-1 rounded-md">
            <Briefcase size={16} />
          </div>
          <span className="font-medium text-sm truncate text-gray-700">
            {activeWorkspace.name}
          </span>
        </div>
        <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-white border border-gray-100 shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Your Workspaces
            </div>
            <div className="flex flex-col gap-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                    activeWorkspace.id === ws.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {activeWorkspace.id === ws.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // In a real app, this might open a modal. For now we navigate or show modal.
                // navigate("/settings?tab=workspaces");
              }}
              className="flex w-full items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Plus size={14} />
              <span>Create Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
