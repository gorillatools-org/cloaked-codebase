<script setup>
import {
  computed,
  reactive,
  nextTick,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  markRaw,
  watch,
  ref,
} from "vue";
import { inbox as inboxScripts } from "@/scripts/inbox";
import UiTooltip from "@/features/ui/ui-tooltip";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import ArrowButton from "@/features/ArrowButton.vue";
import store from "@/store";
import InboxRecipientDetails from "@/features/inbox/InboxRecipientDetails.vue";
import ContactIcon from "@/features/ui/ContactIcon.vue";

import InboxSafeUGC from "@/features/inbox/InboxSafeUGC.vue";
import AddVerifyEmail from "@/features/modals/AddVerifyEmail.vue";

import { useToast } from "@/composables/useToast.js";
import { useRoute } from "vue-router";

import InboxService from "@/api/actions/inbox-service.js";
import ContactsService from "@/api/actions/contacts-service.js";
import PersonalInfoServices from "@/api/settings/personal-services.js";
import IdentityService from "@/api/actions/identity-service.js";
import InfiniteLoader from "@/features/global/InfiniteLoader.vue";
import router from "@/routes/router";
import InlineSvg from "@/features/InlineSvg.vue";
import BlockContactsConfirmation from "@/features/modals/contacts/BlockContactsConfirmation.vue";
import { constants } from "@/scripts/constants";
import { timestamp } from "@/scripts/timestamp_format";
import { sanitize } from "@/scripts/sanitize";
import BaseText from "@/library/BaseText";
import { useDisplay } from "@/composables/useDisplay.js";
import { fetchFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";

const route = useRoute();
const toast = useToast();

const state = reactive({
  emailContentById: {},
  openEmailIds: [],
  showFwdMenu: false,
  thread: [],
  showRecipientModal: false,
  activityDetailsById: {},
  identityUrl: null,
  threadCount: 0,
  nextUrl: null,
  pageLoaded: false,
  threadId: route?.params?.id,
  emailCount: 0,
  error: false,
});

let pollingInterval;
let loadedDate = new Date();

let activity25Flag = ref(false);

onBeforeMount(async () => {
  let nextUrl = `/api/v2/cloaked/activity/thread/${state.threadId}/?ordering=created_at`;
  try {
    const { value } = await fetchFeatureFlag("dashboard-activity-2-5");
    activity25Flag.value = value;
    if (value) {
      nextUrl = `/api/v2_5/cloaked/activity/?thread_id=${state.threadId}&ordering=created_at`;
    }
  } catch {
    activity25Flag.value = false;
  }
  state.nextUrl = nextUrl;

  document.addEventListener("visibilitychange", togglePolling);

  const promises = [
    fetchThread(state.threadId),
    PersonalInfoServices.getPersonalEmails(),
    markRead(false),
  ];
  nextTick(() => {
    Promise.all(promises)
      .finally(() => {
        state.pageLoaded = true;
      })
      .catch(() => {
        state.pageLoaded = true;
        toast.error("Error fetching data. Try refreshing the page.");
      });
  });
});
onMounted(() => {
  window.addEventListener("contact:blocked", contactBlockedEvtListener);
});

onBeforeUnmount(() => {
  window.removeEventListener("contact:blocked", contactBlockedEvtListener);
});

onBeforeUnmount(() => {
  clearInterval(pollingInterval);
  document.removeEventListener("visibilitychange", togglePolling);
});

const identity = computed(() => {
  if (!state.identityUrl) {
    return null;
  }
  const id = parseInt(state.identityUrl?.match(/\/(\d+)\/$/)[1], 10);
  return store.state.localdb.db_cloaks.find((i) => i.id === id);
});

const usersVerifiedEmails = computed(() => {
  return store.getters["settings/getVerifiedEmails"];
});

function togglePolling() {
  if (document.hidden) {
    clearInterval(pollingInterval);
  } else {
    if (state.emailCount === state.thread.length) {
      // NOTE: start polling after most recent email is fetched
      pollingInterval = setInterval(fetchThreadPolling, 60 * 1000);
    }
  }
}

function updateStateWithPollingData(newEmails) {
  newEmails = newEmails.filter((newActivity) => {
    return !state.thread.find((activity) => activity.id === newActivity.id);
  });
  state.thread = [...state.thread, ...newEmails];
  const latestEmail = newEmails.pop();
  if (latestEmail) {
    // NOTE: need to fetch content first
    openFullEmail(latestEmail);
    loadedDate = new Date(latestEmail.updated_at);
    loadedDate.setSeconds(loadedDate.getSeconds() + 1);
    toast.success("Scroll down to see new emails");
  }
}

function fetchThreadPolling() {
  const updated_at__gt = loadedDate.toISOString();
  let url = activity25Flag.value
    ? `/api/v2_5/cloaked/activity/?thread_id=${state.threadId}&ordering=created_at&updated_at__gt=${updated_at__gt}&page_size=50`
    : `/api/v2/cloaked/activity/thread/${state.threadId}?ordering=created_at&updated_at__gt=${updated_at__gt}&page_size=50`;
  InboxService.getThread(url).then(({ data }) => {
    if (data.count) {
      state.emailCount = data.count;
      if (data.count === data.results.length) {
        return updateStateWithPollingData(data.results);
      }

      url += `page_size=${data.count}`;
      InboxService.getThread(url).then(({ data }) => {
        updateStateWithPollingData(data.results);
      });
    }
  });
}

function contactBlockedEvtListener(event) {
  const allSendersContact = [...state.thread]
    .filter((activity) => activity?.email?.sender_contact)
    .map((activity) => activity.email.sender_contact);
  if (allSendersContact.find((contact) => contact?.id === event.detail.id)) {
    router.push({ name: "Inbox" });
  }
}

function fetchThread() {
  if (!state.fetching && state.nextUrl) {
    state.fetching = true;

    return InboxService.getThread(state.nextUrl)
      .then(({ data }) => {
        const item = [...data.results].pop();
        state.thread = [...state.thread, ...data.results];
        state.nextUrl = data.next;
        window.dispatchEvent(
          new CustomEvent("star-updated", {
            detail: { starred: item?.starred },
          })
        );

        if (!state.identityUrl) {
          state.identityUrl = item?.identity;
          nextTick(() => {
            IdentityService.patchIdentityUpdatedAt(identity.value.id);
          });
        }
        if (!state.threadCount) {
          state.threadCount = data.count;
        }

        state.fetching = false;
        if (state.thread.length > 0) {
          const item = [...state.thread].pop();
          handleFullEmailToggle(item);
        }

        if (!data.next) {
          // NOTE: start polling after most recent email is fetched
          pollingInterval = setInterval(fetchThreadPolling, 60 * 1000);
        } else {
          clearInterval(pollingInterval);
        }
      })
      .catch(() => {
        state.error = true;
        state.fetching = false;
        toast.error("Error fetching data. Try refreshing the page.");
      });
  }
}

function getFileExt(media) {
  const nameSplit = media?.file_name.split(".");
  return nameSplit[nameSplit.length - 1];
}

function handleForwardingEmail(activity, verifiedEmail) {
  state.showFwdMenu = false;
  if (verifiedEmail) {
    return forwardEmail(activity, verifiedEmail);
  }

  return store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddVerifyEmail),
      props: {
        setPrimary: true,
      },
      events: {
        "email-verified": (forwardingEmail) =>
          forwardEmail(activity, forwardingEmail.email),
      },
    },
  });
}

