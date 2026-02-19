<script setup>
import {
  computed,
  reactive,
  ref,
  nextTick,
  onBeforeMount,
  watch,
  onBeforeUnmount,
  onMounted,
  markRaw,
} from "vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import InboxSafeUGC from "@/features/inbox/InboxSafeUGC.vue";
import InboxMessageFileList from "@/features/inbox/InboxMessageFileList.vue";
import InboxRequestHeader from "@/features/inbox/InboxRequestHeader.vue";
import { inbox as inboxScripts } from "@/scripts/inbox";
import store from "@/store";
import Button from "@/features/Button.vue";
import SendArrow from "@/assets/icons/inbox/send-arrow.svg";
import AttachmentsIcon from "@/assets/icons/inbox/attachments.svg";
import { useToast } from "@/composables/useToast.js";
import { useRoute } from "vue-router";
import InboxService from "@/api/actions/inbox-service";
import InboxFileAttachments from "@/features/inbox/InboxFileAttachments.vue";
import Download from "@/assets/icons/download.svg";
import FileFull from "@/assets/icons/inbox/file.svg";
import Block from "@/assets/icons/block.svg";
import Approve from "@/assets/icons/approve.svg";
import PersonalInfoServices from "@/api/settings/personal-services";
import InfiniteLoader from "@/features/global/InfiniteLoader.vue";
import InboxVoicemailPlayer from "@/features/inbox/InboxVoicemailPlayer.vue";
import InlineSvg from "@/features/InlineSvg";
import router from "@/routes/router";
import IdentityService from "@/api/actions/identity-service";
import BlockContactsConfirmation from "@/features/modals/contacts/BlockContactsConfirmation.vue";
import { format } from "@/scripts/format";
import { constants } from "@/scripts/constants";
import { validation } from "@/scripts/validation";
import { formattedText } from "@/scripts/formattedText";
import BaseText from "@/library/BaseText.vue";
import { fetchFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";

const route = useRoute();
const toast = useToast();
const fileAttachments = ref(null);
let activity25Flag = ref(false);

const state = reactive({
  reply: "",
  sendingReply: false,
  thread: [],
  files: [],
  loadingStatusChange: false,
  threadCount: 0,
  identityUrl: null,
  fetching: false,
  threadId: route?.params?.id,
  nextUrl: null,
  pageLoaded: false,
  initDataFetched: false,
  filesForRemoval: [],
  error: false,
});

let pollingInterval;
let loadedDate = new Date();

onBeforeMount(() => {
  pollingInterval = setInterval(fetchThreadPolling, 15 * 1000);
  // NOTE: this disabled polling when tab is inactive
  document.addEventListener("visibilitychange", togglePolling);
  fetchInitialData();
});

onMounted(() => {
  window.addEventListener("contact:blocked", contactBlockedEvtListener);
});

onBeforeUnmount(() => {
  clearInterval(pollingInterval);
  document.removeEventListener("visibilitychange", togglePolling);
  window.removeEventListener("contact:blocked", contactBlockedEvtListener);
});

const identity = computed(() => {
  const id = parseInt(state.identityUrl?.match(/\/(\d+)\/$/)[1], 10);
  return store.state?.localdb?.db_cloaks?.find((i) => i.id === id);
});

const headerNameDisplay = computed(() => {
  let fullName = inboxScripts.getFullContactNameStr(senderContact.value);

  if (fullName) {
    return fullName;
  } else if (senderContact.value?.cloak_contact_phone?.length) {
    return format.formatPhone(senderContact.value.cloak_contact_phone);
  }

  // NOTE: should never see this
  return "Unknown";
});

const senderContact = computed(() => {
  if (state.thread.length) {
    const latestActivity = state.thread[0];
    const latestDetail = latestActivity?.message || latestActivity?.call;
    return latestDetail?.sender_contact || latestDetail?.recipient_contacts[0];
  }
  return null;
});

const contactApproved = computed(() => {
  return senderContact.value?.status
    .toLowerCase()
    .includes(constants.CONTACT_STATUS.APPROVED);
});

const contactUnknown = computed(() => {
  return senderContact.value?.status
    .toLowerCase()
    .includes(constants.CONTACT_STATUS.UNKNOWN);
});

const contactBlocked = computed(() => {
  return senderContact.value?.status
    .toLowerCase()
    .includes(constants.CONTACT_STATUS.BLOCKED);
});

const contactNonCloakedPhone = computed(() => {
  if (senderContact.value) {
    return format.anonymPhone(senderContact.value?.original_phone);
  }
  return headerNameDisplay.value;
});

const senderCloakedPhone = computed(() => {
  return format.formatPhone(senderContact?.value?.cloak_contact_phone);
});

watch(
  () => state.initDataFetched,
  (newVal) => {
    if (newVal) {
      scrollToBottom();
    }
  },
  { deep: true }
);

watch(
  () => route?.params?.id,
  (newThreadId, oldThreadId) => {
    if (newThreadId !== oldThreadId) {
      state.reply = "";
      state.sendingReply = false;
      state.thread = [];
      state.files = [];
      state.loadingStatusChange = false;
      state.threadCount = 0;
      state.identityUrl = null;
      state.fetching = false;
      state.threadId = newThreadId;
      state.nextUrl = null;
      state.pageLoaded = false;
      state.initDataFetched = false;
      state.filesForRemoval = [];
      nextTick(fetchInitialData);
    }
  }
);

function togglePolling() {
  if (document.hidden) {
    clearInterval(pollingInterval);
  } else {
    pollingInterval = setInterval(fetchThreadPolling, 15 * 1000);
  }
}

function updateStateWithPollingData(newTexts) {
  newTexts = newTexts.filter((newActivity) => {
    return !state.thread.find((activity) => activity.id === newActivity.id);
  });
  state.thread = [...newTexts, ...state.thread];
  const latestText = newTexts.pop();
  if (latestText) {
    loadedDate = new Date(latestText.updated_at);
    loadedDate.setSeconds(loadedDate.getSeconds() + 1);
    scrollToBottom();
  }
  InboxService.markThreadsAsRead([state.threadId]);
  store.dispatch("updateActivityCachedData", {
    threadId: state.threadId,
    key: "read",
    value: true,
  });
}

function fetchThreadPolling() {
  const updated_at__gt = loadedDate.toISOString();
  let url = activity25Flag.value
    ? `/api/v2_5/cloaked/activity/?thread_id=${state.threadId}&ordering=-created_at&updated_at__gt=${updated_at__gt}`
    : `/api/v2/cloaked/activity/thread/${state.threadId}/?ordering=-created_at&updated_at__gt=${updated_at__gt}`;
  InboxService.getThread(url).then(({ data }) => {
    if (data.count) {
      if (data.count === data.results.length) {
        return updateStateWithPollingData(data.results);
      }

      url += `page_size=${data.count}`;
      InboxService.getThread(url).then(({ data }) => {
        return updateStateWithPollingData(data.results);
      });
    }
  });
}

function contactBlockedEvtListener(event) {
  if (event.detail.id === senderContact.value?.id) {
    router.push({ name: "Inbox" });
  }
}

function fetchThread() {
  if (!state.fetching && state.nextUrl) {
    state.fetching = true;

    return InboxService.getThread(state.nextUrl)
      .then(({ data }) => {
        state.thread = [...state.thread, ...data.results];
        state.nextUrl = data.next;

        window.dispatchEvent(
          new CustomEvent("star-updated", {
            detail: { starred: data.results[0]?.starred },
          })
        );

        if (!state.identityUrl) {
          state.identityUrl = data.results[0].identity;
          nextTick(() => {
            IdentityService.patchIdentityUpdatedAt(identity.value.id);
          });
        }
        nextTick(() => {
          state.fetching = false;
        });
      })
      .catch(() => {
        nextTick(() => {
          state.fetching = false;
          state.error = true;
          toast.error("Error fetching data. Try refreshing the page.");
        });
      });
  }
}

const root = ref(null);

function scrollToBottom() {
  setTimeout(() => {
    const scrollableContent = root.value;
    if (scrollableContent) {
      scrollableContent.scrollTop = scrollableContent.scrollHeight;
      setTimeout(() => {
        state.pageLoaded = true;
      }, 100);
    }
  }, 1000);
}

function openCloak() {
  if (identity.value.protected) {
    return;
  }
  if (
    !store.state.rightPanel.cloak ||
    store.state.rightPanel.cloak.id !== identity.value.id
  ) {
    store.dispatch("openCloakDetails", {
      cloak: identity.value,
    });
  }
}

function sendReply() {
  state.sendingReply = true;

  if (validation.maxPayload(state.files)) {
    return toast.error(
      "Files must be a jpeg, png, pdf and must total less than 3.5 mb"
    );
  }
  // NOTE: thread list is reversed, 0 is the newest activity
  const activity = state.thread[0];
  const detail = activity.message || activity.call;

  const payload = {
    to: activity.inbound
      ? [detail?.sender]
      : detail?.all_recipients
        ? detail?.all_recipients
        : [detail.recipient],
    identity_id: identity.value?.id,
    text: state.reply,
  };

  if (state.files.length > 0) {
    payload.media = state.files;
  }

  InboxService.sendReply(activity.id, payload)
    .then(({ data }) => {
      IdentityService.patchIdentityUpdatedAt(identity.value.id);
      state.reply = "";
      state.sendingReply = false;
      state.thread = [data, ...state.thread];
      state.files.forEach((file) => {
        removeFile(file.key);
      });
      nextTick(() => {
        state.files = [];
      });

      scrollToBottom();
      toast.success("Message sent");
    })
    .catch(() => {
      state.sendingReply = false;
      toast.error("Error sending message");
    });
}

function handleFileChange(files) {
  state.files = files;
}

function removeFile(fileKey) {
  state.filesForRemoval = [...state.filesForRemoval, fileKey];
}

function filesRemoved(fileKeys) {
  state.filesForRemoval = state.filesForRemoval.filter((fileKey) => {
    return !fileKeys.includes(fileKey);
  });
}

function getFilePermissions(file) {
  const ext = (file.name || file.filename)?.split(".").pop().toLowerCase();
  return !constants.FILE_PERMISSIONS.TEXT_ALLOWED.find((type) => type === ext);
}

function getDateTime(activity) {
  const detail = activity?.message || activity?.call;
  return detail?.delivery_datetime;
}

function getCallDisplay(activity) {
  if (activity?.call?.missed) {
    return "Missed call";
  } else if (activity?.inbound) {
    return "Inbound call";
  } else {
    return "Outbound call";
  }
}

function setContactStatus(action) {
  if (!state.loadingStatusChange) {
    state.loadingStatusChange = true;
    InboxService.postContactStatus(senderContact.value?.id, action)
      .then(() => {
        state.thread = state.thread.map((activity) => {
          if (activity?.inbound && activity?.message) {
            return {
              ...activity,
              message: {
                ...activity.message,
                sender_contact: {
                  ...activity.message.sender_contact,
                  status: constants.CONTACT_ACTION_TO_STATUS[action],
                },
              },
            };
          } else if (!activity?.inbound && activity?.message) {
            const recipient_contacts = activity.message.recipient_contacts.map(
              (contact) => {
                if (contact.id === senderContact.value?.id) {
                  return {
                    ...contact,
                    status: constants.CONTACT_ACTION_TO_STATUS[action],
                  };
                }
                return contact;
              }
            );
            return {
              ...activity,
              message: {
                ...activity.message,
                recipient_contacts,
              },
            };
          } else if (activity?.inbound && activity?.call) {
            return {
              ...activity,
              call: {
                ...activity.call,
                sender_contact: {
                  ...activity.call.sender_contact,
                  status: constants.CONTACT_ACTION_TO_STATUS[action],
                },
              },
            };
          } else if (!activity?.inbound && activity?.call) {
            const recipient_contacts = activity.call.recipient_contacts.map(
              (contact) => {
                if (contact.id === senderContact.value?.id) {
                  return {
                    ...contact,
                    status: constants.CONTACT_ACTION_TO_STATUS[action],
                  };
                }
                return contact;
              }
            );
            return {
              ...activity,
              call: {
                ...activity.call,
                recipient_contacts,
              },
            };
          }
          return activity;
        });
        state.loadingStatusChange = false;
        toast.success(
          action === constants.CONTACT_ACTION.APPROVE
            ? "Request approved"
            : "Request blocked"
        );
      })
      .catch(() => {
        state.loadingStatusChange = false;
        toast.error("Could not save contact setting, please try again");
      });
  }
}

async function fetchInitialData() {
  let nextUrl = `/api/v2/cloaked/activity/thread/${state.threadId}/?ordering=created_at&page_size=10`;
  try {
    const { value } = await fetchFeatureFlag("dashboard-activity-2-5");
    activity25Flag.value = value;
    if (value) {
      nextUrl = `/api/v2_5/cloaked/activity/?thread_id=${state.threadId}&ordering=created_at&page_size=10`;
    }
  } catch {
    activity25Flag.value = false;
  }

  state.nextUrl = nextUrl;

  const promises = [
    fetchThread(state.threadId),
    PersonalInfoServices.getPersonalPhones(),
    InboxService.markThreadsAsRead([state.threadId]),
  ];
  store.dispatch("updateActivityCachedData", {
    threadId: state.threadId,
    key: "read",
    value: true,
  });
  nextTick(() => {
    Promise.all(promises).finally(() => {
      nextTick(() => {
        state.initDataFetched = true;
      });
    });
  });
}

function showBlockConfirmation() {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(BlockContactsConfirmation),
      props: {
        contact: senderContact.value,
        identityId: identity?.value?.id,
      },
      events: {
        blockContact: () => setContactStatus(constants.CONTACT_ACTION.BLOCK),
      },
    },
  });
}

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
</script>

