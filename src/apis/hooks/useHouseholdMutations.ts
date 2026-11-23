import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addHouseholdMember,
  changeHouseholdMemberLevel,
  createHousehold,
  removeHouseholdMember,
} from "@/apis/household/HouseholdApi";
import { HOUSEHOLD_QUERY_KEY } from "@/apis/hooks/useHousehold";
import type { Household } from "@/models/Household";

// Toda mutación devuelve el HouseholdDTO completo y actualizado: se guarda tal cual en la caché.
const useHouseholdMutation = <V>(fn: (variables: V) => Promise<Household>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (household) => queryClient.setQueryData(HOUSEHOLD_QUERY_KEY, household),
  });
};

export const useCreateHousehold = () => useHouseholdMutation((name: string) => createHousehold(name));

export const useAddHouseholdMember = () =>
  useHouseholdMutation((v: { email: string; level: number }) => addHouseholdMember(v.email, v.level));

export const useChangeHouseholdMemberLevel = () =>
  useHouseholdMutation((v: { userId: number; level: number }) =>
    changeHouseholdMemberLevel(v.userId, v.level),
  );

export const useRemoveHouseholdMember = () =>
  useHouseholdMutation((userId: number) => removeHouseholdMember(userId));
