import { useMemo, useState } from "react";
import { formatCurrency } from "../../invoices/utils/currency";
import PageHeader from "../../../components/common/PageHeader";
import ExpenseForm from "../components/ExpenseForm";
import type { Expense } from "../types/expense";
import type { CreateExpensePayload } from "../types/expense";
import useExpenses from "../../../hooks/useExpenses";
import useProjects from "../../../hooks/useProjects";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";

export default function ExpensesPage() {
  const {
    expenses,
    isLoading,
    createExpense,
    updateExpense,
    deleteExpense,
    creating,
    updating,
    deleting,
  } = useExpenses();

  const { projects } = useProjects();

  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const q = search.toLowerCase();
      const projName = projects.find((p) => p.id === expense.project_id)?.name?.toLowerCase() || "";
      return (
        expense.category.toLowerCase().includes(q) ||
        projName.includes(q) ||
        (expense.description && expense.description.toLowerCase().includes(q))
      );
    });
  }, [expenses, search, projects]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  async function handleSubmit(payload: CreateExpensePayload) {
    if (editingExpense) {
      await updateExpense({ id: editingExpense.id, payload });
    } else {
      await createExpense(payload);
    }
    setEditingExpense(undefined);
    setOpen(false);
  }

  function handleEdit(expense: Expense) {
    setEditingExpense(expense);
    setOpen(true);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      await deleteExpense(deletingId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" description="Track your business expenses.">
        <button
          onClick={() => {
            setEditingExpense(undefined);
            setOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          + Log Expense
        </button>
      </PageHeader>

      <div className="flex items-center justify-between gap-4">
        <input
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border px-4 py-2"
        />
        <div className="text-right">
          <span className="text-sm text-gray-500 mr-2">Total</span>
          <span className="text-xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : filteredExpenses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center bg-white">
          <h3 className="text-xl font-semibold text-gray-900">No Expenses Found</h3>
          <p className="mt-2 text-gray-500">Log your first expense to keep track of costs.</p>
          <button
            onClick={() => setOpen(true)}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Log Expense
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 font-medium text-gray-500">Category</th>
                <th className="px-6 py-4 font-medium text-gray-500">Project</th>
                <th className="px-6 py-4 font-medium text-gray-500">Description</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {projects.find((p) => p.id === expense.project_id)?.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                    {expense.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(expense.id)}
                      className="font-medium text-red-600 hover:text-red-900"
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
        <ExpenseForm
          projects={projects}
          initialValues={
            editingExpense && {
              project_id: editingExpense.project_id,
              amount: editingExpense.amount,
              category: editingExpense.category,
              date: editingExpense.date,
              description: editingExpense.description,
            }
          }
          onSubmit={handleSubmit}
          onClose={() => {
            setOpen(false);
            setEditingExpense(undefined);
          }}
          isSubmitting={creating || updating}
        />
      )}

      {deletingId && (
        <DeleteConfirmModal
          title="Delete Expense"
          description="Are you sure you want to delete this expense? This will affect your profit calculations."
          isDeleting={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
