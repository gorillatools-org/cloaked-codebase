<script setup>
import PillInput from "@/features/ui/input/pill-input";
import RemoveIcon from "@/assets/icons/remove.svg";
import CloseIcon from "@/assets/icons/close-x-borderless.svg";
import SendIcon from "@/assets/icons/compose-send.svg";
import { searchLocalCloaksGrouped } from "@/scripts/search";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import InfiniteLoader from "@/features/global/InfiniteLoader.vue";

import InboxFileAttachments from "@/features/inbox/InboxFileAttachments";
import InboxEmailFileList from "@/features/inbox/InboxEmailFileList";
import { FILE_PERMISSIONS } from "@/scripts/constants";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import { useRoute } from "vue-router";
import InboxService from "@/api/actions/inbox-service.js";
import IdentityService from "@/api/actions/identity-service";

import { reactive, onBeforeUnmount, watch, computed, ref, nextTick } from "vue";
import router from "@/routes/router";
import { sanitize } from "@/scripts/sanitize";
import { validation } from "@/scripts/validation";
import { format } from "@/scripts/format";
import BaseText from "@/library/BaseText.vue";

const route = useRoute();

let searchTimeout;

const toast = useToast();

const subjectInput = ref(null);
const fromInput = ref(null);
const toInput = ref(null);
const ccInput = ref(null);
const scrollResultsRef = ref(null);
const bodyInput = ref(null);
const fileAttachment = ref(null);

const defaultTo = computed(() => {
  if (store.state.compose_message && store.state.compose_message.payload) {
    if (store.state.compose_message.payload.inbound) {
      return [store.state.compose_message.payload.sender_email];
    } else {
      return store.state.compose_message.payload.to_recipients.map(
        (contact) => contact.email
      );
    }
  }
  return null;
});

const defaultSubject = computed(() => {
  if (store.state.compose_message && store.state.compose_message.payload) {
    return store.state.compose_message.payload.subject;
  }
  return null;
});

const defaultState = computed(() => {
  return {
    toField: [],
    ccEnabled: false,
    ccField: [],
    from: null,
    subject: "",
    bodyText: "",
    files: [],
    sending: false,
    sent: false,
    current: 0,
    limit: 20,
    errors: [],
    dirty: false,
    search: "",
    searchText: "",
    filesForRemoval: [],
  };
});

const state = reactive({ ...defaultState.value });

onBeforeUnmount(() => {
  store.commit("compose", null);
});

const toFieldPills = computed(() => {
  if (state.toField.length) {
    return pillData(state.toField);
  }
  return [];
});

const ccFieldPills = computed(() => {
  if (state.ccField.length) {
    return pillData(state.ccField);
  }
  return [];
});
const isVisible = computed(() => {
  return !!store.state.compose_message.identity;
});

const canAttach = computed(() => {
  return (
    (firstItemIsEmail.value && canEmail.value) ||
    (firstItemIsPhone.value && canSms.value)
  );
});

const maxPayload = computed(() => {
  return validation.maxPayload(state.files);
});

const emailId = computed(() => {
  if (store.state.compose_message && store.state.compose_message.payload) {
    return [store.state.compose_message.payload.id];
  }
  return null;
});

const errorMessage = computed(() => {
  if (state.from || fromEmail.value) {
    if (firstItemIsPhone.value && !canSms.value) {
      return {
        type: "button",
        text: "a phone number",
      };
    }
    if (firstItemIsEmail.value && !canEmail.value) {
      return {
        type: "button",
        text: "an email address",
      };
    }
    if (hasEmail.value && hasPhone.value) {
      return {
        type: "text",
        text: "Cloaked can't send a message to an email and a phone number at the same time, please remove one (or more) conflicting contacts.",
      };
    }
  }
  return null;
});

const cloaks = computed(() => {
  return store.state.localdb.db_cloaks.filter((c) => !c.protected);
});

