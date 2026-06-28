import type {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
} from "react-hook-form";

import type { InvoiceFormValues } from "../validation/invoice.schema";

type Props = {
  fields: FieldArrayWithId<InvoiceFormValues, "lineItems", "id">[];
  register: UseFormRegister<InvoiceFormValues>;
  remove: UseFieldArrayRemove;
  append: UseFieldArrayAppend<InvoiceFormValues, "lineItems">;
};

export default function InvoiceItems({
  fields,
  register,
  remove,
  append,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="hidden grid-cols-12 gap-4 text-sm font-medium text-gray-500 md:grid">
        <div className="col-span-6">Description</div>
        <div className="col-span-2 text-right">Qty</div>
        <div className="col-span-3 text-right">Unit Price</div>
        <div className="col-span-1" />
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <input
              {...register(`lineItems.${index}.description`)}
              placeholder="Service or Product"
              className="h-10 w-full rounded-md border border-gray-300 px-3 outline-none focus:border-gray-900"
            />
          </div>

          <div className="col-span-4 md:col-span-2">
            <input
              type="number"
              min={1}
              step="1"
              {...register(`lineItems.${index}.quantity`)}
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-right outline-none focus:border-gray-900"
            />
          </div>

          <div className="col-span-6 md:col-span-3">
            <input
              type="number"
              min={0}
              step="0.01"
              {...register(`lineItems.${index}.unitPrice`)}
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-right outline-none focus:border-gray-900"
            />
          </div>

          <div className="col-span-2 flex items-center justify-end md:col-span-1">
            <button
              type="button"
              onClick={() => remove(index)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Remove Item"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({
            description: "",
            quantity: 1,
            unitPrice: 0,
          })
        }
        className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium transition-colors hover:bg-gray-100"
      >
        Add Item
      </button>
    </div>
  );
}
