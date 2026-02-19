<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
const props = defineProps({
  step: {
    type: Number,
    required: true,
  },
});
</script>
<template>
  <div class="wrapper">
    <div
      class="item-wrapper"
      :class="{ active: props.step === 1 }"
    >
      <InlineSvg
        v-if="props.step > 1"
        name="check-active"
        class="header-icon"
      />
      <div
        v-else
        class="header-number"
      >
        1
      </div>
      <span class="header-step">Coverage</span>
    </div>
    <div
      class="item-wrapper"
      :class="{ active: props.step === 2 }"
    >
      <InlineSvg
        v-if="props.step > 2"
        name="check-active"
        class="header-icon"
      />
      <div
        v-else
        class="header-number"
      >
        2
      </div>
      <span class="header-step">Device Check</span>
    </div>
    <div
      class="item-wrapper"
      :class="{ active: props.step === 3 }"
    >
      <InlineSvg
        v-if="props.step > 3"
        name="check-active"
        class="header-icon"
      />
      <div
        v-else
        class="header-number"
      >
        3
      </div>
      <span class="header-step">Payment</span>
    </div>
    <div
      class="item-wrapper"
      :class="{ active: props.step === 4 }"
    >
      <InlineSvg
        v-if="props.step > 4"
        name="check-active"
        class="header-icon"
      />
      <div
        v-else
        class="header-number"
      >
        4
      </div>
      <span class="header-step">Registration</span>
    </div>
    <div
      class="item-wrapper"
      :class="{ active: props.step === 5 }"
    >
      <InlineSvg
        v-if="props.step > 5"
        name="check-active"
        class="header-icon"
      />
      <div
        v-else
        class="header-number"
      >
        5
      </div>
      <span class="header-step">Area Code</span>
    </div>
    <div
      class="item-wrapper"
      :class="{ active: props.step === 6 }"
    >
      <InlineSvg
        v-if="props.step > 6"
        name="check-active"
        class="header-icon"
      />
      <div
        v-else
        class="header-number"
      >
        6
      </div>
      <span class="header-step">Confirm Number</span>
    </div>
    <div
      class="item-wrapper"
      :class="{ active: props.step >= 7 }"
    >
      <InlineSvg
        v-if="props.step > 7"
        name="check-active"
        class="header-icon"
      />
      <div
        v-else
        class="header-number"
      >
        7
      </div>
      <span class="header-step">Installation</span>
    </div>
  </div>
</template>
<style scoped lang="scss">
/* stylelint-disable */
.wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 24px;
  color: $color-primary-100;

  .item-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
    opacity: 0.3;
    flex-shrink: 0;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;

    &.active {
      opacity: 1;
    }

    .header-icon {
      height: 18px;
      width: 18px;
      color: $color-primary-100;
    }

    .header-number {
      flex-shrink: 0;
      height: 18px;
      width: 18px;
      border-radius: 50%;
      background-color: $color-primary-100;
      color: $color-base-white-100;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-step {
      @media (width <= 1075px) {
        display: none;
      }
    }
  }
}
</style>
