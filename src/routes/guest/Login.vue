<script setup>
import AuthIframe from "./AuthIframe";
import Iframe from "./Iframe";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import router from "@/routes/router";

const route = useRoute();
const props = defineProps({
  version: {
    type: Number,
    default: null,
  },
});
const prevRoute = ref(route.query.prevRoute);

onMounted(() => {
  router.replace({
    query: {
      ...route.query,
      prevRoute: undefined,
    },
  });
});
</script>

<template>
  <Iframe
    v-if="props.version === 2"
    use-legacy-route
    source="auth/login"
    :prev-route="prevRoute"
  />
  <AuthIframe
    v-else
    source="auth/login"
    :prev-route="prevRoute"
  />
</template>
