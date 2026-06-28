export type PortalEntityType = "proposal" | "invoice";

export interface PortalToken {
  id: string;
  token: string;
  client_id: string;
  entity_type: PortalEntityType;
  entity_id: string;
  expires_at: string;
  is_revoked: boolean;
  created_at: string;
}

export type CreatePortalTokenPayload = Omit<PortalToken, "id" | "token" | "created_at" | "is_revoked">;
