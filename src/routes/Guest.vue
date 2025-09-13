<script setup>
import { onMounted } from "vue";
import router from "@/routes/router";
import { useRoute } from "vue-router";

onMounted(() => {
  const route = useRoute();
  if (
    !route.path.includes("auth") &&
    !route.path.includes("onboard") &&
    !route.path.includes("data-delete") &&
    !route.path.includes("data-remove-graph") &&
    !route.path.includes("subscribe-now") &&
    !route.path.includes("native-checkout") &&
    !route.path.includes("invitation") &&
    !route.path.includes("mobile")
  ) {
    router.push({
      name: "login",
      query: {
        prevRoute: route.fullPath,
      },
    });
  }
});
</script>

<template>
  <main :class="{ 'auth-route': $route.path.startsWith('/auth') }">
    <router-view default="login" />
  </main>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
main {
  background-color: $color-base-white-100;

  &.auth-route {
    // auth-service doesn't support themes yet
    background-color: $color-base-white-100-light;
  }
}
</style>