function forwardEmail(activity, forwardingEmail) {
  const content = state.emailContentById[activity?.id];
  const payload = {
    to: forwardingEmail,
    subject: activity?.email?.subject,
    original_html: content.trim(),
  };

  return InboxService.postEmailForward(activity?.id, payload)
    .then(() => {
      toast.success("Email forwarded");
    })
    .catch(() => {
      toast.error(
        "Something went wrong trying to send your email. Please try again"
      );
    });
}

function toggleBlockStatus(senderContact) {
  const contactType = constants.CONTACT_TYPE.EMAIL;
  const newStatus =
    senderContact.status === constants.CONTACT_STATUS.BLOCKED
      ? constants.CONTACT_ACTION.APPROVE
      : constants.CONTACT_ACTION.BLOCK;
  ContactsService.changeContactStatus(contactType, senderContact?.id, newStatus)
    .then((res) => {
      toast.success(
        `Contact ${
          newStatus === constants.CONTACT_ACTION.BLOCK ? "blocked" : "unblocked"
        }`
      );
      updateContact(res.status, senderContact);
    })
    .catch(() => {
      toast.error("Something went wrong. Please try again later.");
    });
}

function showBlockConfirmation(senderContact) {
  if (senderContact.status === constants.CONTACT_STATUS.APPROVED) {
    return store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(BlockContactsConfirmation),
        props: {
          contact: senderContact,
          identityId: identity?.value?.id,
        },
        events: {
          blockContact: () => toggleBlockStatus(senderContact),
        },
      },
    });
  }

  return toggleBlockStatus(senderContact);
}

