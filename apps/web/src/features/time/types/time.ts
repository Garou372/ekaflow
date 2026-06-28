export type TimeEntry = {
  id: string;
  project_id: string;
  description: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  is_billed: boolean;
  created_at: string;
};

export type CreateTimeEntryPayload = Omit<TimeEntry, "id" | "created_at" | "is_billed"> & {
  is_billed?: boolean;
};

export type UpdateTimeEntryPayload = Partial<Omit<TimeEntry, "id" | "created_at">>;
