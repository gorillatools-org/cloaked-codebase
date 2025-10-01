<script setup>
import Tip from "@/features/ui/Tip";
import {
  FIELD_EMAIL,
  FIELD_FAVORITE,
  FIELD_NICKNAME,
  FIELD_NOTES,
  FIELD_PASSWORD,
  FIELD_PHONE_NUMBER,
  FIELD_USERNAME,
  FIELD_WEBSITE,
} from "@/store/modules/accounts-importer/shared.js";
import InputValidated from "@/features/ui/input/InputValidated";
import PreferencesCheckParagraph from "@/routes/modals/preferences/PreferencesCheckParagraph";
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  reactive,
} from "vue";
import { useRoute } from "vue-router";
import store from "@/store";
import router from "@/routes/router";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseButton from "@/library/BaseButton.vue";
const route = useRoute();
const state = reactive({
  show: false,
  editableCopy: {
    [FIELD_NICKNAME]: "",
    [FIELD_WEBSITE]: "",
    [FIELD_USERNAME]: "",
    [FIELD_PASSWORD]: "",
    [FIELD_EMAIL]: "",
    [FIELD_PHONE_NUMBER]: "",
    [FIELD_NOTES]: "",
    [FIELD_FAVORITE]: "",
  },
});
async function getIdentityObject() {
  state.editableCopy = await store.dispatch(
    "accountsImporter/getIdentityObject",
    route.params.id
  );
}
const editedIdentityRecord = computed(() => {
  if (!state.editableCopy) {
    return [];
  }

  const record = [];

  for (let identityField in state.editableCopy) {
    record[
      store.getters["accountsImporter/getIdentityFieldIndex"](identityField)
    ] = state.editableCopy[identityField];
  }

  return record;
});
const missingLoginInfo = computed(() => {
  const result = [];

  !state.editableCopy?.[FIELD_WEBSITE] && result.push(FIELD_WEBSITE);
  !state.editableCopy?.[FIELD_PASSWORD] && result.push(FIELD_PASSWORD);

  if (
    !state.editableCopy?.[FIELD_USERNAME] &&
    !state.editableCopy?.[FIELD_EMAIL] &&
    !state.editableCopy?.[FIELD_PHONE_NUMBER]
  ) {
    result.push(FIELD_USERNAME, FIELD_EMAIL, FIELD_PHONE_NUMBER);
  }

  return result;
});
const isSaveDisabled = computed(() => !state.editableCopy?.[FIELD_NICKNAME]);
function onCancel() {
  state.show = false;

  setTimeout(() => {
    router.push({ name: "ImportReview" });
  }, 300);
}
async function onSave() {
  await store.dispatch("accountsImporter/patchIdentity", {
    id: route.params.id,
    record: editedIdentityRecord.value,
  });

  onCancel();
}
function checkForEscape(event) {
  if (event?.key?.toLowerCase() === "escape") {
    onCancel();
  }
}
onBeforeMount(getIdentityObject);
onMounted(() => {
  setTimeout(() => {
    state.show = true;
  }, 0);

  document.addEventListener("keydown", checkForEscape);
});
onBeforeUnmount(() => {
  document.removeEventListener("keydown", checkForEscape);
});
</script>

