import type { BaseIconName } from "@/library/baseIconTypes";
import {
  inject,
  type Component,
  type InjectionKey,
  type ComputedRef,
  type Ref,
} from "vue";
import type { RouteLocationRaw } from "vue-router";

export type WalletPageSlot = "header-actions";

export type WalletRouterViewNavigation = {
  title?: string;
  icon?: BaseIconName;
  showBackButton?: boolean;
  backTo?: RouteLocationRaw;
  preserveWhileSameViewKey?: boolean;
};

export type WalletRouterViewContext = {
  setSlot: (
    name: WalletPageSlot,
    component?: Component,
    props?: Record<string, unknown>,
    preserveWhileSameViewKey?: boolean
  ) => void;
  setNavigation: (navigation: Partial<WalletRouterViewNavigation>) => void;
  routerViewScrollContainer: ComputedRef<HTMLDivElement>;
  routerViewWidth: Ref<number>;
};

export const WalletRouterViewKey: InjectionKey<WalletRouterViewContext> =
  Symbol("WalletRouterViewContext");

export function useWalletRouterViewContext() {
  const context = inject(WalletRouterViewKey);
  if (!context) throw new Error("WalletRouterViewContext not provided");
  return context;
}
