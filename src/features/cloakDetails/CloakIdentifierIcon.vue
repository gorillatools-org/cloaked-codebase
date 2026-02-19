<script setup>
import CustomFieldIcon from "@/features/cloakDetails/CustomFields/CustomFieldIcon.vue";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  field: {
    type: String,
    default: null,
  },
});
</script>

<template>
  <InlineSvg
    v-if="props.field === 'email'"
    name="email-outline"
  />
  <InlineSvg
    v-else-if="props.field === 'phone'"
    name="phone-outline"
  />
  <InlineSvg
    v-else-if="props.field === 'password'"
    name="key"
  />
  <InlineSvg
    v-else-if="props.field === 'username'"
    name="user-icon"
    height="16px"
    width="16px"
  />
  <InlineSvg
    v-else-if="props.field === 'notes'"
    name="lock-shield"
  />
  <InlineSvg
    v-else-if="props.field === 'website' || props.field === 'url'"
    name="link-chain"
  />
  <InlineSvg
    v-else-if="props.field === 'name'"
    name="people"
  />
  <InlineSvg
    v-else-if="
      props.field === 'one-time passcode' ||
      props.field === 'totp_url' ||
      props.field === 'totp_secret'
    "
    name="totp"
  />
  <CustomFieldIcon
    v-else
    :type="props.field"
  />
</template>