<template>
  <ModalTemplate
    :show="state.show"
    no-close
    large
    class="identity-edit"
  >
    <template #header>
      <h2 class="identity-edit__title">Edit identity info</h2>
    </template>
    <template #body>
      <div class="identity-edit__divider" />
      <Tip
        v-if="missingLoginInfo.length > 0"
        type="warning"
        class="identity-edit__missing-info"
      >
        <div class="identity-edit__missing-info-content">
          <h3 class="identity-edit__missing-info-title">
            Missing login information
          </h3>
          Add credentials to make this identity ready for login
        </div>
      </Tip>
      <div class="identity-edit__form">
        <InputValidated
          label="Identity name"
          type="text"
          :value="state.editableCopy[FIELD_NICKNAME]"
          placeholder="Amazon"
          :validators="[(value) => (value ? null : 'Add an identity name')]"
          @input="(event) => (state.editableCopy[FIELD_NICKNAME] = event)"
        />
        <InputValidated
          label="URL"
          type="text"
          :value="state.editableCopy[FIELD_WEBSITE]"
          placeholder="www.amazon.com"
          :class="{
            'identity-edit__input--missing-login':
              missingLoginInfo.includes(FIELD_WEBSITE),
          }"
          @input="(event) => (state.editableCopy[FIELD_WEBSITE] = event)"
        />
        <InputValidated
          label="Username"
          type="text"
          :value="state.editableCopy[FIELD_USERNAME]"
          placeholder="username123"
          :class="{
            'identity-edit__input--missing-login':
              missingLoginInfo.includes(FIELD_USERNAME),
          }"
          @input="(event) => (state.editableCopy[FIELD_USERNAME] = event)"
        />
        <InputValidated
          label="Password"
          type="password"
          :value="state.editableCopy[FIELD_PASSWORD]"
          :class="{
            'identity-edit__input--missing-login':
              missingLoginInfo.includes(FIELD_PASSWORD),
          }"
          @input="(event) => (state.editableCopy[FIELD_PASSWORD] = event)"
        />
        <InputValidated
          label="Email address"
          type="email"
          :value="state.editableCopy[FIELD_EMAIL]"
          placeholder="example@email.com"
          :class="{
            'identity-edit__input--missing-login':
              missingLoginInfo.includes(FIELD_EMAIL),
          }"
          @input="(event) => (state.editableCopy[FIELD_EMAIL] = event)"
        />
        <InputValidated
          label="Phone number"
          type="tel"
          :value="state.editableCopy[FIELD_PHONE_NUMBER]"
          placeholder="(123) 456 7890"
          :class="{
            'identity-edit__input--missing-login':
              missingLoginInfo.includes(FIELD_PHONE_NUMBER),
          }"
          @input="(event) => (state.editableCopy[FIELD_PHONE_NUMBER] = event)"
        />
        <InputValidated
          label="Notes"
          type="textarea"
          rows="3"
          :value="state.editableCopy[FIELD_NOTES]"
          placeholder="Add notes"
          @input="(event) => (state.editableCopy[FIELD_NOTES] = event)"
        />
        <PreferencesCheckParagraph
          :value="state.editableCopy[FIELD_FAVORITE]"
          class="identity-edit__favorite"
          @input="(event) => (state.editableCopy[FIELD_FAVORITE] = event)"
        >
          Add this identity to my Favorites
        </PreferencesCheckParagraph>
      </div>
      <div class="identity-edit__divider" />
    </template>
    <template #footer>
      <BaseButton
        variant="secondary"
        @click="onCancel"
      >
        Cancel
      </BaseButton>
      <BaseButton
        :disabled="isSaveDisabled"
        @click="onSave"
      >
        Save changes
      </BaseButton>
    </template>
  </ModalTemplate>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.identity-edit {
  & &__title {
    font-weight: 500;
    font-size: 20px;
    line-height: 30px;
    text-align: center;
    color: $color-primary-100;
  }

  &__divider {
    border-bottom: 1px solid $color-primary-10;
    margin-top: 24px;
  }

  &__missing-info {
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    margin-top: 24px;

    &-title {
      font-weight: 500;
      font-size: 14px;
      line-height: 21px;
      margin-bottom: 4px;
    }
  }

  &__form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 36px;

    & > *:nth-child(7),
    & > *:nth-child(8) {
      grid-column: 1 / 3;
    }
  }

  &__input {
    &--missing-login {
      .validated-input__input {
        border: 1px solid #ffdca8;
      }
    }
  }

  & &__favorite {
    margin-top: 24px;
    margin-bottom: 12px;
  }

  &__cancel {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 11px 16px;
    border: 1px solid $color-primary-20;
    border-radius: 999px;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-100;
    cursor: pointer;
    background-color: $color-primary-1;

    &:hover {
      opacity: 0.8;
    }
  }

  &__save {
    padding: 11px 16px;
    background: $color-primary-100;
    border-radius: 999px;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-1;
    margin-left: 8px;
    border: none;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }

    &:disabled {
      background: $color-primary-50;
      cursor: not-allowed;
      opacity: 1;
    }
  }
}
</style>
