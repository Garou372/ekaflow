export type ProjectStatus = "active" | "completed" | "on_hold";

export type Project = {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  hourly_rate: number | null;
  start_date: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
};

export type CreateProjectPayload = Omit<Project, "id" | "created_at">;
