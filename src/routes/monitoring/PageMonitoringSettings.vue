<script setup>
import { ref } from "vue";
import { getFormattedSsnValue } from "@/features/enrollment/utils.js";
import { onBeforeRouteUpdate } from "vue-router";

defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  ssnSubmitted: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update-profile"]);

const transition = ref("slide-left");

onBeforeRouteUpdate((to, from, next) => {
  if (to.name === "MonitoringSettingsAll") {
    transition.value = "slide-right";
  } else {
    transition.value = "slide-left";
  }

  next();
});

const names = defineModel("names", { type: Array });
const dateOfBirth = defineModel("dateOfBirth", { type: String });
const phoneNumbers = defineModel("phoneNumbers", { type: Array });
const emailAddresses = defineModel("emailAddresses", { type: Array });
const addresses = defineModel("addresses", { type: Array });
const ssn = defineModel("ssn", {
  type: String,
  get: getFormattedSsnValue,
});

const form = ref(null);

const onSubmit = () => {
  const isValid = form.value?.validateForm();

  if (isValid) {
    emit("update-profile");
  }
};
</script>

<template>
  <router-view>
    <template #default="{ Component }">
      <Transition
        :name="transition"
        mode="out-in"
      >
        <Component
          :is="Component"
          ref="form"
          v-model:names="names"
          v-model:date-of-birth="dateOfBirth"
          v-model:phone-numbers="phoneNumbers"
          v-model:email-addresses="emailAddresses"
          v-model:addresses="addresses"
          v-model:ssn="ssn"
          :ssn-submitted="ssnSubmitted"
          :is-submitting="isSubmitting"
          @submit="onSubmit"
        />
      </Transition>
    </template>
  </router-view>
</template>

<style scoped lang="scss">
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
