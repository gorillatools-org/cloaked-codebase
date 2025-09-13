<script setup>
import { onBeforeMount, ref } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import MonitoringScanning from "@/features/monitoring/MonitoringScanning.vue";
import MonitoringEvents from "@/features/monitoring/MonitoringEvents.vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import { useToast } from "@/composables/useToast.js";
import { useMonitoringAutofill } from "@/features/monitoring/useMonitoringAutofill.js";
import { toApiPayload } from "@/features/enrollment/data-utils.js";

const transition = ref("slide-left");

onBeforeRouteUpdate((to, from, next) => {
  if (
    to.name === "MonitoringStatus" ||
    from.name === "MonitoringSettingsNames" ||
    from.name === "MonitoringSettingsAddress"
  ) {
    transition.value = "slide-right";
  } else {
    transition.value = "slide-left";
  }

  next();
});

const getFreshProfile = () => ({
  name: {},
  other_names: [],
  dob: null,
  addresses: [],
  email_addresses: [],
  phone_numbers: [],
  ssn: null,
  ssn_submitted: false,
});

const profile = ref(getFreshProfile());

const names = ref([]);

const getNamesFromProfile = () => {
  names.value = profile.value.name.first
    ? [profile.value.name, ...profile.value.other_names]
    : profile.value.other_names;
};

const getProfileFromNames = () => {
  profile.value.name = names.value[0];
  profile.value.other_names = names.value.slice(1);
};

const { autofillMonitoringData, getAutofillDataFromEnrollment } =
  useMonitoringAutofill();

const updatedAt = ref(null);

const isLoading = ref(false);

const getProfile = async () => {
  isLoading.value = true;

  try {
    const enrollmentData = await getAutofillDataFromEnrollment();
    profile.value = getFreshProfile();
    autofillMonitoringData(profile, enrollmentData);
    getNamesFromProfile();

    updatedAt.value = new Date();
  } catch (error) {
    console.error(error);
    toast.error("Error fetching your profile.");
  } finally {
    isLoading.value = false;
  }
};

const isSubmitting = ref(false);
const toast = useToast();

const onUpdateProfile = async () => {
  try {
    isSubmitting.value = true;

    getProfileFromNames();
    await DataDeleteService.updateEnrollmentProfile(toApiPayload(profile));

    await getProfile();

    toast.success("Profile updated successfully.");
  } catch (e) {
    console.log(e);
    toast.error("Error updating your profile. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

onBeforeMount(getProfile);
</script>

<template>
  <div class="page-monitoring">
    <div class="page-monitoring__content">
      <MonitoringScanning class="page-monitoring__scanning" />
      <MonitoringEvents class="page-monitoring__events" />
    </div>
    <div class="page-monitoring__aside">
      <router-view>
        <template #default="{ Component }">
          <Transition
            :name="transition"
            mode="out-in"
          >
            <Component
              :is="Component"
              v-model:names="names"
              v-model:date-of-birth="profile.dob"
              v-model:phone-numbers="profile.phone_numbers"
              v-model:email-addresses="profile.email_addresses"
              v-model:addresses="profile.addresses"
              v-model:ssn="profile.ssn"
              :ssn-submitted="profile.ssn_submitted"
              :is-submitting="isSubmitting"
              :updated-at="updatedAt"
              @update-profile="onUpdateProfile"
            />
          </Transition>
        </template>
      </router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.page-monitoring {
  display: grid;
  padding: 0 8px 8px 0;
  gap: 8px;
  grid-template-columns: minmax(500px, 1fr) minmax(400px, 0.5fr);

  &__content {
    background-color: $color-primary-5;
    border-radius: 20px;
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    @include hide-scrollbar();
  }

  &__events {
    margin-top: 32px;
    flex-grow: 1;
  }

  &__aside {
    background-color: $color-primary-5;
    border-radius: 20px;
    padding: 0 24px;
    overflow-y: auto;
    @include hide-scrollbar();
  }
}

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
