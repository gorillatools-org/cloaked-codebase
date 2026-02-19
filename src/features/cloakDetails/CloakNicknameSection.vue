<script setup>
import store from "@/store";
import IdentitySharingContainer from "@/features/cloakDetails/IdentitySharing/IdentitySharingContainer.vue";
import IdentityService from "@/api/actions/identity-service";
import { NO_URL_IDENTITY_DOMAIN } from "@/scripts/constants";

import { reactive, computed, watch } from "vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";

const props = defineProps({
  cloak: { type: Object, default: null },
  readOnly: { type: Boolean, default: false },
  // This is used to keep receiving the refresh event, even after the component is unmounted (which using emit is not possible)
  refreshCallback: { type: Function, default: null },
});

const emit = defineEmits(["refresh"]);

const state = reactive({
  nickname: props.cloak.nickname,
  cloakCopyForUpdate: null,
});

const hasIdentitySharingV1 = computed(() => {
  return store.getters.isV2User;
});

function save() {
  const payload = {
    nickname: state.nickname,
  };
  store.dispatch("updateCloaks", [
    {
      ...props.cloak,
      ...payload,
    },
  ]);
  state.cloakCopyForUpdate = { ...props.cloak };
  IdentityService.updateCloak(props.cloak.id, payload).then(() => {
    const eventPayload = {
      ...state.cloakCopyForUpdate,
      nickname: payload.nickname,
    };

    emit("refresh", eventPayload);

    if (props.refreshCallback) {
      props.refreshCallback(eventPayload);
    }
  });
}

const hasIdentifiers = computed(() => {
  return (
    (!!props.cloak?.website_url &&
      !props.cloak?.website_url.includes(NO_URL_IDENTITY_DOMAIN)) ||
    !!props.cloak?.username ||
    !!props?.cloak?.email ||
    !!props.cloak?.password ||
    !!props?.cloak?.phone ||
    (!!props?.cloak?.stored_autofill?.custom_field &&
      Object.keys(props?.cloak?.stored_autofill?.custom_field).length)
  );
});

const showShare = computed(() => {
  return hasIdentitySharingV1.value && hasIdentifiers.value;
});

watch(
  () => props.cloak,
  (newValue, oldValue) => {
    if (newValue.nickname !== oldValue.nickname) {
      state.nickname = newValue.nickname;
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="cloak-nickname-section">
    <IdentityIcon
      :identity="props.cloak"
      :override="{ height: '40px', width: '40px' }"
    />

    <input
      ref="cloakNickname"
      class="input-nickname"
      aria-id="CloakNicknameInput"
      :disabled="props.readOnly"
      :value="state.nickname"
      type="text"
      placeholder="Add name or URL"
      :title="state.nickname"
      autocomplete="off"
      maxlength="50"
      data-lpignore="true"
      tabindex="0"
      @input="(event) => (state.nickname = event.target.value)"
      @blur="save"
      @keydown.enter="save"
    />
    <IdentitySharingContainer
      v-if="showShare"
      :identity="props.cloak"
      class="cloak-nickname-section__sharing"
      @refresh="$emit('refresh', $event)"
    />
  </div>
</template>

<style lang="scss" scoped>
.cloak-nickname-section {
  padding: 9px 24px;
  display: flex;
  flex-direction: row;
  align-items: center;

  .input-nickname {
    border: none;
    outline: none;
    margin-left: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    font-size: 24px;
    line-height: 36px;
    color: $color-primary-100;
    background: $color-base-white-100;
    width: 100%;
  }

  &__sharing {
    margin-left: 12px;
  }
}
</style>
