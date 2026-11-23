// Espejo de HouseholdDTO de api-identity (GET /v1/households/me).
export interface HouseholdMember {
  userId: number;
  email: string;
  givenName: string | null;
  familyName: string | null;
  level: number;
  self: boolean;
  supervised: boolean;
  canManage: boolean;
}

export interface Household {
  id: number;
  name: string;
  canManage: boolean;
  members: HouseholdMember[];
}
