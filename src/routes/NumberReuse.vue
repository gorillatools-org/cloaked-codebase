<script setup>
import { reactive, onMounted, defineComponent, computed } from "vue";
import moment from "moment";
import { humanize } from "@/scripts/timestamp_format";
import store from "@/store";
import Clock from "@/assets/icons/clock.svg";
import TrashIcon from "@/assets/icons/delete-trash.svg";
import ExpandList from "@/assets/icons/list_expanded.svg";
import CheckMark from "@/assets/icons/checkmark_gray.svg";
import LeftArrow from "@/assets/icons/chevron-left.svg";
import RightArrow from "@/assets/icons/chevron-right.svg";
import { phone_format, getIdentityNickname } from "@/scripts/format";
import { useToast } from "@/composables/useToast.js";
import ReuseService from "@/api/actions/reuse-service.js";
import InputSpinner from "@/features/InputSpinner";
const toast = useToast();
import { dbMixin } from "@/mixins/db";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";

const ui = reactive({
  loading: true,
  error: null,
  page: 1,
  limit: 10,
});

const data = reactive({
  cloaks: [],
  selected: [],
});

const total = computed(() => store.state.reuse.count);

const hasCloaks = computed(() => store.state.reuse.numbers.length > 0);
onMounted(() => {
  data.loading = true;
  ReuseService.getInitialCount().finally(() => {
    ui.loading = false;
  });
});

defineComponent({
  IdentityIcon,
});

const selectMode = computed(() => data.selected.length > 0);

const cloaks = computed(() => {
  if (ui.loading) {
    return new Array(7).fill(null).map(() => ({
      id: Math.random() * 100000,
    }));
  }
  return store.state.reuse.numbers.map((cloak) => {
    const identity = store.state.localdb.db_cloaks.find(
      (i) => i.id === cloak.identity_id
    );
    return {
      ...cloak,
      phone: cloak.phone,
      expiration: cloak.expiration,
      identity_id: cloak.identity_id || cloak.id,
      sending: false,
      delete_id: cloak.delete_id || cloak.id,
      ...identity,
    };
  });
});

const today = moment();

function refreshNumbers(page) {
  data.loading = true;
  return ReuseService.getExpiringNumbers(page).finally(() => {
    ui.loading = false;
  });
}
function setPage(page) {
  refreshNumbers(ui.page + page).then(() => {
    ui.page = ui.page + page;
  });
}
function diffInDays(expiration) {
  return moment(expiration).diff(today, "days");
}
function diffInHours(expiration) {
  return moment(expiration).diff(today, "hour");
}
function timediff(expiration) {
  const diff = humanize(expiration);
  return diff === "a day" ? "1 day" : diff;
}
function removeCloak(cloak) {
  store.commit(
    "reuse/setNumbers",
    [...cloaks.value].filter((c) => c.delete_id !== cloak.delete_id)
  );
}

function getNickname(cloak) {
  return getIdentityNickname(cloak);
}
function getPhone(cloak) {
  return phone_format(cloak.phone);
}
function updateCloak(cloak, update) {
  const updated = [...cloaks.value];
  const index = updated.findIndex((c) => c.delete_id === cloak.delete_id);
  updated[index] = { ...updated[index], ...update };
  store.commit("reuse/setNumbers", updated);
}
function keeepNumber(cloak) {
  updateCloak(cloak, { sending: true });
  ReuseService.keepPhoneNumberById(cloak.delete_id)
    .then(() => {
      removeCloak(cloak);
      toast.success(`You kept ${getPhone(cloak)} for ${getNickname(cloak)}`);
    })
    .catch(() => {
      toast.error("Failed to preserve numbers");
    });
}
function removeNumber(cloak) {
  updateCloak(cloak, { sending: true });
  ReuseService.expirePhoneNumbersByIds([cloak.delete_id])
    .then(() => {
      removeCloak(cloak);
      store.dispatch("fetchPopulatedData", cloak);
      toast.success(`You removed ${getPhone(cloak)} for ${getNickname(cloak)}`);
    })
    .catch(() => {
      toast.error("Failed to expire number");
    });
}
function deleteNumber(cloak) {
  store.dispatch("openModal", {
    header: `Delete inactive phone numbers to prevent unwanted spam and tracking`,
    subheader:
      "This will delete the number’s entire history from its identity.",
    button: {
      text: "Yes, Delete",
      onClick: () => removeNumber(cloak),
      danger: true,
    },
  });
}

