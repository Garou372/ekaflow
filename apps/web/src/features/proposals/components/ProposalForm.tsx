import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import ProposalDetails from "./ProposalDetails";
import type { ProposalDetailsForm } from "./ProposalDetails";
import AttachmentPanel from "../../../components/common/AttachmentPanel";

import ProposalItems from "./ProposalItems";
import type { ProposalItem } from "./ProposalItems";

import ProposalSummary from "./ProposalSummary";

const schema = z.object({
  title: z.string().min(2),
  client_id: z.string().min(1),
  status: z.enum(["draft", "sent", "accepted", "rejected"]),
  notes: z.string(),
});

type FormData = ProposalDetailsForm;

type Client = {
  id: string;
  name: string;
};

type ProposalFormProps = {
  clients: Client[];
  isSubmitting: boolean;

  initialValues?: {
    id?: string;
    title: string;
    client_id: string;
    status: "draft" | "sent" | "accepted" | "rejected";
    notes: string;
    items: ProposalItem[];
    tax: number;
    discount: number;
  };

  onSubmit: (payload: {
    title: string;
    client_id: string;
    status: "draft" | "sent" | "accepted" | "rejected";
    notes: string;
    items: ProposalItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  }) => Promise<void> | void;
};

export default function ProposalForm({
  clients,
  initialValues,
  onSubmit,
  isSubmitting,
}: ProposalFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      title: "",
      client_id: "",
      status: "draft",
      notes: "",
    },
  });

  const [items, setItems] = useState<ProposalItem[]>(
    initialValues?.items ?? [
      {
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ],
  );

  const [tax, setTax] = useState(initialValues?.tax ?? 0);

  const [discount, setDiscount] = useState(initialValues?.discount ?? 0);

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );
  }, [items]);

  const total = subtotal + tax - discount;

  async function submit(data: FormData) {
    await onSubmit({
      ...data,
      items,
      subtotal,
      tax,
      discount,
      total,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <ProposalDetails 
        register={register} 
        errors={errors} 
        clients={clients} 
        onInsertNotes={(text) => {
          const currentNotes = getValues("notes") || "";
          setValue("notes", currentNotes ? `${currentNotes}\n\n${text}` : text);
        }}
      />

      <ProposalItems items={items} onChange={setItems} />

      <ProposalSummary
        subtotal={subtotal}
        tax={tax}
        discount={discount}
        onTaxChange={setTax}
        onDiscountChange={setDiscount}
      />

      {initialValues?.id && (
        <AttachmentPanel entityType="proposal" entityId={initialValues.id} />
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Proposal"}
        </button>
      </div>
    </form>
  );
}
