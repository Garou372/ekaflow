import { Trash2 } from "lucide-react";

export type ProposalItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

type ProposalItemsProps = {
  items: ProposalItem[];
  onChange: (items: ProposalItem[]) => void;
};

export default function ProposalItems({ items, onChange }: ProposalItemsProps) {
  function updateItem(
    index: number,
    field: keyof ProposalItem,
    value: string | number,
  ) {
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      [field]: field === "description" ? value : Number(value),
    };

    onChange(updated);
  }

  function addItem() {
    onChange([
      ...items,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Services</h2>

        <button
          type="button"
          onClick={addItem}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          + Add Item
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-lg border p-4 md:grid-cols-12"
          >
            <div className="md:col-span-5">
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <input
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Qty</label>

              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div className="md:col-span-3">
              <label className="mb-2 block text-sm font-medium">
                Unit Price
              </label>

              <input
                type="number"
                min={0}
                value={item.unit_price}
                onChange={(e) =>
                  updateItem(index, "unit_price", e.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div className="flex items-end justify-between md:col-span-2">
              <div className="font-semibold">
                ₹{(item.quantity * item.unit_price).toFixed(2)}
              </div>

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
