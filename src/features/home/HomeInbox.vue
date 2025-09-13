<script setup>
import { onMounted, reactive } from "vue";
import InboxService from "@/api/actions/inbox-service";
import router from "@/routes/router";
import { inbox as inboxScripts } from "@/scripts/inbox";
import store from "@/store";
import InlineSvg from "@/features/InlineSvg.vue";
import IdentityIcon from "@/features/ui/IdentityIcon";
import HomeInboxLoadingSkeleton from "@/features/home/HomeInboxLoadingSkeleton.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { formattedText } from "@/scripts/formattedText";
import { constants } from "@/scripts/constants";
import BaseText from "@/library/BaseText.vue";

const state = reactive({
  activity: [],
  loaded: false,
});

onMounted(() => {
  const allInboxParams = {
    contact_status: "approved",
    muted: false,
    page_size: 5,
    page: 1,
  };
  const useCache = false;
  InboxService.getInbox(allInboxParams, useCache)
    .then((response) => {
      state.activity = response?.data?.results;
      state.loaded = true;
    })
    .catch(() => {
      state.loaded = true;
    });
});

function getIdentity(activity) {
  const id = parseInt(activity.identity.match(/\/(\d+)\/$/)[1], 10);
  const identity = store.state.localdb.db_cloaks.find((i) => i.id === id);
  return identity;
}

function getIdentityName(activity) {
  const identity = getIdentity(activity);
  return formattedText.getFormattedNickname(identity);
}

function openThread(activity) {
  const activityType = activity.email ? "emails" : "messages";
  posthogCapture("user_clicked_homepageinboxactivity");
  router.push({ path: `/inbox/${activityType}/${activity.thread_id}/` });
}

function timestamp(updatedAt) {
  const small = true;
  return inboxScripts.getTimeDisplayInboxList(updatedAt, small);
}

function getActivityType(activity) {
  if (activity.message) {
    return constants.INBOX_TYPES.MESSAGE;
  }
  if (activity.call) {
    return constants.INBOX_TYPES.CALL;
  }
  return constants.INBOX_TYPES.EMAIL;
}

function isRead(activity) {
  const activityType = getActivityType(activity);
  if (activityType === constants.INBOX_TYPES.EMAIL) {
    return activity.email.read;
  }
  if (activityType === constants.INBOX_TYPES.MESSAGE) {
    return activity.message.read;
  }
  if (activityType === constants.INBOX_TYPES.CALL) {
    return activity.call.read;
  }
  return false;
}

function getIcon(activity) {
  const activityType = getActivityType(activity);
  let iconType = "phone";
  if (activityType === constants.INBOX_TYPES.EMAIL) {
    iconType = "mail";
  } else if (activityType === constants.INBOX_TYPES.MESSAGE) {
    iconType = "text";
  }
  const iconState = isRead(activity) ? "outline" : "filled";
  return `${iconType}-${iconState}`;
}

function getName(activity) {
  const activityType = getActivityType(activity);
  if (activityType === constants.INBOX_TYPES.EMAIL) {
    const senderName = inboxScripts.getFullContactNameStr(
      activity?.email?.sender_contact
    );
    return (
      (senderName.length && senderName) ||
      activity?.email?.sender_name ||
      getIdentityName(activity)
    );
  } else if (activityType === constants.INBOX_TYPES.CALL) {
    const senderName = inboxScripts.getFullContactNameStr(
      activity?.call?.sender_contact
    );
    return (
      (senderName.length && senderName) ||
      activity?.call?.sender_name ||
      getIdentityName(activity)
    );
  } else if (activityType === constants.INBOX_TYPES.MESSAGE) {
    const senderName = inboxScripts.getFullContactNameStr(
      activity?.message?.sender_contact
    );
    return (
      (senderName.length && senderName) ||
      activity?.message?.sender_name ||
      getIdentityName(activity)
    );
  }
  return getIdentityName(activity);
}

