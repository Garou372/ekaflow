import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  checkPortalAccess,
  getPortalEntity,
  acceptPortalProposal,
} from "../../../services/portal.service";
import type { PortalToken } from "../types/portal";
import type { Client } from "../../../services/client.service";
import PortalProposalView from "../components/PortalProposalView";

export default function PortalDashboardPage() {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tokenInfo, setTokenInfo] = useState<PortalToken | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [entity, setEntity] = useState<any | null>(null);
  const [alreadyAcceptedProposal, setAlreadyAcceptedProposal] = useState(false);

  useEffect(() => {
    async function loadPortal() {
      if (!token) return;
      setLoading(true);
      setError(null);
      setAlreadyAcceptedProposal(false);

      try {
        const access = await checkPortalAccess(token);

        if (access.denied) {
          // A revoked token on a proposal can mean it was already accepted
          // (acceptPortalProposal revokes the token after use), rather than
          // the link being unavailable. Check the underlying proposal so we
          // can show a friendly confirmation instead of "Access Denied".
          if (
            access.reason === "revoked" &&
            access.token?.entity_type === "proposal"
          ) {
            const { client: revokedClient, entity: revokedEntity } =
              await getPortalEntity(access.token);
            if (revokedClient && revokedEntity?.status === "accepted") {
              setClient(revokedClient);
              setAlreadyAcceptedProposal(true);
              return;
            }
          }

          setError(
            access.reason === "expired"
              ? "This link has expired. Please ask your freelancer to send a new one."
              : access.reason === "revoked"
                ? "This link has been revoked and is no longer accessible."
                : "Invalid link.",
          );
          return;
        }

        setTokenInfo(access.token);

        const { client, entity } = await getPortalEntity(access.token!);
        if (!client || !entity) {
          setError("Failed to load secure document.");
          return;
        }

        setClient(client);
        setEntity(entity);
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    loadPortal();
  }, [token]);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading secure portal...
      </div>
    );
  }

  if (alreadyAcceptedProposal) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Already Accepted
        </h2>
        <p className="text-gray-500">
          {client ? `Thanks, ${client.name}! ` : ""}This proposal has already
          been accepted.
        </p>
      </div>
    );
  }

  if (error || !tokenInfo || !client) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">{error || "Invalid link."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {client.name}
        </h1>
        <p className="text-gray-500">Review your documents securely below.</p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold uppercase text-gray-500 tracking-wide">
            {tokenInfo.entity_type} details
          </h2>
        </div>

        {tokenInfo.entity_type === "proposal" && entity && (
          <PortalProposalView
            proposal={entity}
            client={client}
            onAccept={async () => {
              await acceptPortalProposal(token!);
            }}
          />
        )}

        {tokenInfo.entity_type === "invoice" && (
          <div className="text-gray-700">
            <p>This is a secure view for your invoice.</p>
            <p className="mt-2 text-sm text-gray-500">
              Document ID: {tokenInfo.entity_id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
