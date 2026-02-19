<script setup>
import IdentitySharing from "@/features/cloakDetails/IdentitySharing/IdentitySharing.vue";
import { ref, computed, watch, onBeforeMount } from "vue";
import { NO_URL_IDENTITY_DOMAIN } from "@/scripts/constants";
import { encryptSharingData } from "@/scripts/identitySharing";
import {
  generateNewPassword,
  generateSharingEncryption,
  identityKeyToLabel,
  identityKeyToType,
} from "@/features/cloakDetails/IdentitySharing/utils";
import { authDecrypt } from "@/scripts/actions/encryption";
import { useToast } from "@/composables/useToast.js";
import IdentityService from "@/api/actions/identity-service";

const toast = useToast();

const props = defineProps({
  identity: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["refresh"]);
const isLoading = ref(false);
const isGeneratingLink = ref(false);
const isGeneratingPassword = ref(false);
const sharing = ref(null);
const activeModal = ref(null);
const isModalOpen = ref(false);
const isTooltipOpen = ref(false);
const locallyDeleted = ref(false);
const locallyCreated = ref(false);
const isShared = computed(() => {
  if (locallyDeleted.value) {
    return false;
  }
  if (locallyCreated.value) {
    return true;
  }
  return !!props.identity.sharing;
});

const resetChanges = async () => {
  if (!props.identity.sharing) {
    locallyDeleted.value = false;
    locallyCreated.value = false;
    sharing.value = {
      data: [],
      private_key: null,
      public_key: null,
      salt: null,
      expires_at: null,
      shared_at: null,
      shared_url: null,
      recipient_shared_password: null,
      decryptedPassword: null,
      onetimeview: false,
    };
    return;
  }

  if (!locallyDeleted.value) {
    locallyCreated.value = false;
  }

  if (props.identity.sharing.decryptedPassword) {
    sharing.value = {
      data: props.identity.sharing.data ?? [],
      private_key: props.identity.sharing.private_key ?? null,
      public_key: props.identity.sharing.public_key ?? null,
      salt: props.identity.sharing.salt ?? null,
      expires_at: props.identity.sharing.expires_at ?? null,
      shared_at: props.identity.sharing.shared_at ?? null,
      shared_url: props.identity.sharing.shared_url ?? null,
      recipient_shared_password:
        props.identity.sharing.recipient_shared_password ?? null,
      decryptedPassword: props.identity.sharing.decryptedPassword,
      onetimeview: props.identity.sharing.onetimeview ?? false,
    };
  } else {
    const { withDecryptedSharing } = await import("@/scripts/identitySharing");
    const tempIdentity = { sharing: props.identity.sharing };
    const processedIdentity = await withDecryptedSharing(tempIdentity);

    sharing.value = {
      data: processedIdentity.sharing.data ?? [],
      private_key: processedIdentity.sharing.private_key ?? null,
      public_key: processedIdentity.sharing.public_key ?? null,
      salt: processedIdentity.sharing.salt ?? null,
      expires_at: processedIdentity.sharing.expires_at ?? null,
      shared_at: processedIdentity.sharing.shared_at ?? null,
      shared_url: processedIdentity.sharing.shared_url ?? null,
      recipient_shared_password:
        processedIdentity.sharing.recipient_shared_password ?? null,
      decryptedPassword: processedIdentity.sharing.decryptedPassword,
      onetimeview: processedIdentity.sharing.onetimeview ?? false,
    };
  }
};

const refreshIdentity = () =>
  new Promise((resolve) => {
    const unwatch = watch(
      () => props.identity.sharing,
      () => {
        resetChanges().then(() => {
          unwatch();
          resolve();
        });
      },
      { deep: true }
    );

    setTimeout(() => {
      emit("refresh", { id: props.identity.id });
    }, 100);

    setTimeout(() => {
      if (
        props.identity.sharing &&
        (!sharing.value.shared_url || !sharing.value.decryptedPassword)
      ) {
        resetChanges().then(() => {
          unwatch();
          resolve();
        });
      } else {
        unwatch();
        resolve();
      }
    }, 2000);
  });

watch(
  () => isShared.value,
  (newValue) => {
    if (!isModalOpen.value) {
      activeModal.value = newValue
        ? "IdentitySharingModalPublished"
        : "IdentitySharingModalCreate";
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => isModalOpen.value,
  async (newValue) => {
    if (!newValue) {
      activeModal.value = isShared.value
        ? "IdentitySharingModalPublished"
        : "IdentitySharingModalCreate";

      if (!isShared.value) {
        await resetChanges();
      }
    } else {
      if (
        isShared.value &&
        (!sharing.value.shared_url || !sharing.value.decryptedPassword)
      ) {
        await resetChanges();
      }
    }
  },
  { immediate: true, deep: true }
);

onBeforeMount(async () => {
  await resetChanges();
});

const getExistingPermission = ({ identityKey, id }) => {
  if (id) {
    return props.identity.sharing?.data?.find?.(
      (item) => item.id.toString() === id.toString()
    );
  }

  if (identityKey) {
    return (
      props.identity.sharing?.data?.find?.(
        (item) => item.type === identityKeyToType[identityKey]
      ) ??
      sharing.value?.data?.find?.(
        (item) => item.type === identityKeyToType[identityKey]
      )
    );
  }
};

const generateNewPermission = ({ identityKey }) => {
  const patchedValue = (identityKey) => {
    const value = props.identity[identityKey];

    if (
      identityKey === "website_url" &&
      !(value.startsWith("http://") || value.startsWith("https://"))
    ) {
      return `https://${value}`;
    }

    return value;
  };

  return {
    id:
      props.identity[`cloaked_${identityKey}`]?.id?.toString() ??
      self.crypto.randomUUID(),
    label: identityKeyToLabel[identityKey],
    type: identityKeyToType[identityKey],
    sharedValue: patchedValue(identityKey),
    isSecret: identityKey === "password",
  };
};

const generateNewCustomFieldPermission = (customField) => {
  return {
    id: customField.id,
    label: customField.type.includes("totp")
      ? "One-time passcode"
      : customField.label,
    type: customField.type,
    sharedValue: customField.value,
    isSecret: customField.isSecret,
  };
};

const permissions = ref([]);

const hasFullPermissions = computed(() => {
  return permissions.value.length === sharing.value.data.length;
});

watch(
  () => props.identity,
  async () => {
    const result = [];

    for (let key of Object.keys(identityKeyToType)) {
      // this is a hack to fix a BE hack that for some reason adds cloaked URL when identity doesn't have any URL
      if (
        key === "website_url" &&
        props.identity[key] === `https://${NO_URL_IDENTITY_DOMAIN}`
      ) {
        continue;
      }

      if (props.identity[key]) {
        result.push(
          getExistingPermission({ identityKey: key }) ??
            generateNewPermission({ identityKey: key })
        );
      }
    }

    for (let customField of props.identity.customFields || []) {
      result.push(
        getExistingPermission({ id: customField.id }) ??
          generateNewCustomFieldPermission(customField)
      );
    }

    const passwordPermission = result.find(
      (permission) => permission.type === identityKeyToType.password
    );

    if (passwordPermission) {
      passwordPermission.sharedValue = await authDecrypt(
        passwordPermission.sharedValue
      );
    }

    permissions.value = result;
  },
  { immediate: true, deep: true }
);

const onCreate = async () => {
  try {
    isLoading.value = true;

    const { publicKey, privateKey, password, salt } =
      await generateSharingEncryption();

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    const encryptedData = await encryptSharingData(sharing.value.data, {
      public_key: publicKey,
    });

    const payload = {
      data: encryptedData,
      private_key: privateKey,
      public_key: publicKey,
      recipient_shared_password: password,
      salt,
      expires_at: expirationDate.toISOString(),
      onetimeview: false,
      has_full_permissions: hasFullPermissions.value,
    };

    const response = await IdentityService.createSharing(
      props.identity.id,
      payload
    );

    if (response.data && response.data.shared_url) {
      const { withDecryptedSharing } = await import(
        "@/scripts/identitySharing"
      );
      const tempIdentity = { sharing: response.data };
      const processedIdentity = await withDecryptedSharing(tempIdentity);

      sharing.value = {
        data: processedIdentity.sharing.data ?? [],
        private_key: processedIdentity.sharing.private_key ?? null,
        public_key: processedIdentity.sharing.public_key ?? null,
        salt: processedIdentity.sharing.salt ?? null,
        expires_at: processedIdentity.sharing.expires_at ?? null,
        shared_at: processedIdentity.sharing.shared_at ?? null,
        shared_url: processedIdentity.sharing.shared_url ?? null,
        recipient_shared_password:
          processedIdentity.sharing.recipient_shared_password ?? null,
        decryptedPassword: processedIdentity.sharing.decryptedPassword,
        onetimeview: processedIdentity.sharing.onetimeview ?? false,
      };

      locallyCreated.value = true;

      activeModal.value = "IdentitySharingModalPublished";
      toast.success("Identity shared.");

      refreshIdentity()
        .then(() => {
          // Background refresh completed
        })
        .catch(() => {
          // Background refresh failed
        });

      return;
    } else {
      await refreshIdentity();
    }

    activeModal.value = "IdentitySharingModalPublished";
    toast.success("Identity shared.");
  } catch {
    toast.error("There was an issue saving. Try again in a moment.");
  } finally {
    isLoading.value = false;
  }
};

const onUpdate = async () => {
  try {
    isLoading.value = true;

    let isUpdatingExpiration;

    if (!props.identity.sharing) {
      isUpdatingExpiration = true;
    } else {
      isUpdatingExpiration =
        props.identity.sharing.expires_at !== sharing.value.expires_at ||
        props.identity.sharing.shared_at !== sharing.value.shared_at ||
        props.identity.sharing.onetimeview !== sharing.value.onetimeview;
    }

    const encryptedData = await encryptSharingData(sharing.value.data, {
      public_key: sharing.value.public_key,
    });

    const { decryptedPassword, ...previousSharingPayload } = sharing.value;

    await IdentityService.patchSharing(props.identity.id, {
      ...previousSharingPayload,
      data: encryptedData,
      has_full_permissions: hasFullPermissions.value,
    });

    activeModal.value = "IdentitySharingModalPublished";

    const successMessage =
      !props.identity.sharing || isUpdatingExpiration
        ? "New expiration published."
        : "New permissions published.";

    toast.success(successMessage);
  } catch {
    toast.error("There was an issue saving. Try again in a moment.");
  } finally {
    isLoading.value = false;
  }
};

const onDelete = async () => {
  try {
    isLoading.value = true;

    await IdentityService.deleteSharing(props.identity.id);

    locallyDeleted.value = true;
    sharing.value = {
      data: [],
      private_key: null,
      public_key: null,
      salt: null,
      expires_at: null,
      shared_at: null,
      shared_url: null,
      recipient_shared_password: null,
      decryptedPassword: null,
      onetimeview: false,
    };

    activeModal.value = "IdentitySharingModalCreate";
    isModalOpen.value = false;
    toast.success("Identity is no longer being shared.");

    refreshIdentity()
      .then(() => {
        // Background refresh completed
      })
      .catch(() => {
        // Background refresh failed
      });
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 404) {
      locallyDeleted.value = true;
      sharing.value = {
        data: [],
        private_key: null,
        public_key: null,
        salt: null,
        expires_at: null,
        shared_at: null,
        shared_url: null,
        recipient_shared_password: null,
        decryptedPassword: null,
        onetimeview: false,
      };
      activeModal.value = "IdentitySharingModalCreate";
      isModalOpen.value = false;
      toast.success("Identity is no longer being shared.");

      refreshIdentity()
        .then(() => {
          // Background refresh completed
        })
        .catch(() => {
          // Background refresh failed
        });
    } else {
      toast.error("There was an issue saving. Try again in a moment.");
    }
  } finally {
    isLoading.value = false;
  }
};

const onGenerateNewLink = async () => {
  try {
    isGeneratingLink.value = true;
    isGeneratingPassword.value = true;

    const { publicKey, privateKey, password, salt } = await generateNewPassword(
      sharing.value
    );

    const encryptedData = await encryptSharingData(sharing.value.data, {
      public_key: publicKey,
    });

    const { decryptedPassword, ...previousSharingPayload } = sharing.value;

    await IdentityService.patchSharing(props.identity.id, {
      ...previousSharingPayload,
      data: encryptedData,
      private_key: privateKey,
      public_key: publicKey,
      recipient_shared_password: password,
      salt,
    });

    await IdentityService.generateNewSharingLink(props.identity.id);

    await refreshIdentity();

    toast.success("New link and password published.");
  } catch {
    toast.error("There was an issue saving. Try again in a moment.");
  } finally {
    isGeneratingLink.value = false;
    isGeneratingPassword.value = false;
  }
};

const onGenerateNewPassword = async () => {
  try {
    isGeneratingPassword.value = true;

    const { publicKey, privateKey, password, salt } = await generateNewPassword(
      sharing.value
    );

    const encryptedData = await encryptSharingData(sharing.value.data, {
      public_key: publicKey,
    });

    const { decryptedPassword, ...previousSharingPayload } = sharing.value;

    await IdentityService.patchSharing(props.identity.id, {
      ...previousSharingPayload,
      data: encryptedData,
      private_key: privateKey,
      public_key: publicKey,
      recipient_shared_password: password,
      salt,
    });

    await refreshIdentity();

    toast.success("New password published.");
  } catch {
    toast.error("There was an issue saving. Try again in a moment.");
  } finally {
    isGeneratingPassword.value = false;
  }
};

const onExpired = async () => {
  activeModal.value = "IdentitySharingModalExpired";
  toast.success("Share link expired.");
  await IdentityService.deleteSharing(props.identity.id);
  await refreshIdentity();
};

const hasAnnouncementTooltip = ref(false);

watch(
  () => isTooltipOpen.value,
  (newValue, oldValue) => {
    if (oldValue && !newValue) {
      setTimeout(() => {
        hasAnnouncementTooltip.value = false;
      }, 250);
    }
  },
  { deep: true }
);

function handleSetActiveModal(event) {
  activeModal.value = event;
}
</script>

<template>
  <IdentitySharing
    :identity="identity"
    :permissions="permissions"
    :is-shared="isShared"
    :active-modal="activeModal"
    :is-loading="isLoading"
    :is-generating-link="isGeneratingLink"
    :is-generating-password="isGeneratingPassword"
    :is-tooltip-open="isTooltipOpen"
    :has-announcement-tooltip="hasAnnouncementTooltip"
    :sharing="sharing"
    :value="isModalOpen"
    @input="
      (event) => {
        isModalOpen = event;
      }
    "
    @set-active-modal="handleSetActiveModal"
    @set-is-tooltip-open="isTooltipOpen = $event"
    @update-sharing="sharing = $event"
    @discard-changes="resetChanges"
    @create="onCreate"
    @update="onUpdate"
    @delete="onDelete"
    @generate-new-link="onGenerateNewLink"
    @generate-new-password="onGenerateNewPassword"
    @expired="onExpired"
  />
</template>
