import type { BaseIconName } from "@/library/baseIconTypes";
import { inject, type Component, type InjectionKey } from "vue";
import type { RouteLocationRaw } from "vue-router";

export type WalletPageSlot = "header-actions";

export type WalletNavigation = {
  title?: string;
  icon?: BaseIconName;
  showBackButton?: boolean;
  backTo?: RouteLocationRaw;
  preserveWhileSameViewKey?: boolean;
};

export type WalletContext = {
  // TODO: Remove this function once we rollout Express Card Generation
  handleNewCardIssued: () => void;
  setSlot: (
    name: WalletPageSlot,
    component?: Component,
    props?: Record<string, unknown>,
    preserveWhileSameViewKey?: boolean
  ) => void;
  setNavigation: (navigation: Partial<WalletNavigation>) => void;
};

export const WalletContextKey: InjectionKey<WalletContext> =
  Symbol("WalletContext");

export function useWalletPageContext() {
  const context = inject(WalletContextKey);
  if (!context) throw new Error("WalletContext not provided");
  return context;
}
