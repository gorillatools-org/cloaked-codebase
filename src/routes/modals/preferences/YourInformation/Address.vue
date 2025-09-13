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

// Internally we keep level1 = state/province, level2 = city for UI bindings
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

// Values used for form display (unswapped)
const displayValues = computed(() => {
  return {
    autofill_street_address: state.autofill_street_address,
    autofill_unit: state.autofill_unit,
    autofill_country: state.autofill_country,
    autofill_address_level2: state.autofill_address_level2, // city
    autofill_address_level1: state.autofill_address_level1, // state/province
    autofill_postal_code: state.autofill_postal_code,
  };
});

// Payload values used when saving to backend (swap level1/level2 to match API storage)
const saveValues = computed(() => {
  return {
    autofill_street_address: state.autofill_street_address,
    autofill_unit: state.autofill_unit,
    autofill_country: state.autofill_country,
    // API stores city in level1 and state/province in level2; swap on write
    autofill_address_level1: state.autofill_address_level2,
    autofill_address_level2: state.autofill_address_level1,
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
    PersonalInfoService.updateInfo(props.id, saveValues.value)
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
    PersonalInfoService.createInfo(saveValues.value)
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
      :current="displayValues"
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