<template>
  <div
    :key="route?.params?.id"
    ref="root"
  >
    <div
      v-if="!state.pageLoaded"
      class="loading-skeleton"
    >
      <InlineSvg name="loading-small" />
    </div>
    <div
      class="message-page"
      :class="{ active: state.pageLoaded }"
    >
      <section class="message-header">
        <div class="message-sender">
          <BaseText
            v-if="true"
            variant="headline-4-bold"
            class="name"
          >
            {{ headerNameDisplay }}
          </BaseText>
          <BaseText
            v-if="headerNameDisplay !== senderCloakedPhone"
            variant="body-2-semibold"
            class="phone"
          >
            {{ senderCloakedPhone }}
          </BaseText>
        </div>
        <div
          class="message-identity"
          @click="openCloak"
        >
          <IdentityIcon
            :identity="identity"
            :override="{ height: '16px', width: '16px' }"
          />
          <BaseText variant="body-3-semibold">
            {{ formattedText.getFormattedNickname(identity) }}
          </BaseText>
        </div>
      </section>
      <section class="message-thread-wrapper">
        <div class="message-thread-flex-wrapper">
          <div
            v-for="(activity, index) in state.thread"
            :id="`message-${index}`"
            :key="`message-${activity.id}`"
            class="message-body-wrapper"
            :class="{ inbound: activity?.inbound }"
          >
            <InfiniteLoader
              v-if="
                state.pageLoaded &&
                state.thread.length - 1 === index &&
                !state.error
              "
              key="inbox-messages"
              :loading="state.fetching"
              :all-data-fetched="!state.nextUrl"
              @load-more="fetchThread"
            />
            <div
              v-if="
                state.thread.length - 1 === index ||
                !inboxScripts.isSameDay(
                  getDateTime(activity),
                  getDateTime(state.thread[index + 1])
                )
              "
              class="day-wrapper"
            >
              <BaseText
                variant="caption-semibold"
                as="div"
                class="day-wrapper-bubble"
              >
                {{ inboxScripts.getDateDisplay(getDateTime(activity)) }}
              </BaseText>
            </div>
            <div
              v-if="
                activity.inbound &&
                (state.thread.length - 1 === index ||
                  state.thread[index + 1].inbound !== activity?.inbound ||
                  !inboxScripts.isSameDay(
                    getDateTime(activity),
                    getDateTime(state.thread[index + 1])
                  ))
              "
              class="sender-display-wrapper"
              :class="{
                inbound: activity?.inbound,
                'first-message-of-day': !inboxScripts.isSameDay(
                  getDateTime(activity),
                  getDateTime(state.thread[index - 1])
                ),
              }"
            >
              <InlineSvg
                name="activity-profile"
                class="profile-icon clickable"
                :class="{ inbound: activity?.inbound }"
                @click="openCloak"
              />
              <BaseText variant="body-3-semibold">
                {{ headerNameDisplay }}
              </BaseText>
            </div>
            <div v-if="!!activity?.call && activity?.call?.recordings">
              <InboxVoicemailPlayer
                v-for="(recording, idx) in activity?.call?.recordings"
                :key="`voicemail-${idx}`"
                class="voice-message"
                :class="{ inbound: activity.inbound }"
                :recording="recording"
                :idx="idx"
                :inbound="activity.inbound"
              />
            </div>
            <div
              v-if="!!activity?.message"
              class="text-and-media-wrapper"
              :class="{ inbound: activity?.inbound }"
            >
              <div
                class="message-body"
                :class="{ inbound: activity?.inbound }"
              >
                <InboxSafeUGC
                  content-type="text_message"
                  :content="activity?.message?.body"
                  :inbound="activity?.inbound"
                  :message="true"
                  :override-body-style="{
                    'word-wrap': 'normal',
                    'white-space': 'wrap',
                    display: 'flex',
                    'flex-direction': 'column',
                    'align-items': activity?.inbound
                      ? 'flex-start'
                      : 'flex-end',
                    'justify-content': 'center',
                    'max-width': '475px',
                  }"
                />
                <BaseText
                  variant="caption-semibold"
                  as="div"
                  class="message-time"
                  :class="{ inbound: activity?.inbound }"
                >
                  {{
                    inboxScripts.getHourMinDisplay(
                      activity?.message?.delivery_datetime
                    )
                  }}
                </BaseText>
              </div>
              <div
                v-for="(file, i) in activity?.message?.media"
                :key="`attachment-${i}`"
                class="message-media-wrapper"
              >
                <a
                  v-if="inboxScripts.isImage(file)"
                  :href="file"
                  target="_blank"
                  download
                  class="media-link"
                >
                  <img
                    class="activity-message-media"
                    :class="{ inbound: activity?.inbound }"
                    :src="file"
                  />
                </a>
                <a
                  v-else
                  :href="file"
                  class="media-type-display"
                  target="_blank"
                  download
                >
                  <div class="media-type-name">
                    <Download />
                  </div>
                  <FileFull />
                </a>
                <BaseText
                  variant="caption-semibold"
                  as="div"
                  class="message-time"
                  :class="{ inbound: activity?.inbound }"
                >
                  {{
                    inboxScripts.getHourMinDisplay(
                      activity?.message?.delivery_datetime
                    )
                  }}
                </BaseText>
              </div>
            </div>
            <div
              v-else-if="activity?.call"
              class="call-wrapper"
              :class="{ inbound: activity.inbound }"
            >
              <InlineSvg
                name="activity-phone"
                :class="activity.inbound ? 'light-icon' : 'dark-icon'"
              />
              <BaseText variant="body-small-medium">
                {{ getCallDisplay(activity) }}
              </BaseText>
              <BaseText
                variant="body-small-medium"
                class="call-time"
              >
                {{
                  inboxScripts.getHourMinDisplay(
                    activity?.call?.delivery_datetime
                  )
                }}
              </BaseText>
            </div>
          </div>
          <InboxRequestHeader
            v-if="!contactApproved"
            :identity="identity"
            :contact="senderContact"
          />
        </div>
      </section>
      <section
        v-if="contactApproved"
        class="message-reply-bar"
      >
        <textarea
          type="text"
          placeholder="Type a message"
          :value="state.reply"
          @input="(event) => (state.reply = event.target.value)"
          @keydown.enter.exact="sendReply"
          @keydown.shift.enter.exact="state.reply += '\n'"
        />
        <div class="attachments">
          <InboxFileAttachments
            ref="fileAttachments"
            endpoint="/api/v1/cloaked/activity/upload_media_urls/"
            :filter="getFilePermissions"
            :disabled="state.files.length > 4"
            :error="validation.maxPayload(state.files)"
            :files-for-removal="state.filesForRemoval"
            :is-text-message="true"
            @change="handleFileChange"
            @files-removed="filesRemoved"
          >
            <template #icon>
              <AttachmentsIcon />
            </template>
          </InboxFileAttachments>
          <InboxMessageFileList
            class="attachments-list"
            :files="state.files"
            errors="Files must be a jpeg, png, pdf and must total less than 3.5 mb"
            @remove="removeFile"
          />
        </div>
        <Button
          :disabled="!state.reply.length || state.sendingReply"
          :loading="state.sendingReply"
          class="send-button"
          @click="sendReply"
        >
          <SendArrow />
          Send
        </Button>
      </section>

      <section
        v-else
        class="request-contact-wrapper"
      >
        <div
          v-if="contactUnknown"
          class="request-contact-inner"
        >
          <div>
            <BaseText
              variant="body-2-semibold"
              as="h1"
            >
              {{ contactNonCloakedPhone }} is trying to contact you
            </BaseText>
            <BaseText
              variant="body-small-medium"
              as="p"
            >
              Approve this contact if you want to reply to this message and
              <br />
              allow {{ contactNonCloakedPhone }} to be able to message you from
              now on.
            </BaseText>
          </div>
          <div>
            <Button
              :class="{ disabled: state.loadingStatusChange }"
              @click="showBlockConfirmation"
            >
              Block
              <Block />
            </Button>
            <Button
              :class="{ disabled: state.loadingStatusChange }"
              @click="setContactStatus(constants.CONTACT_ACTION.APPROVE)"
            >
              Approve
              <Approve />
            </Button>
          </div>
        </div>
        <div
          v-else-if="contactBlocked"
          class="request-contact-inner"
        >
          <div>
            <BaseText
              variant="body-2-semibold"
              as="h1"
            >
              {{ contactNonCloakedPhone }} is blocked
            </BaseText>
            <BaseText
              variant="body-small-medium"
              as="p"
            >
              Approve {{ contactNonCloakedPhone }} in order to reply
            </BaseText>
          </div>
          <div>
            <Button
              :class="{ disabled: state.loadingStatusChange }"
              @click="setContactStatus(constants.CONTACT_ACTION.APPROVE)"
            >
              Approve
              <Approve />
            </Button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.loading-skeleton {
  background-color: $color-base-white-100;
  color: $color-primary-50;
  padding-top: 40px;

  svg {
    width: 40px;
    height: 40px;
  }
}

