<script setup>
import { TOTP, URI } from "otpauth";
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  ref,
  useAttrs,
  watch,
} from "vue";
import TOTPTokenStateless from "@/features/cloakDetails/TOTP/TOTPTokenStateless.vue";

const props = defineProps({
  url: {
    type: String,
    default: undefined,
  },
  algorithm: {
    type: String,
    default: undefined,
  },
  digits: {
    type: Number,
    default: undefined,
  },
  issuer: {
    type: String,
    default: undefined,
  },
  label: {
    type: String,
    default: undefined,
  },
  period: {
    type: Number,
    default: undefined,
  },
  secret: {
    type: String,
    default: undefined,
  },
  interval: {
    type: Number,
    default: 1000,
  },
});

const attrs = useAttrs();

const totp = computed(() => {
  try {
    return props.url
      ? URI.parse(props.url)
      : new TOTP({
          algorithm: props.algorithm,
          digits: props.digits,
          issuer: props.issuer,
          label: props.label,
          period: props.period,
          secret: props.secret,
        });
  } catch {
    return null;
  }
});
const token = ref(null);

const getSyncedProgress = () =>
  1 - ((new Date().getTime() / 1000) % totp.value?.period) / totp.value?.period;

const progress = ref(getSyncedProgress());

const emit = defineEmits(["new-token"]);
let tokenRefreshTimeout = null;
let tokenRefreshInterval = null;

const refreshToken = (isRegenerated = false) => {
  token.value = totp.value?.generate();
  progress.value = isRegenerated ? 1 : getSyncedProgress();
  emit("new-token", token.value);
};

const setupTokenRefresh = () => {
  clearTimeout(tokenRefreshTimeout);
  tokenRefreshTimeout = setTimeout(
    () => {
      clearInterval(tokenRefreshInterval);
      refreshToken();

      tokenRefreshInterval = setInterval(() => {
        const isValid = totp.value?.validate({ token: token.value }) !== null;
        progress.value = progress.value - 1 / totp.value?.period;

        if (progress.value <= 0 || !isValid) {
          refreshToken(true);
        }
      }, props.interval);
    },
    1000 - (new Date().getTime() % 1000)
  );
};

watch(() => props, setupTokenRefresh, { deep: true });
onBeforeMount(() => {
  try {
    /* Attempt to generate totp code / test if the secret/url are valid */
    token.value = totp.value?.generate();
    setupTokenRefresh();
  } catch {
    return;
  }
});
onBeforeUnmount(() => {
  clearInterval(tokenRefreshInterval);
});

const displayToken = computed(() => {
  if (token.value) {
    const tokenDigits = token.value?.split("");
    tokenDigits.splice(Math.ceil(totp.value?.digits / 2), 0, " ");
    return tokenDigits.join("");
  }
  return "Invalid TOTP Key";
});
</script>

<template>
  <TOTPTokenStateless
    v-if="displayToken"
    v-bind="attrs"
    :progress="progress"
    :token="displayToken"
  />
</template>
