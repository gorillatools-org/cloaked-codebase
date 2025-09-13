<script setup>
import Enter from "@/assets/icons/enter.svg";

defineProps({
  value: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div class="file-column">
    {{ value }}
    <Enter class="file-column__icon" />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.file-column {
  font-weight: 600;
  font-size: 10px;
  line-height: 15px;
  color: $color-primary-100;
  display: flex;
  align-items: center;
  padding: 10px 0;

  &__icon {
    transform: rotate(-90deg);
    width: 13px;
    height: 14px;
    margin-left: 4px;
  }
}
</style>
