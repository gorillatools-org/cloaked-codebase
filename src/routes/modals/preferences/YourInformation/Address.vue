<script setup>
import EditAddress from "./EditAddress";
import PersonalInfoService from "@/api/settings/personal-services";

import { useToast } from "@/composables/useToast.js";
import { reactive, computed } from "vue";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesFooter from "@/routes/modals/preferences/PreferencesFooter.vue";
import Button from "@/features/Button.vue";

const toast = useToast();

const emit = defineEmits(["toggleBack", "update"]);

const props = defineProps({
  id: {
    type: Number,
    default: null,
  },
  current: {
    type: Object,
    default: () => ({}),
  },
});

// NOTE: address level1 = state, level2=city
const state = reactive({
  autofill_street_address:
    props.current && props.current.autofill_street_address,
  autofill_unit: props.current && props.current.autofill_unit,
  autofill_country: props.current && props.current.autofill_country,
  autofill_address_level2:
    props.current && props.current.autofill_address_level2,
  autofill_address_level1:
    props.current && props.current.autofill_address_level1,
  autofill_postal_code: props.current && props.current.autofill_postal_code,
  loading: false,
});

const values = computed(() => {
  return {
    autofill_street_address: state.autofill_street_address,
    autofill_unit: state.autofill_unit,
    autofill_country: state.autofill_country,
    autofill_address_level2: state.autofill_address_level2,
    autofill_address_level1: state.autofill_address_level1,
    autofill_postal_code: state.autofill_postal_code,
  };
});

function on_update_value({ name, value }) {
  state[name] = value;
  emit("update", { name, value });
}

async function save() {
  state.loading = true;

  if (props.id) {
    PersonalInfoService.updateInfo(props.id, values.value)
      .then(() => {
        emit("toggleBack");
        toast.success("Address saved.");
        state.loading = false;
      })
      .catch(() => {
        toast.error("Error saving your address.");
        state.loading = false;
      });
  } else {
    PersonalInfoService.createInfo(values.value)
      .then(() => {
        emit("toggleBack");
        toast.success("Address saved.");
        state.loading = false;
      })
      .catch(() => {
        toast.error("Error saving your address.");
        state.loading = false;
      });
  }
}
</script>

<template>
  <PreferencesPanel>
    <template #header>
      <PreferencesHeader @go-back="emit('toggleBack')" />
    </template>

    <EditAddress
      ref="editAddressRef"
      label="address"
      :placeholder="`add address`"
      :current="values"
      name="address"
      @update="on_update_value"
      @save="save"
    />

    <PreferencesFooter>
      <Button
        :disabled="state.loading"
        :loading="state.loading"
        @click="save"
      >
        Save changes
      </Button>
    </PreferencesFooter>
  </PreferencesPanel>
</template>
