<script setup>
import { computed } from "vue";

const props = defineProps({
  email: { type: String, default: "" },
  ellipsis: { type: Boolean, default: false },
});

const username = computed(() => {
  const split = props.email.split("@");
  return split[0] || "";
});

const domain = computed(() => {
  const split = props.email.split("@");
  return split[1] || "";
});
</script>

<template>
  <div
    class="ui-email-option-label"
    :class="{ 'ui-email-option-label--ellipsis': ellipsis }"
    :title="email"
  >
    <template v-if="ellipsis">
      <span
        v-if="username"
        class="ui-email-option-label__username"
      >
        {{ username }}
      </span>
      <span
        v-if="domain"
        class="ui-email-option-label__domain"
      >
        @{{ domain }}
      </span>
    </template>

    <span v-else>{{ email }}</span>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.ui-email-option-label {
  overflow-wrap: anywhere;

  &__username {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1 1 0;
  }

  &__domain {
    flex-shrink: 0;
  }

  &--ellipsis {
    display: inline-flex;
    align-items: center;
    overflow: hidden;
    flex: 1 1 auto;
    max-width: 100%;
  }
}
</style>
