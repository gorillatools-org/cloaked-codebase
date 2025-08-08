<script setup>
import AuthIframe from "./AuthIframe";
import Iframe from "./Iframe";

const props = defineProps({
  version: {
    type: Number,
    default: null,
  },
});
</script>

<template>
  <Iframe
    v-if="props.version === 2"
    useLegacyRoute
    source="auth/forgot-password"
  />
  <AuthIframe
    v-else
    source="auth/forgot-password"
  />
</template>