function updateContact(newStatus, senderContact) {
  state.thread = state.thread?.map((activity) => {
    if (activity?.email?.sender_contact?.id === senderContact.id) {
      activity.email.sender_contact.status = newStatus;
    }
    return activity;
  });
}

async function reply(activity) {
  if (!activity) {
    if (state.thread.length === state.threadCount) {
      activity = [...state.thread].pop();
    } else {
      const threadId = route?.params?.id;
      const url = activity25Flag.value
        ? `/api/v2_5/cloaked/activity/?thread_id=${threadId}&ordering=-created_at&page_size=1`
        : `/api/v2/cloaked/activity/thread/${threadId}/?ordering=-created_at&page_size=1`;
      const mostRecentActivityResp = await InboxService.getThread(url);
      activity =
        mostRecentActivityResp.data.results[
          mostRecentActivityResp.data.results.length - 1
        ] || null;
    }
  }

  let originalEmailContent = state.emailContentById[activity.id];
  if (!originalEmailContent) {
    originalEmailContent = await fetchEmailContent(activity);
  }

  store.commit("replyTo", {
    identity: identity.value,
    activity_id: activity.id,
    payload: {
      ...activity.email,
      html: originalEmailContent,
      onSend: ({ data }) => {
        IdentityService.patchIdentityUpdatedAt(identity.value.id);
        state.thread = [...state.thread, data];
      },
    },
  });
}

function toggleReadState(email) {
  if (email.read) {
    return markUnread(email.url);
  }
  return markRead(email.url);
}

function markRead(showToast = true) {
  InboxService.markThreadsAsRead([state.threadId])
    .then(() => {
      store.dispatch("updateActivityCachedData", {
        threadId: state.threadId,
        key: "read",
        value: true,
      });
      if (showToast) {
        toast.success("Email marked as read");
      }
    })
    .catch(() => {
      if (showToast) {
        toast.error("Error updating data");
      }
    });
}

function markUnread() {
  InboxService.markThreadsAsUnread([state.threadId])
    .then(() => {
      store.dispatch("updateActivityCachedData", {
        threadId: state.threadId,
        key: "read",
        value: false,
      });
      toast.success("Email marked as unread");
    })
    .catch(() => {
      toast.error("Error updating data");
    });
}

function handleFullEmailToggle(activity) {
  if (state.openEmailIds.includes(activity.id)) {
    closeFullEmail(activity);
  } else {
    openFullEmail(activity);
  }
}

function openFullEmail(activity) {
  if (state.emailContentById[activity.id]) {
    state.openEmailIds = [...state.openEmailIds, activity.id];
    return;
  }

  // NOTE: we have to fetch this to get attachments
  InboxService.getActivityDetails(activity.id).then(({ data }) => {
    state.activityDetailsById = {
      ...state.activityDetailsById,
      [activity.id]: data,
    };
  });

  return fetchEmailContent(activity).then(() => {
    state.openEmailIds = [...state.openEmailIds, activity.id];
  });
}

function fetchEmailContent(activity) {
  if (!activity?.email?.content_uri) {
    console.error("No content_uri found for activity", activity);
    return Promise.resolve("");
  }
  return InboxService.getContentUri(activity.email.content_uri).then(
    ({ data }) => {
      if (!data.length) {
        console.error("No data returned from getContentUri", data);
        return "";
      }
      state.emailContentById[activity.id] = data;
      return data || "";
    }
  );
}

function closeFullEmail(activity) {
  state.openEmailIds = state.openEmailIds.filter((id) => id !== activity.id);
}

function shouldShowFwdMenu(status) {
  state.showFwdMenu = status;
}