const groups = computed(() => {
  let results = [];
  if (state.searchText) {
    const data = searchLocalCloaksGrouped(cloaks.value, state.searchText);
    Object.keys(data).map((k) => {
      if (data[k].length > 0) {
        results.push({ type: "group", name: k });
        const items = data[k].map((i) => {
          i.type = "item";
          return i;
        });
        results = [...results, ...items];
      }
    });
  }
  results = results.filter((r) => {
    if (isLockedtoItem.value && firstItemIsPhone.value) {
      return r.is_cloaked_phone;
    }
    if (isLockedtoItem.value && firstItemIsPhone.value) {
      return r.is_cloaked_email;
    }
    return r.is_cloaked_email || r.is_cloaked_phone;
  });
  return results.slice(0, state.limit);
});

const identity = computed(() => {
  return state.from || store.state.compose_message.identity;
});

const identityId = computed(() => {
  return identity.value?.id;
});

const fromIdentity = computed(() => {
  if (state.from === null) {
    return store.state.compose_message.identity;
  }
  return state.from;
});

const fromEmail = computed(() => {
  const identity = fromIdentity.value;
  if (identity && identity.id) {
    return identity.nickname || "(Unnamed)";
  }
  return null;
});

const canSms = computed(() => {
  return !!identity.value?.cloaked_phone || !!identity.value?.phone;
});

const canEmail = computed(() => {
  return !!identity.value?.cloaked_email || !!identity.value?.email;
});

const firstItemIsEmail = computed(() => {
  return state.toField.length > 0 && validation.email(state.toField[0]);
});

const firstItemIsPhone = computed(() => {
  return state.toField.length > 0 && validation.phone(state.toField[0]);
});

const hasEmail = computed(() => {
  return state.toField.findIndex((f) => validation.email(f)) !== -1;
});

const hasPhone = computed(() => {
  return state.toField.findIndex((f) => validation.phone(f)) !== -1;
});

const isLockedtoItem = computed(() => {
  return firstItemIsEmail.value || firstItemIsPhone.value;
});

const ready = computed(() => {
  return state.toField.filter((a) => check(a)).length > 0;
});

const canSend = computed(() => {
  const fileHold = state.files.filter((f) => {
    return f.uploading || f.error;
  });
  if (fileHold.length === 0) {
    if (state.errors.length === 0 && !errorMessage.value) {
      if (firstItemIsEmail.value && canEmail.value) {
        return ready.value && state.subject && state.bodyText;
      }
      if (firstItemIsPhone.value && canSms.value) {
        return ready.value && state.bodyText;
      }
    }
  }
  return false;
});

const fullyLoaded = computed(() => {
  return state.limit > groups.value.length;
});

watch(
  () => state.search,
  (value) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
      state.searchText = value;
    }, 150);
  },
  { deep: true }
);
watch(
  () => state.searchText,
  () => {
    state.current = 0;
    state.limit = 20;
    nextTick(() => {
      if (scrollResultsRef?.value) {
        scrollResultsRef?.value?.scrollTo(0, 0);
      }
    });
  },
  { deep: true }
);
watch(
  () => state.subject,
  () => {
    state.dirty = true;
  },
  { deep: true }
);

watch(
  () => state.toField,
  () => {
    if (state.toField.length) {
      state.dirty = true;
    }
  },
  { deep: true }
);

watch(
  () => state.toField,
  () => {
    nextTick(() => {
      if (toInput.value && firstItemIsEmail.value) {
        subjectInput?.value?.focus();
      }
      if (toInput.value && firstItemIsPhone.value) {
        bodyInput?.value?.focus();
      }
    });
  },
  { deep: true }
);
watch(
  () => fromEmail.value,
  () => {
    nextTick(() => {
      if (toInput.value) {
        toInput.value.recalculate();
      }
      if (ccInput.value) {
        ccInput.value.recalculate();
      }
    });
  },
  { deep: true }
);
watch(
  () => state.from,
  (value) => {
    state.dirty = true;
    if (!value) {
      nextTick(() => {
        fromInput?.value?.focus();
      });
    }
    if (value && firstItemIsPhone.value) {
      checkForExistingConvo();
    }
  },
  { deep: true }
);
watch(
  () => state.bodyText,
  () => {
    state.dirty = true;
  },
  { deep: true }
);