.message-page {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out;

  &.active {
    opacity: 1;
    visibility: visible;
  }

  .message-header {
    padding: 24px 32px 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 4px;

    .message-sender {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      justify-content: flex-start;
      gap: 8px;

      .name {
        color: $color-primary-100;
      }

      .phone {
        color: $color-primary-50;
        margin-bottom: 2px;
      }
    }

    .message-identity {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 6px;
      color: $color-primary-100;
      cursor: pointer;
    }
  }

  .message-body-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    padding-top: 8px;

    .voice-message {
      background-color: $color-primary-90;
      border-radius: 16px 2px 16px 16px;
      max-width: 507px;
      margin-top: 8px;
      padding: 16px;

      &.inbound {
        border-radius: 2px 16px 16px;
        background-color: $color-primary-10;
      }
    }

    .message-media-wrapper {
      margin-top: 8px;

      .message-time {
        color: $color-primary-30;
        margin-top: 2px;
        display: flex;
        justify-content: flex-end;
        margin-right: 16px;
        margin-left: 0;

        &.inbound {
          margin-right: 0;
          margin-left: 64px;
          color: $color-primary-70;
          justify-content: flex-start;
        }
      }

      .activity-message-media {
        max-width: 507px;
        height: auto;
        border-radius: 16px;
        background-color: transparent;
      }

      .media-link {
        cursor: pointer;
        display: block;
      }
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
      }
    }

    .day-wrapper {
      margin-top: 42.5px;
      margin-bottom: 5.5px;
      border-top: 1px solid $color-primary-10;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;

      .day-wrapper-bubble {
        color: $color-primary-70;
        display: flex;
        padding: 10px 12px;
        justify-content: center;
        align-items: center;
        border-radius: 99px;
        border: 1px solid $color-primary-10;
        background: $color-base-white-100;
        transform: translateY(-50%);
      }
    }

    &.inbound {
      align-items: flex-start;
    }

    .text-and-media-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: flex-start;

      &.inbound {
        align-items: flex-start;
      }

      .message-body {
        background-color: $color-primary-90;
        color: $color-primary-1;
        border-radius: 16px 2px 16px 16px;
        line-height: 21px;
        padding: 10px 16px 5px;
        display: inline-flex;
        margin-top: 8px;
        margin-left: 32px;
        max-width: 507px;
        width: fit-content;
        flex-direction: column;
        margin: 0 24px;
        align-items: flex-end;
        align-self: flex-end;

        &.inbound {
          align-items: flex-start;
          align-self: flex-start;
        }

        .message-time {
          color: $color-primary-30;
          margin-top: 2px;
          display: flex;
          justify-content: flex-end;

          &.inbound {
            color: $color-primary-70;
            justify-content: flex-start;
          }
        }

        p {
          line-height: 21px;
        }

        &.inbound {
          margin-right: 0;
          background-color: $color-primary-10;
          color: $color-primary-100;
          border-radius: 2px 16px 16px;

          a {
            color: $color-primary-1 !important;
          }
        }
      }
    }
  }

  .message-thread-wrapper {
    gap: 8px;
    padding: 24px;
    margin-bottom: 120px;
    overflow: auto;

    @include custom-scroll-bar-inbox;

    &::-webkit-scrollbar {
      height: 0;
      width: 0;
    }

    // navheader + page header + padding
    bottom: 114px;

    // height - replybar - navheader - page header - padding

    .message-thread-flex-wrapper {
      display: flex;
      flex-direction: column-reverse;
      align-items: flex-start;
      justify-content: flex-start;
      overflow: scroll;
      width: 100%;
      height: 100%;

      > div {
        width: 100%;
      }

      .call-wrapper {
        margin: 0 26px;
        display: inline-flex;
        padding: 12px 16px 12px 12px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        border-radius: 99px;
        border: 1px solid $color-primary-10;
        margin-top: 10px;
        background-color: $color-primary-90;
        color: $color-primary-1;

        &.inbound {
          background-color: transparent;
          color: $color-primary-100;
        }

        .light-icon {
          color: $color-primary-10;

          > path {
            fill: $color-primary-100;
            color: $color-primary-100;
          }
        }

        .dark-icon {
          color: $color-primary-100;

          > path {
            color: $color-primary-10;
          }
        }
      }
    }
  }

  .message-reply-bar {
    position: fixed;
    bottom: 0;
    width: calc(100% - 240px);
    color: $color-primary-100;
    padding: 24px 24px 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    > textarea {
      border: 1.5px solid $color-primary-10;
      background-color: $color-primary-1;
      height: 114px;
      width: 100%;
      padding: 8px 16px 12px;
      border-radius: 16px;
      color: $color-primary-100;
      resize: none;
      outline: none;
    }

    .send-button {
      position: absolute;
      bottom: 28px;
      right: 48px;
    }

    .attachments {
      position: absolute;
      bottom: 28px;
      left: 48px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
    }
  }

  .sender-display-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    color: $color-primary-100;
    margin-top: 24px;
    margin-right: 32px;
    margin-left: 0;

    .profile-icon {
      height: 24px;
      width: auto;
      margin-right: 10px;
      color: $color-primary-100;

      &.inbound {
        color: $color-primary-100;
      }
    }

    &.inbound {
      margin-right: 0;
      justify-content: flex-start;
    }

    &.first-message-of-day {
      margin-top: 0;
    }
  }
}

