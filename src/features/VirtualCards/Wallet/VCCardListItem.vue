<script setup lang="ts">
import type { VirtualCard } from "@/types/Wallet/virtual-card";
import { useRoute } from "vue-router";
import { computed } from "vue";
import useVirtualCard from "../composables/useVirtualCard";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import BaseText from "@/library/BaseText.vue";
import VCBaseCardAction from "@/features/VirtualCards/base/card/VCBaseCardAction.vue";
import VCBaseCircularProgress from "@/features/VirtualCards/base/VCBaseCircularProgress.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import useVirtualCardLimit from "../composables/useVirtualCardLimit";

type Props = { card: VirtualCard; animateOnMount?: boolean };

const props = withDefaults(defineProps<Props>(), {
  animateOnMount: true,
});

const route = useRoute();
const { cardIdentity, isLocked, isCanceled } = useVirtualCard(() => props.card);

const { formattedAvailableLimit, availableLimitPercentage } =
  useVirtualCardLimit(() => props.card);

const isActive = computed(() => route.params.id === props.card.id);

const pan = computed(() => `•••• ${props.card?.pan?.slice(-4) ?? ""}`);

const iconName = computed(() => {
  if (isCanceled.value) return null;
  if (isLocked.value) return "lock";
  return null;
});

const backgroundColor = computed(() => {
  if (isActive.value) return "var(--color-primary-5)";
  if (isCanceled.value) return "var(--color-primary-10)";
  return "transparent";
});
</script>

<template>
  <router-link
    :to="`/virtual-cards/wallet/card/${card.id}`"
    active-class="vc-card-list-item--active"
    class="vc-card-list-item"
    :class="{
      'vc-card-list-item--locked': isLocked,
      'vc-card-list-item--canceled': isCanceled,
    }"
  >
    <VCBaseCardAction
      :icon="null"
      :border="{ focused: isActive }"
      :body-style="{
        padding: '16px',
        backgroundColor: backgroundColor,
      }"
    >
      <template #left>
        <div class="vc-card-list-item__body">
          <div class="vc-card-list-item__identity-container">
            <VCBaseCircularProgress
              v-if="!isCanceled"
              :progress="availableLimitPercentage"
              :size="48"
              :stroke="6"
              :animate-on-mount="animateOnMount"
            >
              <IdentityIcon
                :identity="cardIdentity"
                :override="{
                  height: '38px',
                  width: '38px',
                  border: 'none',
                }"
              />
            </VCBaseCircularProgress>
            <IdentityIcon
              v-else
              :identity="cardIdentity"
              :override="{
                height: '47px',
                width: '47px',
                border: 'none',
              }"
            />
          </div>

          <div class="vc-card-list-item__content">
            <div class="vc-card-list-item__name-container">
              <BaseText
                variant="headline-6-bold"
                class="vc-card-list-item__name-text"
              >
                {{ card.identity_name || "Unnamed" }}
              </BaseText>
              <BaseIcon
                v-if="iconName"
                :name="iconName"
                class="vc-card-list-item__name-icon"
              />
            </div>
            <BaseText
              v-if="!isCanceled && !isLocked"
              variant="body-2-semibold"
              class="vc-card-list-item__available"
            >
              {{ formattedAvailableLimit }} Available
            </BaseText>
          </div>

          <div class="vc-card-list-item__last4-container">
            <BaseText
              variant="headline-5-bold"
              class="vc-card-list-item__last4"
            >
              {{ pan }}
            </BaseText>
          </div>
        </div>
      </template>
    </VCBaseCardAction>
  </router-link>
</template>

<style scoped lang="scss">
.vc-card-list-item {
  display: block;
  border-radius: 16px;
  transition: box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1);

  &--active {
    box-shadow: 0 10px 24px 0 rgba($color-primary-1-dark, 0.15);

    @at-root .theme-dark & {
      box-shadow: 0 10px 24px 0 rgba($color-primary-1-light, 0.15);
    }
  }

  &__body {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 8px;
  }

  &__identity-container {
    flex-shrink: 0;

    .vc-card-list-item--canceled & {
      filter: grayscale(100%);
    }
  }

  &__content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    &-container {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 8px;

      .vc-card-list-item--locked & {
        width: 95%;
      }
    }

    &-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }

    &-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  }

  &__available {
    display: block;
    color: $color-primary-50;
  }

  &__last4-container {
    flex: 0 0 auto;
    width: 72px;
    justify-content: flex-end;
    align-items: flex-end;
    display: flex;
  }

  &__last4 {
    font-variant-numeric: tabular-nums;
  }
}
</style>
