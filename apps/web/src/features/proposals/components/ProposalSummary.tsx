type ProposalSummaryProps = {
  subtotal: number;
  tax: number;
  discount: number;
  onTaxChange: (value: number) => void;
  onDiscountChange: (value: number) => void;
};

export default function ProposalSummary({
  subtotal,
  tax,
  discount,
  onTaxChange,
  onDiscountChange,
}: ProposalSummaryProps) {
  const total = subtotal + tax - discount;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-5">
      <h2 className="text-lg font-semibold">Summary</h2>

      <div className="flex items-center justify-between">
        <span>Subtotal</span>
        <span className="font-medium">₹ {subtotal.toFixed(2)}</span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tax</label>

        <input
          type="number"
          min={0}
          value={tax}
          onChange={(e) => onTaxChange(Number(e.target.value))}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Discount</label>

        <input
          type="number"
          min={0}
          value={discount}
          onChange={(e) => onDiscountChange(Number(e.target.value))}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between text-xl font-bold">
          <span>Total</span>

          <span>₹ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
