<script setup>
import { computed, ref, useAttrs, watch } from "vue";
import TOTPInputRow from "@/features/cloakDetails/TOTP/TOTPInputRow.vue";
import { TOTP, URI } from "otpauth";
import { withPatchedValues } from "@/store/modules/accounts-importer/automatedFixes";
import {
  encryptCustomField,
  withDecryptedCustomFields,
} from "@/scripts/customFields";
import IdentityService from "@/api/actions/identity-service";
import { useToast } from "@/composables/useToast.js";
const toast = useToast();

const props = defineProps({
  identity: {
    type: Object,
    required: true,
  },
});
const attrs = useAttrs();
const totp = computed(() =>
  props.identity.customFields?.find((field) =>
    ["totp_url", "totp_secret"].includes(field.type)
  )
);

const totpToken = ref(null);

const emit = defineEmits(["refresh", "set-loading", "set-errors"]);

const refreshCustomFields = () => {
  return new Promise((resolve) => {
    const unwatch = watch(
      () => props.identity.customFields,
      () => {
        unwatch();
        resolve();
      },
      { deep: true }
    );

    emit("refresh", { id: props.identity.id });
  });
};

const saveTotp = async (input) => {
  const value = input.replaceAll(" ", "");
  try {
    emit("set-loading", true);

    const { data } = await IdentityService.fetchPopulatedIdentityV2(
      props.identity.id
    );

    const identity = await withDecryptedCustomFields(data);
    const mostRecentTotp = identity.customFields?.find((field) =>
      ["totp_url", "totp_secret"].includes(field.type)
    );

    const hasExistingPasscode = !!mostRecentTotp;
    const isTotpUrl = value.startsWith("otpauth://");

    if (isTotpUrl && !URI.parse(value)) {
      throw new Error("Invalid otpauth url");
    } else if (!isTotpUrl) {
      const totpObject = new TOTP({
        secret: value,
      });

      if (!URI.parse(totpObject.toString())) {
        throw new Error("Invalid secret key");
      }
    }

    const customField = withPatchedValues({
      id: mostRecentTotp?.id ?? self.crypto.randomUUID(),
      type: isTotpUrl ? "totp_url" : "totp_secret",
      value: value, // if secret, store secret not URL
      label: "One-time password",
      isSecret: false,
    });

    const encryptedCustomField = await encryptCustomField(customField);

    await IdentityService.patchCustomField(
      props.identity.id,
      JSON.stringify({
        custom_data: [
          {
            op: hasExistingPasscode ? "replace" : "add",
            path: `/custom_field/${encryptedCustomField.id}`,
            value: encryptedCustomField.value,
          },
        ],
      })
    );

    await refreshCustomFields();
    toast.success(
      hasExistingPasscode
        ? "One-time passcode updated."
        : "New one-time passcode added."
    );

    emit("set-errors", false);
  } catch {
    emit("set-errors", true);
    toast.error("Not a valid secret key or otpauth link.");
  } finally {
    emit("set-loading", false);
  }
};

const deleteTotp = async () => {
  try {
    emit("set-loading", true);

    await IdentityService.patchCustomField(
      props.identity.id,
      JSON.stringify({
        custom_data: [
          {
            op: "remove",
            path: `/custom_field/${totp.value?.id}`,
          },
        ],
      })
    );

    await refreshCustomFields();
    toast.success("One-time passcode deleted.");
    emit("set-errors", false);
  } catch {
    emit("set-errors", true);
    toast.error("Something went wrong. Please try again later.");
  } finally {
    emit("set-loading", false);
  }
};

const isTotpIntroDisplayed = ref(false);
</script>

<template>
  <div>
    <TOTPInputRow
      :totp="totp"
      :is-totp-intro-displayed="isTotpIntroDisplayed"
      :totp-token="totpToken"
      :loading="attrs.loading"
      :identity-id="props.identity.id"
      v-bind="$attrs"
      @save="saveTotp"
      @delete="deleteTotp"
      @set-is-totp-intro-displayed="isTotpIntroDisplayed = $event"
      @set-totp-token="totpToken = $event"
    />
  </div>
</template>