function deleteAll() {
  store.dispatch("openModal", {
    header: `Delete all phone numbers?`,
    subheader:
      "This will permanently delete all of your inactive phone numbers and associated activity history from their identities.",
    button: {
      text: "Yes, Delete",
      onClick: () => {
        ReuseService.expirePhoneNumbersByIds(data.selected)
          .then(() => {
            data.selected = [];
            dbMixin.methods.frontLoadCloaks(true);
            toast.success("All selected numbers expired");
          })
          .catch(() => {
            toast.error("Failed to expire numbers");
          });
      },
      danger: true,
    },
  });
}

function toggleAll() {
  if (data.selected.length > 0) {
    data.selected = [];
  } else {
    data.selected = [...cloaks.value].map((cloak) => cloak.delete_id);
  }
}
function toggleCloak(cloak) {
  if (isSelected(cloak)) {
    data.selected = data.selected.filter((id) => id !== cloak.delete_id);
  } else {
    data.selected = [...data.selected, cloak.delete_id];
  }
}
function isSelected(cloak) {
  return data.selected.includes(cloak.delete_id);
}
function open(cloak) {
  store.dispatch("openCloakDetails", { cloak });
}
</script>
<template>
  <div class="reuse-container">
    <div>
      <h1>Number clean up</h1>
      <p>
        Delete inactive phone numbers to prevent unwanted spam and tracking.
        This will delete the number’s entire history from its identity.
      </p>
    </div>
    <div>
      <div
        v-if="!ui.loading && hasCloaks"
        class="select-menu"
      >
        <div>
          <button
            class="checkbox checkbox-all"
            :class="{ checked: selectMode }"
            @click="toggleAll"
          >
            <ExpandList v-if="selectMode" />
          </button>
          <span v-if="!selectMode">Select all</span>
        </div>
        <div>
          <button
            v-if="selectMode"
            class="trash"
            @click="deleteAll"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      <div
        v-if="!ui.loading && !hasCloaks"
        class="empty-state"
      >
        <div>
          <TrashIcon />
        </div>
        <div>
          <strong>There’s nothing here yet.</strong>
          <br />
          <span>
            Inactive numbers will be stored in
            <br />
            the Number clean up for 30 days.
          </span>
        </div>
      </div>
      <div v-else>
        <ul :class="{ preview: ui.loading }">
          <li
            v-for="cloak in cloaks"
            :key="cloak.id"
          >
            <div>
              <div
                v-if="selectMode"
                class="checkbox-container"
              >
                <button
                  class="checkbox"
                  :class="{ checked: isSelected(cloak) }"
                  @click="toggleCloak(cloak)"
                >
                  <CheckMark v-if="isSelected(cloak)" />
                </button>
              </div>
              <div>
                <button
                  class="previewable icon"
                  @click="open(cloak)"
                >
                  <IdentityIcon
                    :identity="cloak"
                    :override="{
                      width: '40px',
                      height: '40px',
                      'align-self': 'center',
                    }"
                  />
                </button>
              </div>
              <div class="identity-info">
                <button
                  class="previewable"
                  @click="open(cloak)"
                >
                  <strong>{{ getNickname(cloak) }}</strong>
                </button>
                <div class="previewable phone-display preview-alt">
                  <span>{{ getPhone(cloak) }}</span>
                </div>
              </div>
            </div>
            <div>
              <span class="timediff previewable preview-alt">
                <Clock />
                <span v-if="parseInt(diffInHours(cloak.expiration), 10) > 24">
                  {{ diffInDays(cloak.expiration) }} days
                </span>
                <span
                  v-else
                  class="expiring"
                >
                  {{ timediff(cloak.expiration) }}
                </span>
              </span>

              <div :class="{ disabled: selectMode || cloak.sending }">
                <button
                  class="previewable preview-alt"
                  @click="keeepNumber(cloak)"
                >
                  <div
                    v-if="cloak.sending"
                    class="loading small"
                  >
                    <InputSpinner />
                  </div>
                  <span v-else>keep</span>
                </button>
                <button
                  class="previewable"
                  @click="deleteNumber(cloak)"
                >
                  <div
                    v-if="cloak.sending"
                    class="loading small"
                  >
                    <InputSpinner />
                  </div>
                  <span v-else>delete</span>
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div
      v-if="ui.limit < total"
      class="pagination"
    >
      <div>
        <span>
          {{ Math.max((ui.page - 1) * ui.limit, 1) }} -
          {{ Math.min(ui.page * ui.limit, total) }} of {{ total }}
        </span>
        <div v-if="ui.page > 1">
          <button @click="setPage(-1)">
            <LeftArrow />
          </button>
        </div>
        <div v-if="ui.page * ui.limit < total">
          <button @click="setPage(1)">
            <RightArrow />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