watch(
  () => ready.value,
  (value) => {
    if (value) {
      if (firstItemIsEmail.value && !state.subject.length) {
        return nextTick(() => subjectInput?.value?.focus());
      }
      nextTick(() => {
        bodyInput?.value?.focus();
        state.dirty = true;
      });
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => firstItemIsPhone.value,
  (isPhone) => {
    if (isPhone && state.from) {
      checkForExistingConvo();
    }
  }
);

watch(
  () => isVisible.value,
  (newVal, oldVal) => {
    // NOTE: this is essentially onMounted + onBeforeUnmount
    const isOpening = !oldVal && newVal;
    const isClosing = oldVal && !newVal;

    if (isOpening) {
      resetState();
      nextTick(initNewCompose);
    }

    if (isClosing) {
      resetState();
    }
  }
);

function resetState() {
  Object.assign(state, { ...defaultState.value });
  toInput?.value?.setValue([]);
  ccInput?.value?.setValue([]);
}

function initNewCompose() {
  if (defaultTo.value) {
    state.toField = defaultTo.value;
    toInput?.value.setValue(pillData(defaultTo.value));
  }

  if (defaultSubject.value) {
    state.subject = "Re: " + defaultSubject.value;
  }

  nextTick(() => {
    if (fromIdentity.value && Object.keys(fromIdentity.value).length) {
      return toInput?.value?.selectInput();
    }
    return fromInput?.value?.focus();
  });
}

function checkForExistingConvo() {
  const phoneStripped = format.formatPhoneStringBasic(state.toField[0]);
  InboxService.checkIfThreadExists({
    number: phoneStripped,
    identity_id: identityId?.value,
  }).then((response) => {
    if (response.data.thread_id) {
      if (
        !(
          route.name.toLowerCase() === "text" &&
          route.params.id === response.data.thread_id
        )
      ) {
        router.push({
          name: "Text",
          params: { id: response.data.thread_id },
        });
      }

      store.commit("compose", null);
      store.dispatch("openModal", {
        header: "Redirecting to existing thread",
        subheader: `You already have an existing conversation with ${format.formatPhone(
          phoneStripped
        )}. You'll be automatically redirected in a few seconds`,
        button: {
          text: "Got it",
          onClick: () => store.dispatch("closeModal"),
        },
        showCancel: false,
      });
      setTimeout(() => {
        store.dispatch("closeModal");
      }, 3000);
    }
  });
}

function attachFilter(file) {
  if (firstItemIsPhone.value) {
    const ext = (file.name || file.filename)?.split(".").pop().toLowerCase();
    return !FILE_PERMISSIONS.TEXT_ALLOWED.find((type) => type === ext);
  }
  return true;
}
function removeFile(fileKey) {
  state.filesForRemoval = [...state.filesForRemoval, fileKey];
}

function filesRemoved(fileKeys) {
  state.filesForRemoval = state.filesForRemoval.filter((fileKey) => {
    return !fileKeys.includes(fileKey);
  });
}
function handleFileChange(files) {
  state.files = files;
}
function addEnter(e) {
  if (e.key === "Enter") {
    const position = e.target.selectionEnd;
    state.bodyText =
      e.target.value.substring(0, position) +
      "\n" +
      e.target.value.substring(position);
    const extra = 1;
    nextTick(() => {
      bodyInput.value.selectionEnd = position + extra;
      bodyInput.value.selectionStart = position + extra;
      e.target.selectionEnd = position + extra;
      e.target.selectionStart = position + extra;
    });
  }
}
function openDetails() {
  store.dispatch("fetchPopulatedData", identity.value).then((data) => {
    store.commit("compose", null);
    store.dispatch("openCloakDetails", { cloak: data });
  });
}
function pillData(data) {
  return data.map((d) => ({
    display: d,
    value: d,
  }));
}
function loadMore() {
  state.limit = state.limit + 20;
}
function handleEnter() {
  const item = groups.value[state.current];
  if (item && item.type === "item") {
    setFrom(item);
  }
  state.search = "";
}
function clickSearchItem(item) {
  setFrom(item);
  state.search = "";
}
function getNextItem(index, direction) {
  const item = groups.value[index];
  if (item) {
    if (item.type === "item") {
      return index;
    }
    return getNextItem(index + direction, direction);
  }
  return index;
}
function nav(direction, event) {
  event.preventDefault();
  let next = state.current + direction;
  next = getNextItem(next, direction);
  if (next < 0) {
    next = getNextItem(groups.value.length - 1, -1);
  }
  if (next >= groups.value.length) {
    next = getNextItem(0, 1);
  }
  state.current = next;
  document
    .getElementById(`item-${next}`)
    .scrollIntoView({ behavior: "smooth", block: "center" });
}

function setFrom(cloak) {
  state.search = "";
  const payload = {
    id: cloak.id,
    nickname: cloak.nickname,
  };
  if (cloak.phone && cloak.is_cloaked_phone) {
    payload.cloaked_phone = {
      phone_number: cloak.phone,
    };
  }
  if (cloak.email && cloak.is_cloaked_email) {
    payload.cloaked_email = {
      email: cloak.email,
    };
  }
  state.from = payload;
  nextTick(() => {
    toInput?.value?.selectInput();
  });
}
function clearFrom() {
  state.from = false;
}
function enableCC() {
  state.ccEnabled = true;
  nextTick(() => {
    ccInput?.value?.selectInput();
  });
}
function check(value) {
  if (isLockedtoItem.value && firstItemIsEmail.value) {
    return validation.email(value) && canEmail.value;
  }
  if (isLockedtoItem.value && firstItemIsPhone.value) {
    return validation.phone(value) && canSms.value;
  }
  return (
    (validation.email(value) && canEmail.value) ||
    (validation.phone(value) && canSms.value)
  );
}
function setPills(value) {
  /* if incoming emails or phone numbers are copy/pasted without commas or spaces */
  const incoming = value.map((v) =>
    validation.formatMultiplePillEntries(v.value)
  );
  const updatedValues = incoming.flat();
  state.toField = updatedValues;

  nextTick(() => {
    toInput?.value?.recalculate();
  });
}
function setCC(value) {
  state.ccField = value.map((v) => v.value);
  nextTick(() => {
    ccInput?.value?.recalculate();
  });
}
function hasErrors(type) {
  return state.errors.includes(type);
}

function cancel() {
  if (state.dirty) {
    store.dispatch("openModal", {
      header: `Discard draft?`,
      subheader: `This message will be permanently deleted.`,
      button: {
        text: "Yes, delete",
        danger: true,
        onClick: () => {
          store.commit("compose", null);
          toast.success("Message deleted");
        },
      },
    });
  } else {
    store.commit("compose", null);
  }
}
function send() {
  if (!state.sending) {
    const errors = [];
    const isEmail = firstItemIsEmail.value;
    state.toField.map((em) => {
      if (!check(em)) {
        errors.push("to");
      }
    });
    if (maxPayload.value) {
      errors.push("files");
    }
    if (!state.subject && isEmail) {
      errors.push("subject");
    }
    if (state.ccField.length > 0 && isEmail) {
      state.ccField.map((em) => {
        if (!validation.email(em)) {
          errors.push("cc");
        }
      });
    }
    if (!state.bodyText) {
      errors.push("body");
    }

    if (errors.length === 0) {
      const data = {
        to: state.toField,
        identity_id: fromIdentity.value.id,
        isEmail: !!firstItemIsEmail.value,
        isSms: !!firstItemIsPhone.value,
        emailId: emailId.value,
        text: state.bodyText,
        subject: state.subject,
        activityId: store.state.compose_message.activity_id,
        originalHTMLContent:
          store.state.compose_message?.payload?.html?.trim() ||
          store.state.compose_message?.payload?.text?.trim(),
        originalTextContent:
          store.state.compose_message?.payload?.text?.trim() || "",
      };
      if (state.ccField.length > 0) {
        data.cc = state.ccField;
      }
      if (state.files.length > 0) {
        if (firstItemIsPhone.value) {
          data.media = state.files;
        } else {
          data.attachments = state.files;
        }
      }

      toast.success("Sending message...");

      onSend(data)
        .then((resp) => {
          if (resp.status === 200) {
            if (store.state.compose_message?.payload?.onSend) {
              store.state.compose_message?.payload?.onSend(resp);
            }
            state.sent = true;
            toast.success("Message sent");
            nextTick(() => {
              store.commit("compose", null);
            });
          } else {
            throw "error";
          }
        })
        .catch((err) => {
          state.sending = false;
          if (err?.response?.data?.code === "missing_verified_phone") {
            return toast.error(
              "Please verify your phone number to send a message."
            );
          }
          if (err?.response?.data?.code === "payment_required") {
            return store.dispatch("openModal", {
              header: "Upgrade your account to send messages",
              subheader:
                "To compose a new message, please upgrade your subscription.",
              button: {
                text: "Upgrade now",
                onClick: () => {
                  store.commit("compose", null);
                  store.dispatch("subscription/openSubscriptionModal");
                },
              },
            });
          }
          toast.error("Failed to send message");
        });
    } else {
      state.errors = errors;
      setTimeout(() => {
        state.errors = [];
      }, 2500);
    }
  }
}

function onSend(data) {
  IdentityService.patchIdentityUpdatedAt(data.identity_id);
  if (data.isSms) {
    const payload = {
      text: data.text,
      to: data.to,
      identity_id: data.identity_id,
    };
    if (data.media) {
      payload.media = data.media;
    }
    return InboxService.sendComposeMessage(payload);
  }
  const payload = {};
  if (data.cc) {
    payload.cc = data.cc;
  }
  if (data.attachments) {
    payload.attachments = data.attachments;
  }
  if (data.emailId) {
    payload.to = data.to;
    payload.subject = data.subject;
    payload.original_html = data.originalHTMLContent;
    payload.html = sanitize.safe_html(data.text).trim();

    if (data.originalTextContent) {
      payload.original_text = data.originalTextContent;
      payload.text = data.text;
    }
    return InboxService.sendReply(data.activityId, payload);
  }
  payload.text = data.text || "";
  payload.html = sanitize.safe_html(data.text).trim() || "";
  payload.to = data.to;
  payload.subject = data.subject;
  payload.identity_id = data.identity_id;
  return InboxService.sendComposeEmail(payload);
}

function handleSearch(e) {
  state.search = e.target.value;
}
</script>

<template>
  <div
    v-show="isVisible"
    class="new-message-container"
  >
    <div
      class="new-message"
      @click="($event) => $event.stopPropagation()"
    >
      <div class="full-height recipients">
        <div class="flex-row flex-between header-line">
          <BaseText
            v-if="!isLockedtoItem"
            variant="body-2-semibold"
            as="h1"
          >
            New message
          </BaseText>
          <BaseText
            v-else-if="firstItemIsEmail"
            variant="body-2-semibold"
            as="h1"
          >
            New email
          </BaseText>
          <BaseText
            v-else-if="firstItemIsPhone"
            variant="body-2-semibold"
            as="h1"
          >
            New text message
          </BaseText>
          <button @click="cancel">
            <CloseIcon />
          </button>
        </div>
        <BaseText
          v-if="errorMessage && errorMessage.type === 'button'"
          as="h3"
          variant="body-2-semibold"
          class="error_message"
        >
          Please create {{ errorMessage.text }} for this identity before sending
          a message by
          <button @click="openDetails">clicking here</button>
        </BaseText>
        <BaseText
          v-if="errorMessage && errorMessage.type === 'text'"
          as="h3"
          variant="body-2-semibold"
          class="error_message"
        >
          {{ errorMessage.text }}
        </BaseText>
        <div class="flex-row flex-gap border-bottom">
          <BaseText
            variant="body-small-medium"
            as="label"
          >
            From:
          </BaseText>
          <div
            v-if="fromEmail"
            class="from-email"
          >
            <BaseText
              as="div"
              variant="body-small-medium"
            >
              {{ fromEmail }}
              <button @click="clearFrom">
                <RemoveIcon />
              </button>
            </BaseText>
          </div>
          <input
            v-else
            ref="fromInput"
            aria-id="ComposeSelectIdentity"
            maxlength="50"
            autocomplete="off"
            data-lpignore="true"
            data-form-type="other"
            type="text"
            autofocus
            class="add-from"
            placeholder="Enter any Cloaked identity, phone number, or email"
            :value="state.search"
            @input="handleSearch"
            @keyup.enter="handleEnter"
            @keyup.up="(event) => nav(-1, event)"
            @keyup.down="(event) => nav(1, event)"
          />
        </div>
        <div
          v-if="state.search !== null && state.search.length && groups.length"
          class="search-results"
        >
          <div
            ref="scrollResultsRef"
            class="results"
          >
            <div class="search-items">
              <div
                v-for="(item, index) in groups"
                :key="index"
              >
                <BaseText
                  v-if="item.type === 'group'"
                  variant="body-small-medium"
                  class="group-title"
                >
                  {{ item.name }}
                </BaseText>
                <div
                  v-else
                  class="group_item"
                  @mousemove="state.current = index"
                  @click="clickSearchItem(item)"
                >
                  <div
                    :id="`item-${index}`"
                    class="search-item"
                    :class="{ active: state.current === index }"
                  >
                    <IdentityIcon :identity="item" />
                    <div class="item-pill">
                      <div>
                        <BaseText
                          variant="body-2-semibold"
                          as="h1"
                        >
                          {{ item.n ? item.n : item.nickname }}
                        </BaseText>
                        <BaseText
                          v-if="item.email"
                          variant="caption-semibold"
                          as="h3"
                        >
                          {{ item.email }}
                        </BaseText>
                        <BaseText
                          v-if="item.phone"
                          variant="caption-semibold"
                          as="h3"
                        >
                          {{ format.formatPhone(item.phone) }}
                        </BaseText>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <InfiniteLoader
                v-if="!fullyLoaded"
                key="inbox-compose"
                :all-data-fetched="fullyLoaded"
                @load-more="loadMore"
              />
            </div>
          </div>
        </div>
        <div class="full-height recipients">
          <div class="flex-row flex-gap border-bottom">
            <BaseText
              variant="body-small-medium"
              as="label"
            >
              To:
            </BaseText>
            <div
              class="to-row"
              :class="{ error_m: hasErrors('to') }"
              aria-id="ComposeToField"
            >
              <PillInput
                ref="toInput"
                :default-value="toFieldPills"
                :filter="check"
                :multiple="!!firstItemIsPhone"
                @value="setPills"
              />
              <button
                v-if="!state.ccEnabled && firstItemIsEmail && canEmail"
                class="cc-button"
                @click="enableCC"
              >
                CC
              </button>
            </div>
          </div>
          <div
            v-if="state.ccEnabled && firstItemIsEmail && canEmail"
            class="flex-row flex-gap border-bottom"
          >
            <BaseText
              variant="body-small-medium"
              as="label"
            >
              CC
            </BaseText>

            <div
              class="to-row"
              :class="{ error_m: hasErrors('cc') }"
            >
              <PillInput
                ref="ccInput"
                :filter="check"
                :default-value="ccFieldPills"
                @value="setCC"
              />
            </div>
          </div>
          <div class="full-height">
            <div
              v-if="firstItemIsEmail"
              class="flex-row flex-gap border-bottom"
            >
              <BaseText
                variant="body-small-medium"
                as="label"
              >
                Subject:
              </BaseText>
              <input
                ref="subjectInput"
                aria-id="ComposeSubjectInput"
                :class="{ error_m: hasErrors('subject') }"
                placeholder="Enter an email subject"
                type="email"
                maxlength="255"
                autocomplete="off"
                data-lpignore="true"
                data-form-type="other"
                :value="state.subject"
                @input="(event) => (state.subject = event.target.value)"
              />
            </div>
            <div class="full-height">
              <textarea
                ref="bodyInput"
                aria-id="ComposeEmailTextArea"
                rows="6"
                placeholder="Start a new message"
                :value="state.bodyText"
                :class="{ error_m: hasErrors('body') }"
                @input="(event) => (state.bodyText = event.target.value)"
                @keydown.enter.exact.prevent="addEnter"
              />
            </div>
          </div>
        </div>
      </div>
      <InboxEmailFileList
        v-if="canAttach"
        :files="state.files"
        :error="hasErrors('files')"
        :errors="firstItemIsPhone && 'Files must be an pdf, png, jpg only'"
        @remove="removeFile"
      />
      <div
        v-if="!state.search"
        class="flex-row flex-between"
      >
        <InboxFileAttachments
          v-if="canAttach"
          ref="fileAttachment"
          :is-text-message="firstItemIsPhone"
          :filter="firstItemIsPhone && attachFilter"
          :files-for-removal="state.filesForRemoval"
          @change="handleFileChange"
          @files-removed="filesRemoved"
        />
        <div v-else />
        <button
          aria-id="ComposeSendButton"
          class="send"
          :disabled="!canSend"
          :class="{
            active: canSend,
          }"
          @click="send"
        >
          <span :class="{ sent: state.sent, sending: state.sending }">
            <SendIcon />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.error_message {
  background-color: $color-base-white-5;
  color: $color-base-white-100;
  padding: 5px;
  border-radius: 4px;

  button {
    border: none;
    cursor: pointer;
    display: inline-block;
    text-decoration: underline;
    background-color: transparent;
    color: inherit;
  }
}

.sending {
  opacity: 0.3;
  pointer-events: none;
}

.sent {
  svg {
    path {
      fill: green;
    }
  }
}

.filelist {
  padding: 5px;
  border-radius: 8px;

  .error_m {
    background-color: #ffe8e6;
    border: 1px solid #ff877d;
  }

  .file {
    margin: 5px 0;
    padding: 4px 8px 4px 4px;
    background: $color-base-white-10;
    border-radius: 24px;
    font-size: 12px;
    display: inline-flex;
    gap: 5px;

    &.error {
      background-color: #ffe8e6;
      border: 1px solid #ff877d;
    }

    &:hover {
      background: $color-base-white-10;

      .delete {
        display: block;
      }

      .icon {
        display: none;
      }
    }

    button {
      border: none;
      background-color: transparent;
      height: 15px;
      width: 18px;

      svg {
        height: 13px;
        width: auto;
      }
    }

    .delete {
      display: none;
    }
  }
}

button {
  cursor: pointer !important;
}

.search-results {
  flex: 1;
  max-height: 300px;
  overflow-y: auto;
  position: absolute;
  z-index: 2;
  bottom: 0;
  background: $color-background;
  width: 100%;
  left: 0;
  height: 400px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  padding: 0 20px;

  @include custom-scroll-bar;

  .results {
    margin-top: 15px;

    .search-items {
      display: flex;
      flex-direction: column;
      gap: 10px;
      cursor: pointer;
    }

    .group-title {
      color: $color-primary-70;
      text-transform: capitalize;
    }

    .search-item {
      gap: 15px;
      align-items: center;
      border-radius: 50px;
      display: inline-flex;
      padding: 3px 12px;
      background-color: transparent;

      .item-pill {
        h1 {
          margin: 0;
          color: $color-primary-100;
          padding: 0;
        }

        h3 {
          margin: 0;
          padding: 0;
          color: $color-primary-70;
        }
      }

      &.active {
        background-color: $color-base-white-10;
        color: $color-primary-100;

        svg {
          color: $color-primary-100;
          display: inline-block;
        }
      }

      &.selected {
        svg {
          display: block;
        }
      }
    }
  }
}

.header-line {
  margin-bottom: 5px;

  button {
    cursor: pointer;

    svg {
      color: $color-primary-100;
    }
  }
}

.new-message-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 400;
}

