import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getMyHousehold } from "@/apis/household/HouseholdApi";

export const HOUSEHOLD_QUERY_KEY = ["household", "me"] as const;

// El 404 significa "todavía no tiene household": no tiene sentido reintentarlo.
export const isHouseholdNotFound = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 404;

export const useHousehold = () =>
  useQuery({
    queryKey: HOUSEHOLD_QUERY_KEY,
    queryFn: getMyHousehold,
    retry: (count, error) => !isHouseholdNotFound(error) && count < 2,
  });