/* stylelint-disable */
.empty-state {
  text-align: center;
  padding: 40px;
  svg {
    transform: scale(1.5);
  }
  strong {
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }
  span {
    color: $color-primary-50;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
}
button {
  cursor: pointer;
  background-color: transparent;
  border: none;
  color: $color-primary-100;
}
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  &.small {
    padding: 0 6.9px;
    height: 20px;
    justify-content: center !important;
    align-items: center;
    text-align: center;
    margin: 0 auto;
  }
}
.pagination {
  text-align: center;
  padding: 45px 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  > div {
    display: inline-flex;
    justify-content: flex-end;
    align-items: center;
    min-width: 150px;
    span {
      width: 90px;
      color: $color-primary-50;
      text-align: right;
      font-feature-settings:
        "clig" off,
        "liga" off;
      font-size: 15px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      display: inline-flex;
    }
    div {
      margin: 0 auto;
      width: 30px;
    }
  }
}
.reuse-container {
  max-width: 560px;
  margin: 50px;
  color: $color-primary-100;
  font-size: 12px;
  h1 {
    font-size: 24px;
    font-weight: 500;
  }
  p {
    font-size: 14px;
    margin: 20px 0;
  }
  .checkbox-all {
    padding: 0;
    margin: 0;
  }
  .checkbox-container {
    width: 25px;
    height: 20px;
    .checkbox {
      color: $color-primary-100;
      padding: 0;
      margin: 0;
      &:hover {
        background-color: $color-primary-10;
      }
      position: relative;
      display: block;
      &.checked {
        color: $color-primary-1;
        &:hover {
          background-color: $color-primary-70;
        }
      }
      svg {
        position: relative;
        top: -1px;
        width: 13px;
        height: 13px;
      }
    }
  }
  .identity-info {
    button {
      padding: 0;
      font-size: 14px;
      strong {
        font-weight: 600;
        color: $color-primary-90;
      }
    }
    > div {
      color: $color-primary-70;
    }
  }
  .checkbox {
    background-color: $color-primary-1;
    border-radius: 100px;
    color: $color-primary-1;
    width: 15px;
    height: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid $color-primary-100;
    &:hover {
      background-color: $color-primary-5;
    }
    &.checked {
      background-color: $color-primary-100;
    }
  }
  .select-menu {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    padding: 10px;
    height: 30px;
    > div:first-child {
      display: flex;
      gap: 10px;
      justify-content: space-between;
      align-items: center;
    }
    .trash {
      background-color: transparent;
      color: $color-primary-100;
      border: none;
      svg {
        width: 30px;
        height: 30px;
      }
    }
  }
  ul {
    &.preview {
      li {
        &:nth-child(8) {
          opacity: 0.15;
        }
        &:nth-child(7) {
          opacity: 0.2;
        }
        &:nth-child(6) {
          opacity: 0.4;
        }
        &:nth-child(5) {
          opacity: 0.5;
        }
        &:nth-child(4) {
          opacity: 0.6;
        }
        &:nth-child(3) {
          opacity: 0.7;
        }
        &:nth-child(2) {
          opacity: 0.8;
        }
        .previewable {
          > * {
            opacity: 0;
          }
          border-radius: 50px;
          min-height: 15px;
          &.icon {
            border-radius: 50%;
          }
          &.phone-display {
            margin-top: 5px;
            margin-left: 10px;
          }
          &.preview-alt {
            background-color: $color-primary-10 !important;
          }
          background-color: $color-primary-20 !important;
          border: none !important;
        }
      }
    }
    li {
      &:hover {
        background-color: $color-primary-5;
      }
      display: flex;
      justify-content: space-between;
      border-top: 1px solid $color-primary-10;
      padding: 10px;
      gap: 10px;
      &:first-child {
        border-top: none;
      }
      .timediff {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
        .expiring {
          color: $color-alert;
        }
      }
      > div {
        gap: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        &:last-child {
          align-items: center;
          > div {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            &.disabled {
              opacity: 0.3;
              pointer-events: none;
            }
            button {
              cursor: pointer;
              border-radius: 999px;
              padding: 5px 25px;
              font-size: 12px;
              text-transform: capitalize;
              background-color: transparent;
              border: 1px solid $color-primary-100;
              color: $color-primary-100;
              &:first-child {
                &:hover {
                  background-color: $color-primary-10;
                }
              }
              &:last-child {
                background-color: $color-primary-90;
                color: $color-primary-1;
                &:hover {
                  background-color: $color-primary-100;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
