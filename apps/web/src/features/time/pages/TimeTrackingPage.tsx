import { useMemo, useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import TimeEntryForm from "../components/TimeEntryForm";
import type { TimeEntry, CreateTimeEntryPayload } from "../types/time";
import useTimeEntries from "../../../hooks/useTimeEntries";
import useProjects from "../../../hooks/useProjects";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";

export default function TimeTrackingPage() {
  const {
    timeEntries,
    isLoading,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    creating,
    updating,
    deleting,
  } = useTimeEntries();

  const { projects } = useProjects();

  const [open, setOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredEntries = useMemo(() => {
    return timeEntries.filter((entry) => {
      const q = search.toLowerCase();
      const projName = projects.find((p) => p.id === entry.project_id)?.name?.toLowerCase() || "";
      return (
        entry.description.toLowerCase().includes(q) ||
        projName.includes(q)
      );
    });
  }, [timeEntries, search, projects]);

  const totalMinutes = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);
  }, [filteredEntries]);

  async function handleSubmit(payload: CreateTimeEntryPayload) {
    if (editingEntry) {
      await updateTimeEntry({ id: editingEntry.id, payload });
    } else {
      await createTimeEntry(payload);
    }
    setEditingEntry(undefined);
    setOpen(false);
  }

  function handleEdit(entry: TimeEntry) {
    setEditingEntry(entry);
    setOpen(true);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      await deleteTimeEntry(deletingId);
    } finally {
      setDeletingId(null);
    }
  }

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Time Tracking" description="Manage your logged time and manual entries.">
        <button
          onClick={() => {
            setEditingEntry(undefined);
            setOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          + Manual Entry
        </button>
      </PageHeader>

      <div className="flex items-center justify-between gap-4">
        <input
          placeholder="Search time entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border px-4 py-2"
        />
        <div className="text-right">
          <span className="text-sm text-gray-500 mr-2">Total Time</span>
          <span className="text-xl font-bold text-gray-900">{formatHoursMins(totalMinutes)}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center bg-white">
          <h3 className="text-xl font-semibold text-gray-900">No Time Logged</h3>
          <p className="mt-2 text-gray-500">Use the global timer or add a manual entry.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 font-medium text-gray-500">Project</th>
                <th className="px-6 py-4 font-medium text-gray-500">Description</th>
                <th className="px-6 py-4 font-medium text-gray-500">Duration</th>
                <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">
                    {new Date(entry.start_time).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {projects.find((p) => p.id === entry.project_id)?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {formatHoursMins(entry.duration_minutes || 0)}
                  </td>
                  <td className="px-6 py-4">
                    {entry.is_billed ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        Billed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        Unbilled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="font-medium text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                      disabled={entry.is_billed}
                      title={entry.is_billed ? "Cannot edit billed time" : ""}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(entry.id)}
                      className="font-medium text-red-600 hover:text-red-900 disabled:opacity-50"
                      disabled={entry.is_billed}
                      title={entry.is_billed ? "Cannot delete billed time" : ""}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <TimeEntryForm
          projects={projects}
          initialValues={
            editingEntry && {
              project_id: editingEntry.project_id,
              description: editingEntry.description,
              date: editingEntry.start_time.split("T")[0],
              duration_minutes: editingEntry.duration_minutes || 0,
            }
          }
          onSubmit={handleSubmit}
          onClose={() => {
            setOpen(false);
            setEditingEntry(undefined);
          }}
          isSubmitting={creating || updating}
        />
      )}

      {deletingId && (
        <DeleteConfirmModal
          title="Delete Time Entry"
          description="Are you sure you want to delete this time entry? This action cannot be undone."
          isDeleting={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
