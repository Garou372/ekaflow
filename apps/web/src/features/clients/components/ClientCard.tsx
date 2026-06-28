import type { Client } from "../../../services/client.service";

type ClientCardProps = {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onViewHistory?: (client: Client) => void;
};

export default function ClientCard({
  client,
  onEdit,
  onDelete,
  onViewHistory,
}: ClientCardProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
              {client.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="text-lg font-semibold">{client.name}</h3>

              {client.company && (
                <p className="text-sm text-gray-500">{client.company}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm text-gray-600">
          <p>
            <span className="font-medium">Email:</span> {client.email}
          </p>

          {client.phone && (
            <p>
              <span className="font-medium">Phone:</span> {client.phone}
            </p>
          )}

          {client.gst_number && (
            <p>
              <span className="font-medium">GST:</span> {client.gst_number}
            </p>
          )}

          {client.address && (
            <p>
              <span className="font-medium">Address:</span> {client.address}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
        {onViewHistory && (
          <button
            onClick={() => onViewHistory(client)}
            className="mr-auto rounded-lg px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            History
          </button>
        )}

        <button
          onClick={() => client.id && onDelete(client.id)}
          className="rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50"
        >
          Delete
        </button>

        <button
          onClick={() => onEdit(client)}
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
