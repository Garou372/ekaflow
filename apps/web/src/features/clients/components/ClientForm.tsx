import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  company: z.string().optional(),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

type ClientFormProps = {
  initialData?: ClientFormData;
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData,
  });

  const isEditing = !!initialData;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Client" : "New Client"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>

                <input
                  {...register("name")}
                  className="w-full rounded-lg border px-3 py-2"
                />

                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>

                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-lg border px-3 py-2"
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>

                <input
                  {...register("phone")}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Company
                </label>

                <input
                  {...register("company")}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                GST Number
              </label>

              <input
                {...register("gst_number")}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Address</label>

              <textarea
                rows={3}
                {...register("address")}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Notes</label>

              <textarea
                rows={4}
                {...register("notes")}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t bg-gray-50 p-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
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
