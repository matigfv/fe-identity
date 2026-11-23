import { api } from "@/apis/axios";
import type { Household } from "@/models/Household";

// GET /v1/households/me — 404 si quien invoca no tiene household.
export const getMyHousehold = () => api.get<Household>("/households/me").then((r) => r.data);

export const createHousehold = (name: string) =>
  api.post<Household>("/households", { name }).then((r) => r.data);

export const addHouseholdMember = (email: string, level: number) =>
  api.post<Household>("/households/members", { email, level }).then((r) => r.data);

export const changeHouseholdMemberLevel = (userId: number, level: number) =>
  api.patch<Household>(`/households/members/${userId}/level`, { level }).then((r) => r.data);

export const removeHouseholdMember = (userId: number) =>
  api.delete<Household>(`/households/members/${userId}`).then((r) => r.data);
