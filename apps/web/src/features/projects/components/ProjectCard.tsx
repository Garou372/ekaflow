import { Folder, Clock, CheckCircle, PauseCircle } from "lucide-react";
import type { Project } from "../types/project";
import { formatCurrency } from "../../invoices/utils/currency";

type Props = {
  project: Project;
  clientName?: string;
  unbilledMinutes?: number;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onInvoiceTime?: (project: Project) => void;
};

export default function ProjectCard({
  project,
  clientName,
  unbilledMinutes = 0,
  onEdit,
  onDelete,
  onInvoiceTime,
}: Props) {
  const isCompleted = project.status === "completed";
  const isOnHold = project.status === "on_hold";

  return (
    <div className="rounded-xl border bg-white shadow-sm transition hover:shadow-md flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-600"
                  : isOnHold
                    ? "bg-amber-100 text-amber-600"
                    : "bg-indigo-100 text-indigo-600"
              }`}
            >
              {isCompleted ? (
                <CheckCircle size={20} />
              ) : isOnHold ? (
                <PauseCircle size={20} />
              ) : (
                <Folder size={20} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 leading-tight">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500">{clientName || "Unknown Client"}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
              isCompleted
                ? "bg-emerald-50 text-emerald-700"
                : isOnHold
                  ? "bg-amber-50 text-amber-700"
                  : "bg-indigo-50 text-indigo-700"
            }`}
          >
            {project.status.replace("_", " ")}
          </span>
        </div>

        {project.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {project.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-500 mt-auto">
          {project.budget !== null && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">Budget</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(project.budget)}
              </span>
            </div>
          )}
          {project.hourly_rate !== null && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">Rate</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(project.hourly_rate)}/hr
              </span>
            </div>
          )}
          {project.due_date && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">Due Date</span>
              <span className="flex items-center gap-1 text-gray-700">
                <Clock size={12} /> {new Date(project.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {unbilledMinutes > 0 && (
            <div className="flex flex-col">
              <span className="text-xs text-amber-500 font-medium">Unbilled Time</span>
              <span className="font-medium text-amber-600">
                {Math.floor(unbilledMinutes / 60)}h {unbilledMinutes % 60}m
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
        {unbilledMinutes > 0 && onInvoiceTime && (
          <button
            onClick={() => onInvoiceTime(project)}
            className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors mr-auto"
          >
            Invoice Time
          </button>
        )}
        <button
          onClick={() => onDelete(project.id)}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ${unbilledMinutes > 0 ? "" : "mr-auto"}`}
        >
          Delete
        </button>
        <button
          onClick={() => onEdit(project)}
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
