<script setup lang="ts">
import type { VCBaseCardProps } from "./VCBaseCard.vue";
import VCBaseCard from "./VCBaseCard.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import type { BaseIconName } from "@/library/baseIconTypes";
import type { CSSProperties } from "vue";
export type VCBaseCardInfoProps = VCBaseCardProps & {
  title?: string;
  description?: string;
  icon?: BaseIconName | null;
  bodyStyle?: CSSProperties;
};

const props = withDefaults(defineProps<VCBaseCardInfoProps>(), {
  title: "",
  description: "",
  icon: "info",
  bodyStyle: undefined,
});
</script>

<template>
  <VCBaseCard
    v-bind="props"
    title=""
    class="vc-base-card-info"
  >
    <div
      class="vc-base-card-info__body"
      :style="props.bodyStyle"
    >
      <div class="vc-base-card-info__left-container">
        <slot name="left">
          <slot name="icon">
            <BaseIcon
              v-if="props.icon"
              :name="props.icon"
              class="vc-base-card-info__icon"
            />
          </slot>
          <div class="vc-base-card-info__infos">
            <transition
              name="text"
              mode="out-in"
            >
              <BaseText
                v-if="props.title"
                :key="props.title"
                class="vc-base-card-info__title"
                variant="body-2-semibold"
              >
                {{ props.title }}
              </BaseText>
            </transition>
            <transition
              name="text"
              mode="out-in"
            >
              <slot
                :key="props.description"
                name="description"
              >
                <BaseText
                  v-if="props.description"
                  :key="props.description"
                  class="vc-base-card-info__description"
                  variant="body-small-medium"
                >
                  {{ props.description }}
                </BaseText>
              </slot>
            </transition>
          </div>
        </slot>
      </div>
      <div class="vc-base-card-info__right-container">
        <slot name="right" />
      </div>
    </div>
  </VCBaseCard>
</template>

<style scoped lang="scss">
.vc-base-card-info {
  &__body {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    min-height: inherit;
    border-radius: inherit;
  }

  &__left-container {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-grow: 1;
    min-width: 0;
  }

  &__right-container {
    display: flex;
    justify-content: flex-end;
  }

  &__icon {
    font-size: 26px;
    font-weight: 400;
    flex-shrink: 0;
    margin-top: -1px;
  }

  &__infos {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__description {
    color: $color-primary-50;
  }
}

.vc-base-card-info__title,
.vc-base-card-info__description {
  display: inline-block; /* avoid layout jitter during transforms */
  will-change: transform, opacity;
}

/* ENTER: fade in and rise slightly */
.text-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.text-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.text-enter-active {
  transition:
    opacity 140ms ease-out,
    transform 140ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* LEAVE: fade out and lift a touch for directionality */
.text-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.text-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.text-leave-active {
  transition:
    opacity 100ms ease-in,
    transform 100ms ease-in;
}

/* Tiny stagger so description follows the title */
.vc-base-card-info__description.text-enter-active {
  transition-delay: 30ms;
}

/* Respect reduced-motion preferences */
@media (prefers-reduced-motion: reduce) {
  .text-enter-active,
  .text-leave-active {
    transition-duration: 1ms;
  }

  .text-enter-from,
  .text-leave-to {
    transform: none;
  }
}
</style>
