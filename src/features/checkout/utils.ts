import type { Plan, PlanType } from "@/features/subscribe/types.ts";

export const getPlanType = (plan: Plan): PlanType =>
  plan.max_members === 1
    ? "individual"
    : plan.max_members === 2
      ? "couple"
      : "family";

export const isFamily3Plan = (plan: Plan) => {
  if (plan.max_members === 3) return true;

  const id = String(plan.product_id).toLowerCase();
  if (id.includes("family-3")) return true;

  return false;
};
