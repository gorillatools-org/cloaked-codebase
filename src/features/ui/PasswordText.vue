<script setup>
const props = defineProps({
  password: {
    type: String,
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: true,
  },
});
</script>
<template>
  <div class="password-text">
    <span
      v-show="props.isHidden"
      class="password-text__hidden"
    >
      ••••••••••••
    </span>
    <span
      class="password-text__password"
      :class="{ 'password-text__password--hidden': props.isHidden }"
    >
      {{ props.password }}
    </span>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
@import "@/assets/scss/recursive/_mixins";

.password-text {
  position: relative;

  &__hidden {
    padding-top: 6px;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(calc(-50% - 4px));

    @include line-clamp(1);
    font-size: $font-size-hidden-dots;
  }

  &__password {
    user-select: none;

    @include line-clamp(1);

    &--hidden {
      opacity: 0;
    }
  }
}
</style>
