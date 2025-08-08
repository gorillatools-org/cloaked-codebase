<script setup>
import { computed, ref } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import EnrollmentBackground from "@/features/enrollment/EnrollmentBackground.vue";

defineEmits(["back", "next"]);

const addresses = defineModel("addresses", { type: Array });

const form = ref(null);

const validateForm = computed(() => form.value.validateForm);

defineExpose({ validateForm });

const transition = ref("slide-left");

onBeforeRouteUpdate((to, from, next) => {
  transition.value =
    to.name === "EnrollmentAddressesAutocomplete"
      ? "slide-right"
      : "slide-left";

  next();
});
</script>

<template>
  <div>
    <EnrollmentBackground type="removal" />
    <router-view>
      <template #default="{ Component }">
        <Transition
          mode="out-in"
          :name="transition"
        >
          <Component
            :is="Component"
            ref="form"
            v-model:addresses="addresses"
            @next="$emit('next')"
            @back="$emit('back')"
          />
        </Transition>
      </template>
    </router-view>
  </div>
</template>

<style lang="scss" scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease-in-out;
}

.slide-left-leave-to,
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-15px);
}

.slide-left-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(15px);
}
</style>
