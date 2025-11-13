import { inject, type InjectionKey } from "vue";
import type { AdvancedCardGenerationTabName } from "@/features/VirtualCards/modals/cards/VCAdvancedCardGenerationModal.vue";

export type WalletPageContext = {
  showAdvancedCardGenerationModal: (options?: {
    period?: string;
    amount?: number;
    selectedTab?: AdvancedCardGenerationTabName;
  }) => void;
};

export const WalletPageKey: InjectionKey<WalletPageContext> =
  Symbol("WalletPageContext");

export function useWalletPageContext() {
  const context = inject(WalletPageKey);
  if (!context) throw new Error("WalletPageContext not provided");
  return context;
}
