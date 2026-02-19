<script setup>
defineProps({
  as: {
    type: String,
    default: "button",
    validator: (value) => ["button", "a"].includes(value),
  },
});
</script>

<template>
  <Component
    :is="as"
    class="atom-top-banner-button"
  >
    <slot />
  </Component>
</template>

<style scoped lang="scss">
.atom-top-banner-button {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  color: inherit;

  &:hover {
    opacity: 0.8;
  }
}
</style>