function toggleRecipientModal(activityId) {
  state.showRecipientModal = activityId;
}

function handleGoBack() {
  const prevRouteName = store.getters["navigation/previousRouteName"];
  const allInboxListRoutes = store.getters["navigation/allInboxListRoutes"];
  if (!!prevRouteName && allInboxListRoutes.includes(prevRouteName)) {
    router.back();
  } else {
    router.push({ name: "Inbox" });
  }
}

function deleteActivity(activity) {
  store.dispatch("openModal", {
    header: `Delete this email?`,
    subheader:
      "Any copies of this message that have been forwarded to your personal email will be unaffected. This cannot be undone.",
    button: {
      text: "Yes, Delete",
      onClick: () => {
        store.dispatch("closeModal");
        if (!activity?.email?.id) {
          toast.error("Cannot delete email: invalid email data");
          return;
        }
        InboxService.deleteEmail(activity?.email?.id)
          .then(async () => {
            toast.success("Email deleted");
            state.thread = state.thread.filter(
              (item) => item.id !== activity.id
            );
            if (state.thread.length === 0) {
              await store.dispatch("deleteCacheAllPages", {
                url: "api/v2/cloaked/activity/",
              });
              await store.dispatch("deleteCacheAllPages", {
                url: "api/v2_5/cloaked/activity/",
              });
              setTimeout(() => {
                nextTick(handleGoBack);
              }, 500);
            }
            const threadId = route?.params?.id;
            fetchThread(threadId);
          })
          .catch(() => {
            toast.error("Error deleting email");
          });
      },
      danger: true,
    },
    cancelText: "Cancel",
  });
}
const earliest = computed(() => {
  return state.thread[0];
});
const subject = computed(() => {
  const item = earliest.value;
  return sanitize.safe_title(item?.email?.subject) || "(no subject)";
});

watch(
  () => state.identityUrl,
  (newVal) => {
    if (newVal) {
      const id = parseInt(state.identityUrl?.match(/\/(\d+)\/$/)[1], 10);
      const identity = store.state.localdb.db_cloaks.find((i) => i.id === id);
      if (!identity) {
        store.dispatch("fetchPopulatedData", { id });
      }
    }
  },
  { immediate: true }
);

const { isMobile } = useDisplay();
</script>

