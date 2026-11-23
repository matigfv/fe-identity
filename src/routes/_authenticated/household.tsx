import { createFileRoute } from "@tanstack/react-router";
import HouseholdTree from "@/components/household/HouseholdTree";

export const Route = createFileRoute("/_authenticated/household")({
  component: HouseholdTree,
});
