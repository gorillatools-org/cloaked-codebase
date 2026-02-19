<script setup>
import { computed } from "vue";
import store from "@/store";
import { inbox as inboxScripts } from "@/scripts/inbox";
import IdentityIcon from "@/features/ui/IdentityIcon";
import InlineSvg from "@/features/InlineSvg.vue";
import Checkbox from "@/features/ui/input/Checkbox";
import InboxService from "@/api/actions/inbox-service";
import { useToast } from "@/composables/useToast.js";
import { formattedText } from "@/scripts/formattedText";
import { constants } from "@/scripts/constants";
import { format } from "@/scripts/format";
import { sanitize } from "@/scripts/sanitize";
import BaseText from "@/library/BaseText";

const toast = useToast();

const props = defineProps({
  activity: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  highlight: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["navigate", "select"]);

const identity = computed(() => {
  const id = parseInt(props.activity?.identity?.match(/\/(\d+)\/$/)?.[1], 10);
  return id ? store.state.localdb.db_cloaks.find((i) => i.id === id) : null;
});

const identityName = computed(() => {
  return formattedText.getFormattedNickname(identity.value) || "(Unnamed)";
});

const type = computed(() => {
  if (props.activity.message) {
    return constants.INBOX_TYPES.MESSAGE;
  }
  if (props.activity.call) {
    return constants.INBOX_TYPES.CALL;
  }
  return constants.INBOX_TYPES.EMAIL;
});

const name = computed(() => {
  if (type.value === constants.INBOX_TYPES.EMAIL) {
    const senderName = inboxScripts.getFullContactNameStr(
      props.activity?.email?.sender_contact
    );
    return (
      (senderName.length && senderName) ||
      props.activity?.email?.sender_name ||
      identityName.value
    );
  } else if (type.value === constants.INBOX_TYPES.CALL) {
    const senderName = inboxScripts.getFullContactNameStr(
      props.activity?.call?.sender_contact
    );
    return (
      (senderName.length && senderName) ||
      props.activity?.call?.sender_name ||
      identityName.value
    );
  } else if (type.value === constants.INBOX_TYPES.MESSAGE) {
    const senderName = inboxScripts.getFullContactNameStr(
      props.activity?.message?.sender_contact
    );
    return (
      (senderName.length && senderName) ||
      props.activity?.message?.sender_name ||
      identityName.value
    );
  }
  return identityName.value;
});

const timestamp = computed(() => {
  return inboxScripts.getTimeDisplayInboxList(props.activity.created_at);
});

const title = computed(() => {
  if (type.value === constants.INBOX_TYPES.EMAIL) {
    return sanitize.safe_title(props.activity.email.subject) || "(no subject)";
  }
  if (type.value === constants.INBOX_TYPES.MESSAGE) {
    return sanitize.safe_title(props.activity.message.body) || "(no message)";
  }
  if (type.value === constants.INBOX_TYPES.CALL) {
    return props.activity.call.sender_contact?.location || "Unknown";
  }
  return null;
});

const hasAttachments = computed(() => {
  if (type.value === constants.INBOX_TYPES.EMAIL) {
    return props.activity.email.has_attachments;
  }
  if (type.value === constants.INBOX_TYPES.MESSAGE) {
    return props.activity.message.has_attachments;
  }
  return false;
});

const attachmentCountDisplay = computed(() => {
  const numberOfAttachments = props.activity.email?.attachments?.length || 0;
  if (numberOfAttachments) {
    return `${numberOfAttachments} attachment${
      numberOfAttachments > 1 ? "s" : ""
    }`;
  }
  return "";
});

const isRead = computed(() => {
  if (type.value === constants.INBOX_TYPES.EMAIL) {
    return props.activity.email.read;
  }
  if (type.value === constants.INBOX_TYPES.MESSAGE) {
    return props.activity.message.read;
  }
  if (type.value === constants.INBOX_TYPES.CALL) {
    return props.activity.call.read;
  }
  return false;
});

const isStarred = computed(() => {
  return props.activity.starred;
});

const getIcon = computed(() => {
  let iconType = "phone";
  if (isStarred.value) {
    return "star";
  }
  if (type.value === constants.INBOX_TYPES.EMAIL) {
    iconType = "mail";
  } else if (type.value === constants.INBOX_TYPES.MESSAGE) {
    iconType = "text";
  }

  const iconState = isRead.value ? "outline" : "filled";
  return `${iconType}-${iconState}`;
});

function toggleStar() {
  if (!isStarred.value) {
    return InboxService.markThreadsStarred([props.activity?.thread_id])
      .then(async () => {
        await store.dispatch("updateThreadCachedData", {
          threadId: props.activity?.thread_id,
          key: "starred",
          value: true,
        });
        toast.success("Marked as starred");
      })
      .catch((err) => {
        toast.error("Error updating data", err);
      });
  }
  return InboxService.markThreadsUnstarred([props.activity?.thread_id])
    .then(async () => {
      await store.dispatch("updateThreadCachedData", {
        threadId: props.activity?.thread_id,
        key: "starred",
        value: false,
      });
      toast.success("Removed from starred");
    })
    .catch((err) => {
      toast.error("Error updating data", err);
    });
}

function toggleRead() {
  if (isRead.value) {
    InboxService.markThreadsAsUnread([props.activity?.thread_id])
      .then(async () => {
        toast.success("Marked as unread");
        await store.dispatch("updateActivityCachedData", {
          threadId: props.activity?.thread_id,
          key: "read",
          value: false,
        });
      })
      .catch(() => {
        toast.error("Error updating data");
      });
  } else {
    InboxService.markThreadsAsRead([props.activity?.thread_id])
      .then(async () => {
        toast.success("Marked as read");
        await store.dispatch("updateActivityCachedData", {
          threadId: props.activity?.thread_id,
          key: "read",
          value: true,
        });
      })
      .catch(() => {
        toast.error("Error updating data");
      });
  }
}

function showDeleteModal() {
  return store.dispatch("openModal", {
    header: `Delete messages?`,
    subheader:
      "Any copies of these messages that have been forwarded to your personal email or phone will be unaffected. This cannot be undone.",
    button: {
      text: "Yes, Delete",
      onClick: () => deleteThread(),
      danger: true,
    },
  });
}

function deleteThread() {
  InboxService.bulkDeleteActivity([props.activity?.thread_id])
    .then(() => {
      toast.success("Deleted");
      window.dispatchEvent(new CustomEvent("reset:cache"));
    })
    .catch(() => {
      toast.error("Error, delete unsuccessful");
    });
}
</script>
<template>
  <button
    class="list-item"
    :class="{ read: isRead, selected: selected }"
    @click="emit('navigate')"
  >
    <div
      class="item-select"
      @click="(e) => e.stopPropagation()"
    >
      <Checkbox
        :checked="selected"
        @click="emit('select')"
      />
    </div>
    <BaseText
      as="div"
      variant="body-2-semibold"
      class="item-name"
    >
      <IdentityIcon
        class="icon"
        width="32px"
        height="32px"
        :identity="identity"
      />
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="format.highlight(name, props.highlight)" />
    </BaseText>
    <div
      class="item-title"
      :class="{ starred: isStarred }"
    >
      <div class="content">
        <InlineSvg
          :key="`${getIcon}-icon-inbox`"
          :name="getIcon"
        />
        <BaseText variant="body-2-semibold">{{ title }}</BaseText>
      </div>
    </div>
    <div
      v-if="hasAttachments"
      class="item-attachment"
    >
      <InlineSvg name="attachment" />
      <BaseText variant="body-small-medium">
        {{ attachmentCountDisplay }}
      </BaseText>
    </div>
    <div class="item-date">
      <BaseText variant="body-2-semibold">{{ timestamp }}</BaseText>
    </div>
    <div class="hover-actions">
      <div
        class="hover-actions-icon-wrapper gold"
        @click.stop.prevent="toggleStar"
      >
        <InlineSvg
          :key="isStarred ? 'star' : 'star-outline'"
          :name="isStarred ? 'star' : 'star-outline'"
        />
      </div>

      <div
        class="hover-actions-icon-wrapper"
        @click.stop.prevent="toggleRead"
      >
        <InlineSvg
          :key="isRead ? 'mark-as-unread' : 'mark-as-read'"
          :name="isRead ? 'activity-mark-as-unread' : 'activity-mark-as-read'"
        />
      </div>

      <div
        class="hover-actions-icon-wrapper"
        @click.stop.prevent="showDeleteModal"
      >
        <InlineSvg name="delete-trash" />
      </div>
    </div>
  </button>
</template>
<style scoped lang="scss">
/* stylelint-disable */
.list-item {
  width: auto;
  min-width: 100%;
  display: flex;
  align-items: center;
  color: $color-primary-100;
  cursor: pointer;
  background-color: $color-base-white-100;
  border: none;
  border-bottom: 1px solid $color-primary-10;
  padding: 8px 20px;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  position: relative;

  .hover-actions {
    display: none;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    background-color: $color-base-white-100;
    padding-right: 16px;
    padding-left: 8px;
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

    .hover-actions-icon-wrapper {
      border-radius: 50%;
      height: 32px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;

      svg {
        color: $color-primary-70;
        height: 18px;
        width: 18px;
      }

      &:hover {
        background-color: $color-primary-10;

        &.gold {
          background-color: rgba($color-warning, 0.2) !important;
        }
      }

      &.gold {
        svg {
          color: $color-warning;
        }
      }
    }
  }

  &:hover {
    box-shadow: 0 0 28px 0 $color-box-shadow;
    border-bottom: 1px solid $color-primary-1;
    transform: scale(1.01) translate3d(0, 0, 0);
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    z-index: 2;

    .hover-actions {
      display: flex;
    }
  }

  &.read {
    background-color: $color-primary-5 !important;
    border-bottom: 1px solid $color-primary-10;

    .hover-actions {
      background-color: $color-primary-5 !important;

      .hover-actions-icon-wrapper {
        &:hover {
          background-color: $color-primary-20;
        }
      }
    }

    &:hover {
      box-shadow: 0 0 28px 0 $color-box-shadow;
      z-index: 2;
    }

    .item-name {
      span {
        color: $color-primary-70;
        font-weight: 400 !important;
      }
    }

    .item-title {
      svg {
        color: $color-primary-70;
      }

      span {
        color: $color-primary-70;
        font-weight: 400 !important;
      }

      &.starred {
        svg {
          color: $color-warning;
        }
      }
    }

    .item-attachment {
      span {
        color: $color-primary-70;
        font-weight: 400 !important;
      }
    }

    .item-date {
      span {
        color: $color-primary-70;
        font-weight: 400 !important;
      }
    }
  }

  &.selected {
    background-color: $color-primary-10 !important;
    border-bottom: 1px solid $color-primary-20;

    &:hover {
      box-shadow: 0 0 28px 0 $color-box-shadow;
      z-index: 2;
    }
  }

  .item-select {
    width: 32px;
    height: 32px;
    padding: 8px;
    margin-right: 8px;
  }

  .item-name {
    display: flex;
    align-items: center;
    width: 310px;
    margin-right: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .icon {
      margin-right: 8px;
    }

    span {
      color: $color-primary-100;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .item-title {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    position: relative;
    margin-right: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: $color-primary-100;

    .content {
      max-width: 450px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      flex: 1;
    }

    .highlight-text {
      color: $color-info !important;
      font-weight: 600 !important;
    }

    svg {
      width: 16px;
      flex-shrink: 0;
    }

    span {
      color: $color-primary-100;
      display: inline-block;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &.starred {
      svg {
        color: $color-warning;
        margin-top: -1px;
      }
    }
  }

  .item-attachment {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    max-width: 135px;
    background-color: $color-primary-1;
    position: relative;
    padding: 5px 12px 5px 26px;
    border-radius: 31px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    svg {
      margin-right: 8px;
      position: absolute;
      left: 7px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      color: $color-success;
    }

    span {
      color: $color-primary-100;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .item-date {
    width: 128px;
    text-align: right;
    color: $color-primary-100;
  }
}

@media (width <= 1230px) {
  .list-item {
    // width: 100%;
    .item-name {
      // full width - left nav - date section - (select button + padding)
      width: calc((100vw - 240px - 128px - 80px) / 3);
    }

    .item-title {
      // full width - left nav - date section - (select button + padding)
      width: calc((100vw - 240px - 128px - 80px) / 3);

      .content {
        // full width - left nav - date section - (select button + padding)
        width: calc((100vw - 240px - 128px - 80px) / 3);

        span {
          // 100% - icon
          width: 100%;
        }
      }
    }

    .item-attachment {
      // full width - left nav - date section - (select button + padding)
      width: calc((100vw - 240px - 128px - 80px) / 3);
    }

    // .item-date {
    //   width: 100px;
    // }
  }
}
</style>
