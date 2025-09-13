<script setup>
import { formatFullDayDateTime } from "@/scripts/timestamp_format";

import { computed } from "vue";
import { vOnClickOutside } from "@vueuse/components";

import store from "@/store";
import VerticalTable from "@/features/VerticalTable.vue";
import BaseText from "@/library/BaseText";

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const identity = computed(() => {
  const id = parseInt(props.message.identity?.match(/\/(\d+)\/$/)[1], 10);
  return store.state?.localdb?.db_cloaks?.find((i) => i.id === id);
});

function openIdentity(cloak) {
  store.dispatch("openCloakDetails", {
    cloak: cloak,
  });

  emit("close");
}

const tableDisplayInfo = computed(() => {
  const senderName = !props.message.email.inbound
    ? "me"
    : props.message.email.sender_name;
  const fromContent = senderName
    ? {
        title: senderName,
        subtitle: props.message.email.sender_email,
        original: props.message.email.sender_contact?.original_email,
      }
    : {
        title: props.message.email.sender_email,
        original: props.message.email.sender_contact?.original_email,
      };

  const toContent = props.message.email.to_recipients?.map(
    (recipient, index) =>
      recipient.name || props.message.email.inbound
        ? {
            title: props.message.email.inbound ? "me" : recipient.name,
            subtitle: recipient.email,
            original:
              props.message.email?.to_recipient_contacts[index]?.original_email,
          }
        : { title: recipient.email }
  );

  const ccContent = props.message.email.cc_recipients?.map((recipient) =>
    recipient.name
      ? {
          title: recipient.name,
          subtitle: recipient.email,
        }
      : { title: recipient.email }
  );

  const fromRow = {
    header: "From",
    content: [fromContent],
  };
  const toRow = {
    header: "To",
    content: [...toContent],
  };
  const ccRow = {
    header: "CC",
    content: [...ccContent],
  };
  const dateRow = {
    header: "Date",
    content: [{ title: formatFullDayDateTime(props.message.created_at) }],
  };
  const securityRow = {
    header: "Security",
    content: [
      {
        title:
          "This message is encrypted and secured by Cloaked two-way routing.",
      },
    ],
  };
  const tableData = [fromRow, toRow, dateRow, securityRow];
  if (props.message.email.cc_recipients?.length > 0) {
    tableData.splice(2, 0, ccRow);
  }
  return tableData;
});

function close() {
  emit("close");
}
</script>

<template>
  <div
    v-on-click-outside="close"
    class="details-modal"
  >
    <div class="modal-header">
      <BaseText
        as="h3"
        variant="headline-6-medium"
      >
        Message details
      </BaseText>

      <BaseText
        as="p"
        variant="body-small-medium"
        @click="openIdentity(identity)"
      >
        View identity
      </BaseText>
    </div>

    <div class="modal-content">
      <VerticalTable :table-content="tableDisplayInfo" />
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.details-modal {
  position: absolute;
  width: 412px;
  max-height: calc(100vh - 300px);
  z-index: 10;
  background: $color-background;
  box-shadow:
    5.45px 5.45px 20.9px 0 rgb(1 2 24 / 12%),
    -3.633px -3.633px 10.899px 0 rgb(0 0 0 / 4%);
  border-radius: 28px;
  padding: 24px;
  display: flex;
  flex-direction: column;

  .modal-header {
    border-bottom: 0.5px solid $color-primary-10;
    padding: 0 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      color: $color-primary-100;
    }

    p {
      color: $color-primary-70;
      cursor: pointer;
      text-decoration: underline;
    }
  }

  .modal-content {
    max-height: calc(100% - 300px);
    overflow-y: scroll;

    &::-webkit-scrollbar {
      width: 0;
    }

    &::-webkit-scrollbar-track {
      background: $color-primary-5;
    }
  }

  .modal-message-wrapper {
    padding-top: 24px;
    text-align: center;
    margin: 0 auto;
    display: flex;
  }

  .modal-message {
    display: flex;
    padding: 8px;
    border: 1px solid $color-primary-10;
    border-radius: 16px;
    justify-content: space-between;
    font-weight: 500;
    font-size: 10px;
    color: $color-primary-100;
  }

  .modal-img-wrap {
    padding-right: 8px;
  }
}
</style>
