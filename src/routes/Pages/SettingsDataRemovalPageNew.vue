<script setup>
import { onBeforeMount, ref } from "vue";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import { useMonitoringAutofill } from "@/features/monitoring/useMonitoringAutofill.js";
import { useToast } from "@/composables/useToast.js";
import { toApiPayload } from "@/features/enrollment/data-utils.js";
import { onBeforeRouteUpdate } from "vue-router";

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

const isLoading = ref(false);

const getProfile = async () => {
  isLoading.value = true;

  try {
    const enrollmentData = await getAutofillDataFromEnrollment();
    profile.value = getFreshProfile();
    autofillMonitoringData(profile, enrollmentData);
    getNamesFromProfile();
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

const form = ref(null);

const onSubmit = () => {
  const isValid = form.value?.validateForm();

  if (isValid) {
    onUpdateProfile();
  }
};

const transition = ref("slide-left");

onBeforeRouteUpdate((to, from, next) => {
  if (to.name === "settings.dataRemoval.all") {
    transition.value = "slide-right";
  } else {
    transition.value = "slide-left";
  }

  next();
});
</script>

<template>
  <div class="settings-data-removal">
    <SettingsTitle>Data Removal & Identity Monitoring</SettingsTitle>
    <SettingsParagraph>
      This information will be used for Data Removal and Identity Monitoring.
      For Data Removal, any changes made here will take effect during the next
      scan, which occurs every 30 days.
    </SettingsParagraph>

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
            v-model:date-of-birth="profile.dob"
            v-model:phone-numbers="profile.phone_numbers"
            v-model:email-addresses="profile.email_addresses"
            v-model:addresses="profile.addresses"
            v-model:ssn="profile.ssn"
            :ssn-submitted="profile.ssn_submitted"
            :is-submitting="isSubmitting"
            @submit="onSubmit"
          />
        </Transition>
      </template>
    </router-view>
  </div>
</template>

<style lang="scss" scoped>
.settings-data-removal {
  padding: 40px 80px;
  max-width: 680px;

  &__form {
    display: grid;
    row-gap: 24px;
    margin-top: 24px;
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