<template>
  <div>
    <div
      v-if="!state.pageLoaded"
      class="loading-skeleton"
    >
      <InlineSvg name="loading-small" />
    </div>
    <div
      class="email-page"
      :class="{ active: state.pageLoaded }"
    >
      <section>
        <BaseText
          as="div"
          variant="headline-3-bold"
          class="email-subject"
        >
          {{ subject }}
        </BaseText>
      </section>
      <section
        v-for="(activity, index) in state.thread"
        :id="`${state.thread.length - 1 === index ? 'lastEmail' : ''}`"
        :key="`email-${activity.id}-${activity?.email?.id}`"
        class="email-thread-wrapper"
        :class="{
          'hover-color': !state.openEmailIds.includes(activity.id),
          open: state.openEmailIds.includes(activity.id),
        }"
        @click.self="handleFullEmailToggle(activity)"
      >
        <div
          class="masked-clickable-content"
          :class="{ hidden: state.openEmailIds.includes(activity.id) }"
          @click="handleFullEmailToggle(activity)"
        />
        <div
          class="email-header"
          :class="{ 'is-open': state.openEmailIds.includes(activity.id) }"
        >
          <div class="email-contact-row">
            <ContactIcon
              :initials="
                inboxScripts.getSenderInitialsFromEmail(activity?.email)
              "
            />
            <div class="email-contact-row-middle">
              <div class="sender">
                <BaseText
                  as="div"
                  variant="body-2-semibold"
                  class="sender-name"
                >
                  {{
                    !activity?.inbound
                      ? "Me"
                      : activity?.email?.sender_name || "Unknown"
                  }}
                </BaseText>
              </div>
              <BaseText
                v-if="state.openEmailIds.includes(activity.id)"
                as="div"
                variant="body-2-semibold"
                class="receiver"
              >
                to
                {{
                  activity?.inbound
                    ? "me"
                    : inboxScripts.displayRecipients(
                        activity?.email?.to_recipients
                      )
                }}
                <ArrowButton
                  :is-open="state.showRecipientModal === activity.id"
                  :disabled="state.showRecipientModal === activity.id"
                  @click="toggleRecipientModal(activity.id)"
                />
                <InboxRecipientDetails
                  v-if="state.showRecipientModal === activity.id"
                  :message="activity"
                  @close="toggleRecipientModal(null)"
                />
              </BaseText>
              <InboxSafeUGC
                v-else
                content-type="email_preview"
                :content="activity?.email?.body_preview"
                :remove-new-lines="true"
                :inbound="true"
                :override-body-style="{
                  overflow: 'hidden',
                  'text-overflow': 'ellipsis',
                  height: '20px',
                  cursor: 'pointer',
                  width: '100%',
                  color: '#8C8E91',
                }"
              />
            </div>
          </div>
          <div class="time-file-row">
            <InlineSvg
              name="inbox/file-outline"
              class="attachments-icon"
              :class="{
                hidden: !(
                  !state.openEmailIds.includes(activity.id) &&
                  activity?.email?.has_attachments
                ),
              }"
            />
            <BaseText
              as="span"
              variant="body-small-medium"
            >
              {{
                inboxScripts.getTimeDisplay(activity?.email?.delivery_datetime)
              }}
            </BaseText>
            <BaseText
              as="span"
              variant="body-small-medium"
              class="time-slang"
            >
              ({{ timestamp.humanize(activity?.email?.delivery_datetime) }})
            </BaseText>
          </div>
          <div
            :class="{ hidden: !state.openEmailIds.includes(activity.id) }"
            class="email-actions-row"
          >
            <UiTooltip
              title="Reply"
              align-x="center"
              position="bottom"
              class="action-icons"
              :class="{ open: state.openEmailIds.includes(activity.id) }"
              @click="reply(activity)"
            >
              <InlineSvg name="reply" />
            </UiTooltip>

            <UiMenu
              width="247px"
              max-height="300px"
              placement="bottom-end"
              class="ui-menu"
              :class="{ hidden: !state.openEmailIds.includes(activity.id) }"
            >
              <UiTooltip
                title="Options"
                align-x="center"
                position="bottom"
                :class="{ open: state.openEmailIds.includes(activity.id) }"
                class="action-icons"
              >
                <InlineSvg name="kabob" />
              </UiTooltip>
              <template #content>
                <UiMenuButton
                  :title="`Mark as ${
                    activity?.email?.read ? 'unread' : 'read'
                  }`"
                  @click="toggleReadState(activity?.email)"
                  @mouseover="shouldShowFwdMenu(false)"
                >
                  <template #icon>
                    <InlineSvg
                      v-if="activity?.email?.read === 'read'"
                      name="activity-mark-as-read"
                    />
                    <InlineSvg
                      v-else
                      name="activity-mark-as-unread"
                    />
                  </template>
                </UiMenuButton>

                <UiMenu
                  width="247px"
                  max-height="300px"
                  placement="left-start"
                  :value="state.showFwdMenu"
                  :offset-away="10"
                  class="fwd-menu"
                >
                  <UiMenuButton
                    :title="`Forward to${
                      usersVerifiedEmails.length ? ' my personal email' : '...'
                    }`"
                    @mouseenter="shouldShowFwdMenu(true)"
                    @click="
                      !usersVerifiedEmails.length &&
                      handleForwardingEmail(activity)
                    "
                  >
                    <template #icon>
                      <InlineSvg name="forward" />
                    </template>
                  </UiMenuButton>
                  <template #content>
                    <UiMenuButton
                      v-for="verifiedEmail in usersVerifiedEmails"
                      :key="verifiedEmail.email"
                      :title="verifiedEmail.email"
                      @click="
                        handleForwardingEmail(activity, verifiedEmail.email)
                      "
                    />

                    <UiMenuSeparator />
                    <UiMenuButton
                      title="Add a new email address"
                      @click="handleForwardingEmail(activity)"
                    >
                      <template #icon>
                        <InlineSvg name="plus" />
                      </template>
                    </UiMenuButton>
                  </template>
                </UiMenu>

                <UiMenuButton
                  v-if="activity?.inbound"
                  :title="`${
                    activity?.email?.sender_contact?.status ===
                    constants.CONTACT_STATUS.BLOCKED
                      ? 'Unblock'
                      : 'Block'
                  } this contact`"
                  @mouseover="shouldShowFwdMenu(false)"
                  @click="
                    showBlockConfirmation(activity?.email?.sender_contact)
                  "
                >
                  <template #icon>
                    <InlineSvg name="contacts/block" />
                  </template>
                </UiMenuButton>
                <UiMenuSeparator />

                <UiMenuButton
                  title="Delete this message"
                  danger
                  @click="deleteActivity(activity)"
                  @mouseover="shouldShowFwdMenu(false)"
                >
                  <template #icon>
                    <InlineSvg name="delete-trash" />
                  </template>
                </UiMenuButton>
              </template>
            </UiMenu>
          </div>
        </div>
        <div
          v-if="state.openEmailIds.includes(activity.id)"
          class="email-body"
        >
          <InboxSafeUGC
            content-type="email_body"
            :content="state.emailContentById[activity.id]"
            :inbound="true"
            :attachments="
              state.activityDetailsById[activity.id]?.email?.attachments
            "
            :override-body-style="{
              'word-break': 'break-word',
              width: '100%',
            }"
          />
          <div v-if="activity?.email?.has_attachments">
            <BaseText
              v-if="!state.activityDetailsById[activity.id]"
              as="div"
              variant="body-3-semibold"
            >
              Loading attachments...
            </BaseText>
            <div v-else>
              <div class="attachments-header-row">
                <BaseText
                  as="div"
                  variant="body-3-semibold"
                >
                  {{
                    `${
                      state.activityDetailsById[activity.id]?.email?.attachments
                        ?.length || ""
                    } attachment${
                      state.activityDetailsById[activity.id]?.email?.attachments
                        ?.length !== 1
                        ? "s"
                        : ""
                    }`
                  }}
                </BaseText>
              </div>
              <div class="attachments-row">
                <a
                  v-for="(media, i) in state.activityDetailsById[activity.id]
                    ?.email?.attachments"
                  :key="`media-${i}`"
                  :href="media.url"
                  target="_blank"
                  download
                  class="attachment-item media-link"
                >
                  <div
                    v-if="inboxScripts.isImage(media.url)"
                    class="media-image-display"
                    :style="{
                      'background-image': `url(${media.url})`,
                      'background-size': 'cover',
                      'background-position': 'center',
                    }"
                  />

                  <div
                    v-else
                    class="media-type-display"
                  >
                    <BaseText
                      as="div"
                      :variant="isMobile ? 'caption-semibold' : 'label-medium'"
                      class="media-type-name"
                    >
                      {{ getFileExt(media) }}
                    </BaseText>
                    <InlineSvg name="inbox/file" />
                  </div>
                  <div class="attachment-footer">
                    <BaseText
                      as="span"
                      variant="body-3-semibold"
                    >
                      {{ media?.name || media?.file_name }}
                    </BaseText>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InfiniteLoader
        v-if="state.pageLoaded && !state.error"
        key="infinite-emails"
        :loading="state.fetching"
        :all-data-fetched="!state.nextUrl"
        @load-more="fetchThread"
      />
      <div style="height: 55px" />

      <BaseText
        as="div"
        variant="body-3-semibold"
        class="reply-input"
        @click="reply(null)"
      >
        Write a reply
        <InlineSvg name="inbox/send-arrow" />
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
@media (width <= calc(834px + 240px)) {
  .masked-clickable-content {
    width: 600px;
  }
}

.masked-clickable-content {
  position: absolute;
  background-color: transparent;
  z-index: 2;
  height: 95px;
  width: 814px;
  border-radius: 20px;
  margin-top: -24px;
  margin-left: -24px;
}

.loading-skeleton {
  position: fixed;
  left: 240px;

  // height - navheader- banner
  height: calc(100vh - 60px);
  width: calc(100vw - 240px);
  z-index: -1;
  background-color: $color-base-white-100;
  display: flex;
  align-content: flex-start;
  flex-wrap: wrap;
  color: $color-primary-50;
  padding-top: 40px;

  svg {
    width: 40px;
    height: 40px;
  }
}

.hidden {
  display: none !important;
}

.email-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease-in-out,
    visibility 0.3s ease-in-out;
  padding: 40px 24px;
  overflow: hidden;

  &.active {
    opacity: 1;
    visibility: visible;
  }

  > section {
    width: 100%;
  }

  @media (width <= calc(834px + 240px)) {
    .time-slang {
      display: none;
    }
  }

  .reply-input {
    cursor: pointer;
    position: fixed;
    bottom: 26px;
    right: 26px;
    box-shadow:
      5.45px 5.45px 20.9px 0 rgb(1 2 24 / 12%),
      -3.633px -3.633px 10.899px 0 rgb(0 0 0 / 4%);
    border: 1px solid $color-primary-10;
    padding: 17.5px;
    height: 62.5px;
    width: 372px;
    background-color: $color-base-white-100;
    color: $color-primary-50;
    border-radius: 17.5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    z-index: 3;

    > svg {
      height: 26.5px;
      width: 26.5px;
    }

    &:hover {
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      transform: scale(1.01);
      background-color: $color-primary-5;
    }
  }
}

.action-icons {
  color: $color-primary-90;
  cursor: pointer;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;

  &.open {
    color: $color-primary-90;

    &:hover {
      background-color: $color-primary-10;
    }
  }

  &:hover {
    background-color: $color-primary-10;
  }
}

.email-thread-wrapper {
  border: 1px solid $color-primary-10;
  border-radius: 20px;
  margin-bottom: 10px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &.hover-color {
    &:hover {
      background-color: $color-primary-5;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      transform: scale(1.01);
    }
  }

  &.open {
    background-color: $color-base-white-100;

    .email-header {
      color: $color-primary-70;

      .email-contact-row .email-contact-row-middle .sender-name {
        color: $color-primary-100;
      }
    }
  }

  .email-header {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    color: $color-primary-70;
    padding: 18px 24px;

    &.is-open {
      align-items: flex-start;
    }

    .time-file-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 4px;

      .attachments-icon {
        color: $color-primary-70;
      }
    }

    .email-actions-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      margin-top: -5px;
      margin-left: 10px;
    }

    .email-contact-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      flex-grow: 1;

      .email-contact-row-middle {
        width: 100%;

        .sender {
          display: flex;
          flex-direction: row;
          gap: 4px;
          align-items: flex-end;
        }

        .sender-name {
          color: $color-primary-100;
        }

        .sender-email {
          margin-bottom: 2px;
          color: $color-primary-50;

          &::before {
            content: "(";
          }

          &::after {
            content: ")";
          }
        }

        > iframe {
          width: 100%;
        }
      }
    }
  }

  .email-body {
    color: $color-primary-100;
    background-color: $white;
    gap: 9px;
    padding: 24px 24px 24px 74px;

    iframe {
      border-radius: 12px;
    }

    .attachments-header-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 4px;
      color: $color-primary-100-light;
      margin-top: 32px;
      margin-bottom: 16px;

      .attachments-download {
        text-decoration: underline;
        cursor: pointer;
      }
    }

    .attachments-row {
      display: flex;
      flex-flow: row wrap;
      width: 100%;
      align-items: center;
      justify-content: flex-start;
      gap: 9px;
      overflow: auto;

      .attachment-item {
        background-color: $color-primary-1;
        border: 1px solid $color-primary-5;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 0;
        max-width: 200px;

        .media-image-display {
          max-height: 100px;
          height: 100px;
          width: 100%;
          min-width: 180px;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
        }

        .media-type-display {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background-color: $color-brand-6-10;
          color: $color-brand-6-10;
          width: 100%;
          height: 100px;
          min-width: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;

          > svg {
            color: $color-brand-6-100;
            height: 48px;
            width: 44px;
            position: absolute;
          }

          .media-type-name {
            color: $color-brand-6-10;
            position: relative;
            z-index: 100;
            top: 10px;
            line-height: normal;
          }
        }

        .attachment-footer {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          color: $color-primary-100;
          padding: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;

          > span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
}

.email-subject {
  color: $color-primary-100;
  margin-bottom: 20px;
  word-break: break-all;
}

.email-identity {
  color: $color-primary-100;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-top: 4px;
  margin-bottom: 24px;
  cursor: pointer;
}
</style>