function getTitle(activity) {
  const activityType = getActivityType(activity);
  if (activityType === constants.INBOX_TYPES.EMAIL) {
    return activity.email.subject || "(no subject)";
  }
  if (activityType === constants.INBOX_TYPES.MESSAGE) {
    return activity.message.body || "(no message)";
  }
  if (activityType === constants.INBOX_TYPES.CALL) {
    return activity.call.sender_contact?.location || "Unknown";
  }
  return null;
}

function openInbox() {
  router.push({ name: "Inbox" });
}
</script>
<template>
  <section class="inbox">
    <div class="title-row">
      <BaseText
        as="h1"
        variant="headline-3-bold"
      >
        Latest Messages
      </BaseText>
      <BaseText
        v-if="state.loaded && state.activity?.length"
        variant="body-3-semibold"
        as="div"
        underline
        class="link"
        @click="openInbox"
      >
        See all
      </BaseText>
    </div>
    <div
      v-if="state.loaded && state.activity?.length"
      class="inbox-wrapper"
    >
      <div
        v-for="activity in state.activity"
        :key="activity.thread_id"
        class="inbox-item-wrapper"
        @click="openThread(activity)"
      >
        <div class="inbox-item">
          <div class="top-row">
            <IdentityIcon
              :identity="getIdentity(activity)"
              :override="{
                width: '16px',
                height: '16px',
                'align-self': 'center',
              }"
              :no-gradient="true"
            />
            <BaseText
              as="div"
              variant="body-3-semibold"
              class="name"
              :class="{ bold: !isRead(activity) }"
            >
              {{ getName(activity) }}
            </BaseText>
            <div class="row-footer">
              <BaseText
                class="timestamp"
                as="div"
                variant="caption-semibold"
                :class="{ bold: !isRead(activity) }"
              >
                {{ timestamp(activity.created_at) }}
              </BaseText>
              <InlineSvg
                :class="{ bold: !isRead(activity) }"
                :name="getIcon(activity)"
              />
            </div>
          </div>
          <BaseText
            as="div"
            variant="body-small-medium"
            class="activity-content"
            :class="{ bold: !isRead(activity) }"
          >
            {{ getTitle(activity) }}
          </BaseText>
        </div>
      </div>
    </div>

    <div
      v-else-if="state.loaded && !state.activity?.length"
      class="inbox-empty"
    >
      <InlineSvg name="inbox" />
      <BaseText
        as="h3"
        variant="headline-6-medium"
      >
        No messages
      </BaseText>
    </div>
    <div
      v-else
      class="inbox-loading"
    >
      <HomeInboxLoadingSkeleton />
    </div>
  </section>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  color: $color-primary-100;

  .link {
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }
}

.inbox-wrapper {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: 1px solid $color-primary-10;
  width: 100%;
  overflow: hidden;

  .inbox-item-wrapper {
    width: 100%;
    height: auto;
    border-bottom: 1px solid $color-primary-10;
    overflow: hidden;

    .inbox-item {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
      padding: 12px;
      width: 100%;
      height: auto;
      gap: 4px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      &:hover {
        background-color: $color-primary-5;
      }

      .top-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 8px;

        .name {
          flex-grow: 1;
          color: $color-primary-70;
          flex-shrink: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .row-footer {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;

          .timestamp {
            color: $color-primary-70;
            width: 50px;
            text-align: right;
            margin-right: 4px;
          }

          > svg {
            color: $color-primary-70;
            height: 12px;
            width: 12px;
          }
        }
      }

      .title {
        color: $color-primary-70;
        margin-left: 24px;
        width: calc(100% - 24px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  &:last-of-type {
    border-bottom: none;
  }
}

.activity-content {
  color: $color-primary-70;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.bold {
  color: $color-primary-100 !important;
}

.inbox-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 324px;
  border-radius: 15px;
  border: 1px solid $color-primary-10;
  color: $color-primary-50;
}
</style>
