<script setup>
import { computed } from "vue";
import IdentityFieldIcon from "@/features/cloakDetails/IdentityFieldIcon.vue";
import InputCheckbox from "@/features/InputCheckbox.vue";
import SecretValue from "@/features/ui/SecretValue.vue";
import CustomFieldIcon from "@/features/cloakDetails/CustomFields/CustomFieldIcon.vue";
import { getStringValue } from "@/features/cloakDetails/CustomFields/utils";
import TOTPToken from "@/features/cloakDetails/TOTP/TOTPToken.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    validator: (value) =>
      [
        "std_name",
        // identity field types
        "std_email",
        "std_password",
        "std_phone",
        "std_username",
        "std_website",
        "notes",
        "cloaked",
        // custom field types
        "text",
        "address",
        "url",
        "date",
        "bank",
        "auth",
        "identification",
        "totp_secret",
        "totp_url",
      ].includes(value),
    default: null,
  },
  label: {
    type: String,
    required: true,
  },
  sharedValue: {
    type: [String, Object],
    required: true,
  },
  isSecret: {
    type: Boolean,
    default: false,
  },
});

const isTotp = props.type.includes("totp");

const iconType = computed(() =>
  props.type.startsWith("std_")
    ? props.type.replace("std_", "")
    : isTotp
      ? "totp"
      : props.type
);

const stringValue = computed(() => {
  return [
    "text",
    "address",
    "url",
    "date",
    "bank",
    "auth",
    "identification",
  ].includes(props.type)
    ? getStringValue(props.type, props.sharedValue)
    : props.sharedValue;
});
</script>

<template>
  <label class="identity-sharing-permission">
    <InputCheckbox
      v-bind="$attrs"
      :id="id"
    />
    <span class="identity-sharing-permission__label">
      {{ label }}
    </span>
    <span class="identity-sharing-permission__icon">
      <IdentityFieldIcon
        v-if="
          [
            'name',
            'email',
            'password',
            'phone',
            'username',
            'website',
            'notes',
            'cloaked',
            'totp',
          ].includes(iconType)
        "
        :type="iconType"
      />
      <CustomFieldIcon
        v-else
        :type="iconType"
      />
    </span>
    <SecretValue
      v-if="!isTotp"
      :is-hidden="isSecret"
      variant="body-small-medium"
      class="identity-sharing-permission__value"
    >
      {{ stringValue }}
    </SecretValue>
    <TOTPToken
      v-else
      :url="stringValue.startsWith('otpauth://') ? stringValue : undefined"
      :secret="stringValue.startsWith('otpauth://') ? undefined : stringValue"
    />
  </label>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
@import "@/assets/scss/recursive/_mixins";

.identity-sharing-permission {
  display: grid;
  place-items: center start;
  grid-gap: 4px;
  grid-template-columns: 36px 1fr 36px 2fr;
  cursor: pointer;
  padding: 10px 0;

  &__label,
  &__value {
    color: $color-primary-100;
    font-size: 12px;
    font-weight: 400;
  }

  &__label {
    margin-right: 14px;

    @include line-clamp(2);
  }

  &__value {
    margin-left: 2px;

    @include line-clamp(1);
  }

  &__icon {
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .totp-token__token {
    font-size: 12px;
    color: $color-primary-100;
    font-weight: 400;
  }
}
</style>
