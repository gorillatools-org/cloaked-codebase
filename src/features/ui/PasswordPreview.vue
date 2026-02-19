<script setup>
import PasswordText from "@/features/ui/PasswordText.vue";
import SecretToggle from "@/features/ui/SecretToggle.vue";
import { reactive } from "vue";
const props = defineProps({
  password: {
    type: String,
    required: true,
  },
});
const state = reactive({
  isHidden: true,
});
</script>
<template>
  <div class="password-preview">
    <template v-if="props.password">
      <SecretToggle
        :value="state.isHidden"
        class="password-preview__toggle"
        @input="(event) => (state.isHidden = event)"
      />
      <PasswordText
        :password="props.password"
        :is-hidden="state.isHidden"
        class="password-preview__text"
      />
    </template>
    <template v-else>-</template>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
@import "@/assets/scss/recursive/_mixins";

.password-preview {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;

  &__toggle {
    .secret-toggle__icon {
      padding: 10px 10px 10px 0;
    }
  }

  &__text {
    .password-text__password {
      @include line-clamp(2);
    }
  }
}
</style>