.disabled {
  opacity: 0.5;
}

.error_m {
  background-color: #fae3e3 !important;
  transition: background-color 1s ease;
}

.to-row {
  width: 100%;
  border-radius: 8px;
  display: grid;
  align-items: start;
  grid-template-columns: 90% 10%;

  .cc-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    height: 100%;
    color: $color-base-white-100;
    z-index: 1;
  }
}

.new-message {
  background: $color-background;
  box-shadow:
    -22.9px -8.90123px 26.7037px rgb(1 2 24 / 5%),
    13.3518px 12.35px 26.7037px rgb(1 2 24 / 16%);
  border-radius: 10px;
  border: 1px solid $color-base-white-5;
  position: fixed;
  bottom: 16px;
  right: 20px;
  width: 570px;
  padding: 20px;
  font-family: $global-font;
  z-index: 1000;
  min-height: 400px;
  max-height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;

  .v-select {
    --vs-border-width: 0;

    width: 100% !important;
    font-size: 11px;
    border: 1px solid transparent !important;

    .vs__dropdown-toggle {
      border: 1px solid transparent !important;
    }
  }

  .vs__dropdown-toggle {
    border: 1px solid transparent !important;
  }

  h1 {
    color: $color-primary-100;
  }

  label {
    text-align: center;
    color: $color-primary-70;
  }

  .add-from {
    background-color: transparent;
    border: none;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-50;
  }

  .from-email {
    background-color: $color-base-white-10;
    color: $color-primary-100;

    &:hover {
      svg {
        cursor: pointer;
      }
    }

    padding: 3px 5px 3px 10px;
    margin: 3px 7px;
    min-width: 50px;
    border-radius: 999px;
    display: flex !important;
    gap: 5px;

    &.pill_error {
      background-color: $color-alert;
      color: $color-primary-100;

      svg {
        path {
          fill: #fff !important;
        }

        fill: #fff !important;
      }
    }

    button {
      background-color: transparent;
      border: none;
      display: inline-block;
      text-transform: uppercase;
      height: 14px;
      width: 14px;
      position: relative;
      top: 2px;
      margin-right: 8px;
      text-align: center;
      font-size: 10px;
    }
  }

  .border-bottom {
    padding: 5px 0;
    border-bottom: 1px solid #8b8b8b30;
  }

  .flex-row {
    display: flex;
    align-items: center;

    label {
      position: relative;
      text-align: left;
    }

    &.flex-between {
      justify-content: space-between;

      button {
        background-color: transparent;
        border: none;
      }
    }

    &.flex-end {
      justify-content: flex-end;
    }
  }

  textarea,
  input {
    flex: 1;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    text-align: left;
    transition: background-color 1s ease;
    background-color: transparent;
    border: none;
    border-radius: 9px;
    padding: 8px;
    outline: none;
    color: $color-primary-100;
  }

  .full-height {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .recipients {
    overflow-y: scroll;
  }

  textarea {
    font-family: $global-font;
    flex: 1;
    resize: none;
    padding: 8px 0;
  }

  .cancel,
  .send {
    &:active {
      opacity: 0.9;
    }

    &:disabled {
      cursor: not-allowed !important;
    }
  }

  .cancel {
    background-color: transparent;
    margin-right: 6px;
  }

  .send {
    &.active {
      opacity: 1;
      background-color: $color-base-white-100 !important;

      svg {
        color: $color-primary-100;
      }
    }

    width: 30px;
    height: 30px;
    line-height: 12px;
    border-radius: 24px;
    align-items: center;
    justify-content: center;
    display: flex !important;
    background-color: $color-base-white-70 !important;
    opacity: 0.4;
    border: 1px solid $color-base-white-100;

    svg {
      color: $color-primary-100;
    }
  }
}

:focus {
  outline: none;
  background-color: $color-base-white-30;
}
</style>
