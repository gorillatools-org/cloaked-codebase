<script setup>
import ModalTemplate from "@/features/ModalTemplate.vue";
import store from "@/store";
import { computed } from "vue";
import Button from "@/features/Button.vue";
import ContactIcon from "@/features/ui/ContactIcon.vue";
import { constants } from "@/scripts/constants";
import { format } from "@/scripts/format";

const props = defineProps({
  contact: {
    type: Object,
    required: true,
  },
  identityId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["blockContact"]);

const contactType = computed(() => {
  return props.contact?.original_phone
    ? constants.CONTACT_TYPE.PHONE
    : constants.CONTACT_TYPE.EMAIL;
});

const contactName = computed(() => {
  const { firstName, lastName } = format.getContactName(props.contact);
  let names = [];
  if (firstName?.trim()?.length) {
    names.push(firstName);
  }
  if (lastName?.trim()?.length) {
    names.push(lastName);
  }
  return names.join(" ");
});

const contactInitials = computed(() => {
  let names = contactName.value.split(" ");
  names = names.filter((name) => !!name).slice(0, 2);
  const initials = names.map((name) => name[0]?.toUpperCase());
  return initials.join("");
});

const contactValue = computed(() => {
  return contactType.value === constants.CONTACT_TYPE.PHONE
    ? format.phone_format(props.contact[`cloak_contact_${contactType.value}`])
    : props.contact[`cloaked_contact_${contactType.value}`];
});

function closeModal() {
  store.dispatch("closeModal");
}

function blockContact() {
  emit("blockContact");
  closeModal();
}
</script>
<template>
  <ModalTemplate
    :show="true"
    @close="closeModal"
  >
    <template #header>
      <h2>Block this contact?</h2>
    </template>
    <template #body>
      <div class="flex-row">
        <ContactIcon
          :initials="contactInitials"
          :associated-identity-id="props.identityId"
          :override="{ width: '72px', height: '72px' }"
        />
        <div class="detail-wrapper">
          <p
            v-if="contactName"
            class="details boldText"
          >
            {{ contactName }}
          </p>
          <p
            v-if="contactValue"
            class="details boldText"
          >
            {{ contactValue }}
          </p>
          <p class="details">
            will no longer be able to contact you unless you approve them again.
          </p>
        </div>
      </div>
    </template>
    <template #footer>
      <Button
        type="secondary"
        @click="closeModal"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        class="button--primary"
        @click="blockContact"
      >
        Block
      </Button>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.flex-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-direction: row;
  gap: 14px;
  width: 100%;

  .detail-wrapper {
    width: 100%;

    .details {
      font-size: 14px;
      font-weight: 400;
      margin-top: 8px;
      word-break: break-word;

      &.boldText {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}
</style>
