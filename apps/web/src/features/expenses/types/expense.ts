export type Expense = {
  id: string;
  project_id: string | null;
  amount: number;
  category: string;
  date: string;
  description: string | null;
  created_at: string;
};

export type CreateExpensePayload = Omit<Expense, "id" | "created_at">;
