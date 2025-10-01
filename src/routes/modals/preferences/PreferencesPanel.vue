<script setup>
import { computed, useSlots } from "vue";
const slots = useSlots();

const hasHeader = computed(() => {
  return !!slots.header;
});

const hasFooter = computed(() => {
  return !!slots.footer;
});
</script>

<template>
  <div class="preferences-panel">
    <header
      v-if="hasHeader"
      class="preferences-panel__header"
    >
      <slot name="header" />
    </header>

    <div class="preferences-panel__body">
      <slot />
    </div>

    <footer
      v-if="hasFooter"
      class="preferences-panel__footer"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.preferences-panel {
  display: flex;
  min-height: 100%;
  width: 100%;
  flex: 1 1 0;
  flex-direction: column;
  gap: 18px;

  &__header {
    flex-shrink: 0;
    width: 100%;
    margin-top: 0;
    display: flex;
    align-items: center;
  }

  &__body {
    @include custom-scroll-bar();
  }

  &__footer {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: auto;
  }

  .preferences-panel {
    padding: 0;
  }
}
</style>
