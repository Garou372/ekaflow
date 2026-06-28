import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Project } from "../../projects/types/project";
import type { CreateTimeEntryPayload, TimeEntry } from "../types/time";

const timeEntrySchema = z.object({
  project_id: z.string().min(1, "Project is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  duration_minutes: z.coerce.number().positive("Duration must be greater than zero"),
});

export type TimeEntryFormData = z.infer<typeof timeEntrySchema>;

type Props = {
  projects: Project[];
  initialValues?: Partial<TimeEntryFormData>;
  onSubmit: (data: CreateTimeEntryPayload) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
};

export default function TimeEntryForm({
  projects,
  initialValues,
  onSubmit,
  onClose,
  isSubmitting,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: initialValues || {
      date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function submit(data: TimeEntryFormData) {
    // For manual entry, start_time is just the date at 00:00:00 and end_time can be the same + duration
    // Actually, it doesn't matter too much for manual entries, we just need duration
    const startTime = new Date(data.date).toISOString();
    const endTime = new Date(new Date(data.date).getTime() + data.duration_minutes * 60000).toISOString();

    const payload: CreateTimeEntryPayload = {
      project_id: data.project_id,
      description: data.description,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: data.duration_minutes,
      is_billed: false,
    };
    await onSubmit(payload);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-semibold">
            {initialValues ? "Edit Time Entry" : "Manual Time Entry"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="p-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Project *</label>
            <select
              {...register("project_id")}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
            >
              <option value="">Select project...</option>
              {projects.filter(p => p.status !== "completed").map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.project_id && <p className="mt-1 text-sm text-red-600">{errors.project_id.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
            <input
              {...register("description")}
              placeholder="What did you work on?"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                {...register("date")}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Duration (mins) *</label>
              <input
                type="number"
                {...register("duration_minutes")}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
              />
              {errors.duration_minutes && <p className="mt-1 text-sm text-red-600">{errors.duration_minutes.message}</p>}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Time"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
