<script setup>
import { watch } from "vue";
import { useToast } from "@/composables/useToast.js";
import moment from "moment";
import MfaService from "@/api/actions/mfa-service";
import ValueDisplay from "@/features/ui/value-display";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";

const emit = defineEmits(["toggleBack", "mfa-devices-updated"]);
const toast = useToast();
const props = defineProps({ devices: { type: Array, default: null } });

watch(
  () => props.devices,
  (val) => {
    if (val.length === 0) {
      emit("toggleBack", {});
    }
  },
  { deep: true }
);

const getUserReadableDate = (utcTime) => {
  return moment(utcTime).format("MMM Do, YYYY");
};

const getDisplayName = (device) => {
  return `${device.name}`;
};

const deleteDevice = (deviceId) => {
  MfaService.deleteDevice(deviceId)
    .then(() => {
      toast.success("Device removed");
      emit("mfa-devices-updated");
    })
    .catch(() => {
      toast.error("Something went wrong. Please try again later.");
    });
};
const toggleBack = () => {
  emit("toggleBack", {});
};
</script>
<template>
  <PreferencesPanel class="panel-offset">
    <template #header>
      <PreferencesHeader @go-back="toggleBack" />
    </template>

    <PreferencesTitle>Authorized devices</PreferencesTitle>

    <div class="section forward-panel">
      <ValueDisplay
        v-for="device in props.devices"
        :key="device?.uuid ? device.uuid : 'uuid'"
        :label="device?.name ? getDisplayName(device) : 'unknown device'"
        :value="
          device?.updated_at
            ? `Verified ${getUserReadableDate(device.updated_at)}`
            : 'unknown'
        "
        @delete="deleteDevice(device.device_id)"
      />
    </div>
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
.forward-panel {
  margin-top: 24px;
}
</style>
