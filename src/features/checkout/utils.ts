import type { Plan, PlanType } from "@/features/subscribe/types.ts";

export const getPlanType = (plan: Plan): PlanType =>
  plan.max_members === 1
    ? "individual"
    : plan.max_members === 2
      ? "couple"
      : "family";
