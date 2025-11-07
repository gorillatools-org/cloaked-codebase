<script setup>
import AuthIframe from "./AuthIframe";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import router from "@/routes/router";

const route = useRoute();
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
  <AuthIframe
    source="auth/login"
    :prev-route="prevRoute"
  />
</template>
