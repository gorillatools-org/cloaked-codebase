<script setup>
import ValueDisplay from "@/features/ui/value-display";
import { phone_format } from "@/scripts/format";
import PhoneSerivce from "@/api/actions/phone-service";

import { useToast } from "@/composables/useToast.js";
import store from "@/store";

import { computed, markRaw } from "vue";
import AddVerifyPhone from "@/features/modals/AddVerifyPhone.vue";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";

const toast = useToast();

const emit = defineEmits(["refresh", "delete", "toggleBack"]);

const props = defineProps({
  phones: {
    type: Array,
    default: () => [],
  },
});

const primaryPhone = computed(() => {
  return props.phones.find((item) => item.verified && item.primary);
});

const formattedPhoneNumber = computed(() => {
  return phone_format(primaryPhone.value.phone_number);
});

function handleAddPhoneNumber() {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddVerifyPhone),
      props: {
        setPrimary: true,
        title: primaryPhone.value
          ? "Enter a new recovery phone number"
          : "Add a phone number",
      },
      events: {
        "phone-verified": refresh,
        "phone-created": refresh,
      },
    },
  });
}

function handleDelete(phoneId) {
  const phone = props.phones.find((item) => item.id === phoneId);

  store.dispatch("openGlobalDeleteModal", {
    type: "phone",
    onClick: () => {
      PhoneSerivce.deletePhone(phone.url)
        .then(() => {
          emit("delete", phoneId);
          toast.success("Phone number deleted");
        })
        .catch(() => {
          toast.error(
            "Phone number is in use for 2FA. To delete, please remove from 2FA first."
          );
        });
    },
  });
}

function refresh() {
  emit("refresh");
}
</script>

<template>
  <PreferencesPanel>
    <ValueDisplay
      v-if="!primaryPhone"
      label="Add a recovery phone number"
      @add="handleAddPhoneNumber"
      @click="handleAddPhoneNumber"
    />
    <ValueDisplay
      v-else
      label="Recovery phone number"
      :value="formattedPhoneNumber"
      @edit="handleAddPhoneNumber"
      @delete="handleDelete(primaryPhone.id)"
    />
  </PreferencesPanel>
</template>
