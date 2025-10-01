<script setup>
import Popper from "@/features/Popper.vue";
</script>

<template>
  <Popper
    v-bind="$attrs"
    class="ui-menu"
  >
    <slot />
    <template #content>
      <div class="ui-menu__content">
        <slot name="content" />
      </div>
    </template>
  </Popper>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.ui-menu {
  &__content {
    background: $color-background;
    border-radius: 8px;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: auto;
    height: 100%;
  }
}
</style>
