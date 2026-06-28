import { useState } from "react";
import type { Proposal } from "../../../services/proposal.service";
import type { Client } from "../../../services/client.service";
import { formatCurrency } from "../../invoices/utils/currency";

type Props = {
  proposal: Proposal;
  client: Client;
  onAccept: () => Promise<void>;
};

export default function PortalProposalView({ proposal, client, onAccept }: Props) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(proposal.status === "accepted");
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setIsAccepting(true);
    setError(null);
    try {
      await onAccept();
      setHasAccepted(true);
    } catch (err) {
      setError("Failed to accept proposal. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="space-y-6">
      {hasAccepted && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Proposal Accepted</h3>
            <p className="text-sm">Thank you! The freelancer has been notified.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b bg-gray-50 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
              <p className="text-gray-500 mt-1">Prepared for {client.name}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                hasAccepted ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
              }`}>
                {hasAccepted ? "Accepted" : "Awaiting Approval"}
              </span>
              <p className="text-gray-400 text-sm mt-2">
                Date: {new Date(proposal.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">
          {proposal.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Overview
              </h3>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                {proposal.notes}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Proposed Items
            </h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500 rounded-tl-lg rounded-bl-lg">Description</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Rate</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 rounded-tr-lg rounded-br-lg">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {proposal.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4 text-gray-900">{item.description}</td>
                    <td className="px-4 py-4 text-right text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-gray-600">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <div className="w-64 space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(proposal.subtotal)}</span>
              </div>
              {proposal.discount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Discount</span>
                  <span>-{formatCurrency(proposal.discount)}</span>
                </div>
              )}
              {proposal.tax > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span>+{formatCurrency(proposal.tax)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 font-semibold text-gray-900 text-lg">
                <span>Total</span>
                <span>{formatCurrency(proposal.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        {!hasAccepted && (
          <div className="bg-gray-50 p-6 md:p-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 text-center md:text-left max-w-lg">
              By clicking "Approve & Accept", you agree to the terms outlined in this proposal and authorize the project to begin.
            </p>
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="w-full md:w-auto rounded-lg bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isAccepting ? "Processing..." : "Approve & Accept"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
