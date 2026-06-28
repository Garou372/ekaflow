import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Project } from "../../projects/types/project";
import type { CreateExpensePayload } from "../types/expense";

const expenseSchema = z.object({
  project_id: z.string().nullish(),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().nullish(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

const EXPENSE_CATEGORIES = [
  "Software/Subscriptions",
  "Hardware",
  "Office Supplies",
  "Travel",
  "Meals",
  "Marketing",
  "Contractors",
  "Other",
];

type Props = {
  projects: Project[];
  initialValues?: Partial<ExpenseFormData>;
  onSubmit: (data: CreateExpensePayload) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
};

export default function ExpenseForm({
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
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
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

  async function submit(data: ExpenseFormData) {
    const payload: CreateExpensePayload = {
      project_id: data.project_id || null,
      amount: data.amount,
      category: data.category,
      date: data.date,
      description: data.description || null,
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
            {initialValues ? "Edit Expense" : "New Expense"}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                {...register("amount")}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                {...register("date")}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
            <select
              {...register("category")}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
            >
              <option value="">Select category...</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Project (Optional)</label>
            <select
              {...register("project_id")}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
            >
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register("description")}
              rows={2}
              placeholder="What was this expense for?"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-600"
            />
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
              {isSubmitting ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
