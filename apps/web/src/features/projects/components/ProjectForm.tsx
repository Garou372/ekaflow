import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Client } from "../../../services/client.service";
import type { CreateProjectPayload } from "../types/project";
import AttachmentPanel from "../../../components/common/AttachmentPanel";

const projectSchema = z.object({
  client_id: z.string().min(1, "Please select a client."),
  name: z.string().min(1, "Project name is required."),
  description: z.string().nullish(),
  status: z.enum(["active", "completed", "on_hold"]).optional(),
  budget: z.coerce.number().min(0).nullish(),
  hourly_rate: z.coerce.number().min(0).nullish(),
  start_date: z.string().nullish(),
  due_date: z.string().nullish(),
  notes: z.string().nullish(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

type Props = {
  clients: Client[];
  initialValues?: Partial<ProjectFormData> & { id?: string };
  onSubmit: (data: CreateProjectPayload) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
};

export default function ProjectForm({
  clients,
  initialValues,
  onSubmit,
  onClose,
  isSubmitting,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: initialValues || {
      status: "active",
    },
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function submit(data: ProjectFormData) {
    const payload: CreateProjectPayload = {
      client_id: data.client_id,
      name: data.name,
      description: data.description || null,
      status: data.status || "active",
      budget: data.budget || null,
      hourly_rate: data.hourly_rate || null,
      start_date: data.start_date || null,
      due_date: data.due_date || null,
      notes: data.notes || null,
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
        className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-5 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">
            {initialValues ? "Edit Project" : "New Project"}
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Client *</label>
            <select
              {...register("client_id")}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
            >
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ""}
                </option>
              ))}
            </select>
            {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Project Name *</label>
            <input
              {...register("name")}
              placeholder="e.g. Website Redesign"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register("description")}
              rows={2}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                {...register("status")}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600 capitalize"
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
              <input
                type="number"
                step="0.01"
                {...register("hourly_rate")}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                {...register("start_date")}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                {...register("due_date")}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Fixed Budget ($)</label>
            <input
              type="number"
              step="0.01"
              {...register("budget")}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
            />
          </div>

          {initialValues?.id && (
            <div className="pt-2">
              <AttachmentPanel entityType="project" entityId={initialValues.id} />
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
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
              {isSubmitting ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
