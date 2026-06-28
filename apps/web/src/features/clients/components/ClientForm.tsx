import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { Tag, X } from "lucide-react";
import type { ClientPriority } from "../../../services/client.service";
import AttachmentPanel from "../../../components/common/AttachmentPanel";

export const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  company: z.string().optional(),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  // CRM fields
  priority: z.enum(["vip", "high", "normal", "low"]).optional(),
  tags: z.array(z.string()).optional(),
  next_follow_up_at: z.string().optional(),
  is_favorite: z.boolean().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

const PRIORITY_OPTIONS: { value: ClientPriority; label: string; color: string }[] = [
  { value: "vip", label: "VIP", color: "text-amber-600" },
  { value: "high", label: "High Priority", color: "text-indigo-600" },
  { value: "normal", label: "Normal", color: "text-gray-600" },
  { value: "low", label: "Low Priority", color: "text-slate-500" },
];

type ClientFormProps = {
  initialData?: Partial<ClientFormData>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
};

export default function ClientForm({
  initialData,
  isSubmitting,
  onClose,
  onSubmit,
}: ClientFormProps) {
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      priority: "normal",
      tags: [],
      is_favorite: false,
      ...initialData,
    },
  });

  const tags = watch("tags") ?? [];
  const isEditing = !!initialData?.id || !!initialData?.email;

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim().toLowerCase();
      if (trimmed && !tags.includes(trimmed)) {
        setValue("tags", [...tags, trimmed]);
      }
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setValue("tags", tags.filter((t) => t !== tag));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-12"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Client" : "New Client"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 p-6">
            {/* Name + Email */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder="Priya Sharma"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="priya@company.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Phone + Company */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  {...register("phone")}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Company</label>
                <input
                  {...register("company")}
                  placeholder="ABC Technologies Pvt. Ltd."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Priority + Follow-up */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Priority</label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {PRIORITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Next Follow-up
                </label>
                <input
                  type="date"
                  {...register("next_follow_up_at")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Tags <span className="text-xs text-gray-400">(press Enter to add)</span>
              </label>
              <div className="min-h-[42px] flex flex-wrap gap-1.5 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                  >
                    <Tag size={10} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 text-indigo-400 hover:text-indigo-700"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={tags.length === 0 ? "e-commerce, retainer, startup..." : ""}
                  className="min-w-[100px] flex-1 border-none bg-transparent text-sm outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {/* GST Number */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                GST Number
              </label>
              <input
                {...register("gst_number")}
                placeholder="22AAAAA0000A1Z5"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Address</label>
              <textarea
                rows={2}
                {...register("address")}
                placeholder="123, Business Park, Bengaluru, Karnataka 560001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Internal Notes
              </label>
              <textarea
                rows={3}
                {...register("notes")}
                placeholder="Any internal notes about this client..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {isEditing && initialData?.id && (
              <div className="px-5 pb-5">
                <AttachmentPanel entityType="client" entityId={initialData.id} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t bg-gray-50 p-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
