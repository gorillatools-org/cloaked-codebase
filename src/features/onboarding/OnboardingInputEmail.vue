<script setup>
import { ref, onMounted, useAttrs } from "vue";

const inputRef = ref(null);
const attrs = useAttrs();
onMounted(() => {
  inputRef.value?.focus();
});
</script>

<template>
  <input
    v-bind="attrs"
    ref="inputRef"
    type="email"
    class="onboarding-input-email"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.onboarding-input-email {
  padding: 8px 12px;
  height: 60px;
  background-color: $color-primary-5;
  border-radius: 10px;
  border: none;
  margin: 32px auto 0;
  width: calc(100% - 128px);
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: $color-primary-100;

  &:focus {
    outline: 1px solid $color-primary-100;
  }
}
</style>
