<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import Button from "@/features/Button.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import IdentitySharingPermission from "@/features/cloakDetails/IdentitySharing/IdentitySharingPermission.vue";
import { computed, ref } from "vue";
import ReviewToggleAll from "@/features/import/ReviewToggleAll.vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import Spinner from "@/assets/icons/spinner.svg";
import { isEqual } from "lodash-es";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  identity: {
    type: Object,
    default: () => ({}),
  },
  sharing: {
    type: Object,
    default: () => ({}),
  },
  permissions: {
    type: Array,
    default: () => [],
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  "update-sharing",
  "discard-changes",
  "open-published",
  "update",
  "input",
  "create",
]);

const permissionIds = computed(() =>
  props.permissions.map((permission) => permission.id)
);

const areCustomPermissionsExpanded = ref(props.isShared);

const permissionsList = ref(null);
const permissionsListExpandedHeight = computed(() =>
  permissionsList.value ? getComputedStyle(permissionsList.value).height : "0px"
);

const permissionsListStyle = computed(() => ({
  maxHeight: areCustomPermissionsExpanded.value
    ? permissionsListExpandedHeight.value
    : "0",
}));

const modalContentStyle = computed(() => ({
  maxHeight: props.isLoading
    ? "108px"
    : areCustomPermissionsExpanded.value
      ? `calc(386px + ${permissionsListStyle.value.maxHeight})`
      : "386px",
}));
</script>

<template>
  <AppModal
    :value="props.value"
    @input="$emit('input')"
  >
    <AppModalContent
      class="sharing-modal-create"
      :class="{
        'sharing-modal-create--loading': props.isLoading,
        'sharing-modal-create--expanded': areCustomPermissionsExpanded,
      }"
      :style="modalContentStyle"
    >
      <AppModalTitle class="sharing-modal-create__title">
        <IdentityIcon
          :override="{ width: '44px', height: '44px' }"
          :identity="props.identity"
        />
        {{
          props.isLoading
            ? props.isShared
              ? "Publishing your changes..."
              : "Generating your share link..."
            : `Share ${props.identity?.nickname} identity`
        }}
        <Spinner
          v-if="props.isLoading"
          class="sharing-modal-create__spinner"
        />
      </AppModalTitle>
      <div class="sharing-modal-create__content">
        <div class="sharing-modal-create__permissions">
          <label class="sharing-modal-create__permissions-all">
            <ReviewToggleAll
              :values="permissionIds"
              :model-value="props.sharing.data.map((item) => item.id)"
              @update:model-value="
                ($event) => {
                  $emit('update-sharing', {
                    ...props.sharing,
                    data: props.permissions.filter((item) =>
                      $event.includes(item.id)
                    ),
                  });
                }
              "
            />
            <span>
              <span class="sharing-modal-create__permissions-title">
                Full read permission:
              </span>
              <span class="sharing-modal-create__permissions-paragraph">
                All contents of this identity except calls, texts and emails
                will be accessible by the recipient.
              </span>
            </span>
          </label>
          <div class="sharing-modal-create__permissions-custom">
            <h3
              class="sharing-modal-create__permissions-title"
              @click="
                areCustomPermissionsExpanded = !areCustomPermissionsExpanded
              "
            >
              Custom permissions
              <InlineSvg
                name="chevron-down"
                class="sharing-modal-create__chevron"
                :class="{
                  'sharing-modal-create__chevron--expanded':
                    areCustomPermissionsExpanded,
                }"
              />
            </h3>
            <div
              class="sharing-modal-create__permissions-custom-list"
              :style="permissionsListStyle"
            >
              <div
                ref="permissionsList"
                class="sharing-modal-create__permissions-custom-list-wrapper"
              >
                <IdentitySharingPermission
                  v-for="permission in props.permissions"
                  :id="permission.id"
                  :key="permission.id"
                  :type="permission.type"
                  :is-secret="permission.isSecret"
                  :shared-value="permission.sharedValue"
                  :label="permission.label"
                  :model-value="props.sharing.data.map((item) => item.id)"
                  class="sharing-modal-create__permissions-custom-list-item"
                  @update:model-value="
                    $emit('update-sharing', {
                      ...props.sharing,
                      data: props.permissions.filter((item) =>
                        $event.includes(item.id)
                      ),
                    })
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <AppModalFooter class="sharing-modal-create__footer">
        <template v-if="props.isShared">
          <Button
            type="secondary"
            @click="
              $emit('discard-changes');
              $emit('open-published');
            "
          >
            Go back
          </Button>
          <Button
            :disabled="
              props.sharing.data.length === 0 ||
              isEqual(props.sharing.data, props.identity.sharing.data)
            "
            @click="$emit('update')"
          >
            Publish new permissions
          </Button>
        </template>
        <template v-else>
          <Button
            type="secondary"
            @click="$emit('input', false)"
          >
            Cancel
          </Button>
          <Button
            :disabled="props.sharing.data.length === 0"
            @click="$emit('create')"
          >
            Create link
          </Button>
        </template>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.sharing-modal-create {
  transition: max-height 0.25s ease-in-out;

  &__title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__spinner {
    margin-left: auto;
  }

  &__content {
    padding: 0 32px;
    margin: 24px 0;
    transition: all 0.3s ease-out;
    opacity: 1;

    @at-root .sharing-modal-create--loading & {
      transform: translateY(20px);
      opacity: 0;
    }
  }

  &__footer {
    transition: all 0.25s 0.1s ease-out;
    opacity: 1;

    @at-root .sharing-modal-create--loading & {
      transform: translateY(20px);
      opacity: 0;
    }
  }

  &__permissions {
    padding: 24px;
    border-radius: 12px;
    border: 1px solid $color-primary-50;
    max-height: calc(100vh - 300px);
    overflow: auto;

    &-all {
      display: grid;
      grid-gap: 4px;
      place-items: start start;
      grid-template-columns: 36px 1fr;
      cursor: pointer;
    }

    &-custom {
      margin-top: 20px;

      &-list {
        overflow: hidden;
        transition: max-height 0.25s ease-out;

        &-wrapper {
          padding-top: 16px;
        }

        &-item {
          margin-top: 4px;
        }
      }
    }

    &-title {
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    &-paragraph {
      font-size: 14px;
      font-weight: 400;
      display: block;
    }
  }

  &__chevron {
    transition: transform 0.1s ease-out;

    &--expanded {
      transform: rotate(180deg);
    }
  }
}
</style>