.clickable {
  cursor: pointer;
}

.request-contact-wrapper {
  background-color: $color-base-white-100;
  width: calc(100% - 240px);
  height: 190px;
  position: fixed;
  bottom: 0;
  left: 240px;
  padding: 24px 32px 16px;

  .request-contact-inner {
    height: 150px;
    width: 100%;
    margin-bottom: 16px;
    border-radius: 16px;
    border: 1.5px solid $color-primary-10;
    background-color: $color-primary-1;
    text-align: center;
    color: $color-primary-50;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    h1 {
      align-self: center;
      align-items: center;
      color: $color-primary-100;
    }

    p {
      margin: 10px 0;
    }

    div {
      &:last-child {
        gap: 10px;
        display: flex;
        justify-content: center;

        button {
          &.disabled {
            opacity: 0.3 !important;
          }

          color: $color-primary-100;
          gap: 10px;
          height: 38px;
          width: 120px;
          flex-direction: row;
          align-items: center;
          display: inline-flex;
          cursor: pointer;
          border-radius: 999px;
          justify-content: center;
          border: 1px solid $color-primary-100;
          background-color: transparent;

          &:last-child {
            color: $color-primary-1;
            background-color: $color-primary-100;

            svg {
              color: $color-primary-1;
            }
          }
        }
      }
    }
  }
}
</style>
