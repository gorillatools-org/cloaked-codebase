<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Don't remove this computed property until we move all auth logic to router guards.
// Auth logic in App.vue currently fights over control with router (see ALL-24174).
const isRouteAllowed = computed(
  () =>
    route.path.startsWith("/auth") ||
    route.path.startsWith("/onboard") ||
    route.path.startsWith("/data-delete") ||
    route.path.startsWith("/data-scan") ||
    route.path.startsWith("/data-remove-graph") ||
    route.path.startsWith("/subscribe-now") ||
    route.path.startsWith("/checkout") ||
    route.path.startsWith("/native-checkout") ||
    route.path.startsWith("/invitation") ||
    route.path.startsWith("/mobile")
);
</script>

<template>
  <main :class="{ 'auth-route': $route.path.startsWith('/auth') }">
    <router-view
      v-if="isRouteAllowed"
      default="login"
    />
  </main>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
main {
  background-color: $color-base-white-100;
  min-height: 100dvh;
  &.auth-route {
    // auth-service doesn't support themes yet
    background-color: $color-base-white-100-light;
    min-height: 100%;
  }
}
</style>
