<script setup>
import { computed } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";

const props = defineProps({
  size: {
    type: String,
    default: "medium",
    validator: (value) =>
      ["small", "medium", "large", "xlarge"].includes(value),
  },
  username: {
    type: String,
    required: false,
    default: "",
  },
  image: {
    type: String,
    required: false,
    default: "",
  },
});

const firstLetter = computed(() => {
  if (props.username) {
    const firstChar = props.username.charAt(0);
    if (/^[A-Za-z]$/.test(firstChar)) {
      return firstChar.toUpperCase();
    }
  }
  return null;
});
</script>

<template>
  <div
    class="base-avatar"
    :class="`base-avatar--${props.size}`"
    :style="{ backgroundImage: `url(${props.image})` }"
  >
    <span
      v-if="firstLetter"
      class="base-avatar__letter"
    >
      {{ firstLetter }}
    </span>
    <BaseIcon
      v-else
      name="user-filled"
      class="base-avatar__icon"
    />
  </div>
</template>

<style lang="scss" scoped>
.base-avatar {
  border-radius: 50%;
  background-color: $color-primary-100;
  background-size: cover;
  background-position: center;
  width: 40px;
  height: 40px;
  position: relative;
  font-size: 100%;

  &__letter {
    position: absolute;
    top: 50%;
    left: 50%;

    @include transform(translate(-50%, -50%));

    font-size: 16px;
    line-height: 19px;
    font-weight: 700;
    color: $color-primary-1;
  }

  &__icon {
    position: absolute;
    top: 50%;
    left: 50%;

    @include transform(translate(-50%, -50%));

    font-size: 16px;
    color: $color-primary-1;
  }

  &--small {
    width: 20px;
    height: 20px;
  }

  &--medium {
    width: 24px;
    height: 24px;
  }

  &--large {
    width: 32px;
    height: 32px;
  }

  &--xlarge {
    width: 40px;
    height: 40px;
  }
}
</style>
