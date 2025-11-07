<script setup lang="ts">
import { computed } from "vue";
import VCBaseCard from "@/features/VirtualCards/base/card/VCBaseCard.vue";
import BaseText from "@/library/BaseText.vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import useVirtualCard from "@/features/VirtualCards/composables/useVirtualCard";

type Props = {
  cardId: string;
  selected?: boolean;
  description?: string;
  iconSize?: number;
  loading?: boolean;
  disabled?: boolean;
};

const emit = defineEmits(["select"]);
const props = withDefaults(defineProps<Props>(), {
  selected: false,
  description: "",
  iconSize: 40,
});

const { card: cardRef, cardIdentity } = useVirtualCard(() => props.cardId);

const maskedPan = computed(() => `••• ${cardRef.value?.pan.slice(-4)}`);

const iconOverride = computed(() => ({
  height: `${props.iconSize}px`,
  width: `${props.iconSize}px`,
}));

const handleSelect = () => {
  if (props.loading || props.disabled) return;
  emit("select");
};
</script>

<template>
  <div
    class="vc-card-selectable"
    :class="{
      'vc-card-selectable--selected': props.selected,
      'vc-card-selectable--loading': props.loading,
      'vc-card-selectable--disabled': props.disabled,
    }"
  >
    <VCBaseCard
      :clickable="!props.loading && !props.disabled"
      :border="{ focused: props.selected }"
      @click="handleSelect"
    >
      <div class="vc-card-selectable__body">
        <div class="vc-card-selectable__brand">
          <IdentityIcon
            :identity="cardIdentity"
            :override="iconOverride"
          />
        </div>
        <div class="vc-card-selectable__content">
          <BaseText
            variant="headline-6-bold"
            class="vc-card-selectable__name"
          >
            {{ cardRef?.identity_name || "(Unnamed)" }}
          </BaseText>
          <BaseText
            v-if="props.description"
            variant="body-2-semibold"
            class="vc-card-selectable__description"
          >
            {{ props.description }}
          </BaseText>
        </div>
        <div class="vc-card-selectable__meta">
          <BaseText
            variant="body-2-semibold"
            class="vc-card-selectable__last4"
          >
            {{ maskedPan }}
          </BaseText>
          <transition
            name="vc-icon-switch"
            mode="out-in"
          >
            <span
              v-if="props.loading"
              key="loading"
              class="vc-card-selectable__spinner"
            ></span>
            <span
              v-else
              key="radio"
              class="vc-card-selectable__radio"
            >
              <span class="vc-card-selectable__radio-bg" />
              <InlineSvg
                name="check"
                class="vc-card-selectable__radio-check"
              />
            </span>
          </transition>
        </div>
      </div>
    </VCBaseCard>
  </div>
</template>

<style scoped lang="scss">
.vc-card-selectable {
  cursor: pointer;
  transition: opacity 0.15s ease-in-out;

  &--loading {
    cursor: default;
  }

  &--disabled {
    cursor: default;
    opacity: 0.5;
  }

  &__body {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 16px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    color: $color-base-black-100;
  }

  &__description {
    color: $color-primary-70;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__last4 {
    color: $color-primary-70;
  }

  &__radio {
    position: relative;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid $color-primary-100;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      border-color 120ms ease,
      background-color 120ms ease,
      opacity 120ms ease;

    .vc-card-selectable--selected:hover & {
      opacity: 0.7;
    }

    &-bg {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: $color-primary-100;
      opacity: 0;
      transform: scale(0.5);
      transition:
        opacity 120ms ease,
        transform 120ms ease;

      .vc-card-selectable--selected & {
        opacity: 1;
        transform: scale(1.05);
      }
    }

    &-check {
      width: 10px;
      height: 10px;
      color: $color-base-white-100;
      opacity: 0;
      transform: scale(0.5);
      transition:
        opacity 120ms ease,
        transform 120ms ease;
      transition-delay: 100ms;

      .vc-card-selectable--selected & {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  &__spinner {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(currentcolor 40%, transparent 70%);
    mask: radial-gradient(closest-side, transparent 70%, black 70%);
    animation: vc-card-rotate 0.5s linear infinite;
  }
}

@keyframes vc-card-rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.vc-icon-switch-enter-from,
.vc-icon-switch-leave-to {
  opacity: 0.6;
  filter: blur(1.2px);
  transform: translateY(1px) scale(0.8);
  transform-origin: center;
}

.vc-icon-switch-enter-to,
.vc-icon-switch-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
  transform-origin: center;
}

.vc-icon-switch-enter-active,
.vc-icon-switch-leave-active {
  transition:
    opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.1s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .vc-icon-switch-enter-active,
  .vc-icon-switch-leave-active {
    transition-duration: 1ms;
  }
}
</style>
