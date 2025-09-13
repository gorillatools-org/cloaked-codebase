<script setup>
import {
  STATUS_READY,
  STATUS_DUPLICATE,
  STATUS_MISSING_IDENTITY_NAME,
  STATUS_MISSING_CREDENTIALS_AND_URL,
  STATUS_MISSING_CREDENTIALS,
  STATUS_MISSING_URL,
  STATUSES_READY,
  STATUSES_DUPLICATE,
  STATUSES_MISSING_INFO,
  STATUS_INVALID_EMAIL,
  STATUS_INVALID_URL,
  STATUS_FIRST_DUPLICATE,
} from "@/store/modules/accounts-importer/shared.js";
import { getPrimaryStatus } from "@/store/modules/accounts-importer/index.js";
import AppTooltip from "@/features/ui/AppTooltip.vue";
import { computed } from "vue";

const props = defineProps({
  statuses: {
    type: Array,
    default: () => [STATUS_READY],
    validator: (value) =>
      value.every((status) =>
        [
          STATUS_READY,
          STATUS_FIRST_DUPLICATE,
          STATUS_DUPLICATE,
          STATUS_MISSING_IDENTITY_NAME,
          STATUS_MISSING_CREDENTIALS_AND_URL,
          STATUS_MISSING_CREDENTIALS,
          STATUS_MISSING_URL,
          STATUS_INVALID_EMAIL,
          STATUS_INVALID_URL,
        ].includes(status)
      ),
  },
});

const status = computed(() => getPrimaryStatus(props.statuses));

const statusLabel = computed(() => {
  const LABEL_NO_ISSUE = "No issue";
  const LABEL_NEEDS_REVIEW = "Needs review";
  const LABEL_DUPLICATE = "Duplicate";

  const statusToLabelMap = {
    [STATUS_READY]: LABEL_NO_ISSUE,
    [STATUS_MISSING_IDENTITY_NAME]: LABEL_NEEDS_REVIEW,
    [STATUS_MISSING_CREDENTIALS_AND_URL]: LABEL_NEEDS_REVIEW,
    [STATUS_MISSING_CREDENTIALS]: LABEL_NEEDS_REVIEW,
    [STATUS_MISSING_URL]: LABEL_NEEDS_REVIEW,
    [STATUS_DUPLICATE]: LABEL_DUPLICATE,
    [STATUS_FIRST_DUPLICATE]: LABEL_DUPLICATE,
    [STATUS_INVALID_EMAIL]: LABEL_NEEDS_REVIEW,
    [STATUS_INVALID_URL]: LABEL_NEEDS_REVIEW,
  };

  return statusToLabelMap[status.value];
});

const tooltip = computed(() => {
  if (status.value === STATUS_DUPLICATE) {
    return "An identity in this import is identical to this one";
  }

  if (status.value === STATUS_MISSING_IDENTITY_NAME) {
    return "Add an identity name to import this identity";
  }

  if (status.value === STATUS_MISSING_CREDENTIALS_AND_URL) {
    return "Add credentials and a URL to make this identity ready for login";
  }

  if (status.value === STATUS_MISSING_URL) {
    return "Add a URL to make this identity ready for login";
  }

  if (status.value === STATUS_MISSING_CREDENTIALS) {
    return "Add credentials to make this identity ready for login";
  }

  if (status.value === STATUS_INVALID_EMAIL) {
    return "Update email to use a valid email format";
  }

  if (status.value === STATUS_INVALID_URL) {
    return "Update url to use a valid url format";
  }

  return null;
});
</script>

<template>
  <span
    class="identity-status"
    :class="{
      'identity-status--ready': STATUSES_READY.includes(status),
      'identity-status--missing-info': STATUSES_MISSING_INFO.includes(status),
      'identity-status--duplicate': STATUSES_DUPLICATE.includes(status),
    }"
  >
    <AppTooltip
      v-if="tooltip"
      placement="top"
      :offset-away="8"
    >
      <span>
        {{ statusLabel }}
      </span>
      <template #content>{{ tooltip }}</template>
    </AppTooltip>
    <template v-else>
      {{ statusLabel }}
    </template>
  </span>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.identity-status {
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  color: $color-primary-100-light;
  padding: 4px 8px;
  border-radius: 8px;
  display: inline-block;
  cursor: default;

  &--missing-info {
    background: $color-warning-light;
    border: 1px solid $color-warning;
  }

  &--duplicate {
    background: $color-brand-5-10-light;
    border: 1px solid $color-brand-5-90;
  }

  &--ready {
    background: $color-success-light;
    border: 1px solid $color-success;
  }
}
</style>
