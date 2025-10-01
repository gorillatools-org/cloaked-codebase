<script setup>
import { onMounted, reactive, computed, watch } from "vue";
import moment from "moment";
import { uniq } from "lodash-es";

import TrashService from "@/api/actions/trash-service.js";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";
import { humanize } from "@/scripts/timestamp_format";
import InlineSvg from "@/features/InlineSvg.vue";
import { tools } from "@/scripts/tools";
import BaseText from "@/library/BaseText.vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";

const toast = useToast();
const props = defineProps({
  types: { type: Object, default: null },
  type: { type: String, default: null },
});

const emits = defineEmits(["setType"]);

const data = reactive({
  trash: [],
  selected: [],
});
const ui = reactive({
  page: 1,
  perPage: 10,
  total: 0,
  type: props.type,
});

watch(
  () => ui.type,
  (type) => {
    emits("setType", type);
  },
  { deep: true }
);

const pages = computed(() => Math.ceil(ui.total / ui.perPage));

const currentSummary = computed(() => {
  let current = (ui.page - 1) * ui.perPage + 1;
  const min = Math.min(ui.total, current + ui.perPage);
  if (current > min) {
    current = min;
  }
  return `${current} - ${min} of ${ui.total}`;
});

const navPage = (direction) => {
  let next = ui.page + direction;
  if (next < 1) {
    next = 1;
  }
  if (next + 1 > pages.value) {
    next = pages.value;
  }
  ui.page = next;
  TrashService.getTrash(ui.page).then((res) => {
    data.trash = res.data.results;
    ui.total = res.data.count;
  });
};
onMounted(() => {
  refresh();
});

function refresh() {
  TrashService.getTrash().then((res) => {
    data.trash = res.data.results;
    data.selected = [];
    ui.total = res.data.count;
  });
}
function toggleSelect(item) {
  if (isSelected(item)) {
    data.selected = data.selected.filter((i) => i.id !== item.id);
  } else {
    const id = uniq(data.selected.map((i) => i.identity_id));
    if (id.length === 1 && id[0] === item.identity_id) {
      data.selected.push(item);
    } else {
      data.selected = [item];
    }
  }
}

function isSelected(item) {
  return data.selected.map((i) => i.id).includes(item.id);
}
function canSelect(item) {
  const id = uniq(data.selected.map((i) => i.identity_id));
  return id.length === 1 && id[0] === item.identity_id;
}

function dateFormat(date_time) {
  return moment(date_time).format("MM/DD/YYYY");
}

function domainOnly(url) {
  try {
    const parse = new URL(url);
    return parse.hostname;
  } catch {
    return "";
  }
}

const canDelete = computed(() => {
  return data.selected.length > 0;
});
const canRestore = computed(() => {
  let allowRestore = true;
  data.selected.map((i) => {
    if (i.restore_to_previous !== true) {
      allowRestore = false;
    }
  });
  return allowRestore;
});
const canRestoreNew = computed(() => {
  let allowRestore = true;
  data.selected.map((i) => {
    if (i.restore_to_previous === null) {
      allowRestore = false;
    }
  });
  return allowRestore;
});

function deleteSelected() {
  store.dispatch("openModal", {
    header: `Delete selected items?`,
    subheader: "This action cannot be reversed. ",
    button: {
      text: "Yes, delete",
      onClick: () => {
        TrashService.deletePermanently(data.selected.map((i) => i.id))
          .then(() => {
            refresh();
            toast.success("Items deleted");
          })
          .catch(() => {
            toast.error("Could not delete, please try again");
          });
      },
      danger: true,
    },
  });
}

function restoreToIdentity() {
  TrashService.restoreToIdentity(data.selected.map((i) => i.id))
    .then(() => {
      refresh();
      refreshIdentities();
      toast.success("Items restored");
    })
    .catch(() => {
      toast.error("Failed to restore, please try again");
    });
}

function restoreToNewIdentity() {
  TrashService.restoreToNewIdentity(data.selected.map((i) => i.id))
    .then(() => {
      refresh();
      refreshIdentities();
      toast.success("Items restored");
    })
    .catch(() => {
      toast.error("Failed to restore, please try again");
    });
}

function deletesIn(timestamp) {
  const time = moment(timestamp).add("30", "days");
  return humanize(time.format("YYYY-MM-DD HH:mm:ss"));
}

function emptyTrashConfirm() {
  TrashService.emptyTrash()
    .then(() => {
      refresh();
      store.dispatch("closeModal");
      toast.success("Trash emptied");
    })
    .catch(() => {
      toast.error("Failed to delete trash, please try again");
    });
}
function emptyTrash() {
  store.dispatch("openModal", {
    header: `Empty Trash?`,
    subheader:
      "All identities and their associated activities and information will be permanently deleted. This action cannot be reversed. ",
    button: {
      text: "Yes, empty trash",
      onClick: () => emptyTrashConfirm(),
      danger: true,
    },
  });
}

function unselectAll() {
  data.selected = [];
}

function refreshIdentities() {
  setTimeout(() => {
    window.dispatchEvent(new Event("cloak:identities"));
  }, 3000);
}

function toggleShowItem(item) {
  modifyAttribute(item, "show", !item.show);
}

function modifyAttribute(item, attribute, value) {
  const copyItems = [...data.trash];
  const index = copyItems.findIndex((i) => i.id === item.id);
  copyItems[index][attribute] = value;
  data.trash = copyItems;
}

function shouldCopy(item) {
  return ["stored_autofill", "stored_password", "autofill_password"].includes(
    item.object_type
  );
}

function shouldShowItem(item) {
  return !isPasswordObject(item) || item.show;
}
function isPasswordObject(item) {
  return ["stored_password", "autofill_password"].includes(item.object_type);
}
function copyItem(item) {
  tools.copyToClipboard(item.item);
  modifyAttribute(item, "title", "copied!");
  setTimeout(() => {
    modifyAttribute(item, "title", null);
  }, 1500);
}
</script>
<template>
  <div class="trash-identity-container">
    <div v-if="ui.total > 0">
      <div class="trash-info">
        <BaseText
          as="div"
          variant="body-small-medium"
        >
          Items in the Trash will be automatically deleted after 30 days.
        </BaseText>
        <div class="empty-trash-icon">
          <button @click="emptyTrash">
            <BaseText variant="body-small-medium">Empty trash now</BaseText>
          </button>
        </div>
      </div>
      <div class="trash-data-header">
        <div class="actions">
          <div v-if="data.selected.length > 0">
            <button
              class="select-all-button"
              @click="unselectAll"
            >
              <InlineSvg name="select-all" />
            </button>
            <UiTooltip
              title="Remove the currently selected items"
              position="top"
              align-x="center"
            >
              <button
                class="delete-button"
                :disabled="!canDelete"
                @click="deleteSelected"
              >
                <InlineSvg name="delete-trash" />
                <BaseText variant="body-small-medium">
                  Delete permanently
                </BaseText>
              </button>
            </UiTooltip>
            <UiTooltip
              v-if="canRestore"
              title="Restore the selected items to their original position"
              position="top"
              align-x="center"
            >
              <button @click="restoreToIdentity">
                <InlineSvg name="restore" />
                <BaseText variant="body-small-medium">
                  Restore to original identity
                </BaseText>
              </button>
            </UiTooltip>
            <UiTooltip
              v-else
              title="Cannot restore the selected item to their original identity"
              position="top"
              align-x="center"
            >
              <button class="disabled">
                <InlineSvg name="restore" />
                <BaseText variant="body-small-medium">
                  Restore to original identity
                </BaseText>
              </button>
            </UiTooltip>
            <UiTooltip
              v-if="canRestoreNew"
              title="Restores the selected items to a new identity"
              position="top"
              align-x="center"
            >
              <button @click="restoreToNewIdentity">
                <InlineSvg name="restore-new" />
                <BaseText variant="body-small-medium">
                  Restore to new identity
                </BaseText>
              </button>
            </UiTooltip>
            <UiTooltip
              v-else
              title="Selected item cannot be restored to a new identity, you can copy its value instead"
              position="top"
              align-x="center"
            >
              <button class="disabled">
                <InlineSvg name="restore-new" />
                <BaseText variant="body-small-medium">
                  Restore to new identity
                </BaseText>
              </button>
            </UiTooltip>
          </div>
        </div>
        <div class="right">
          <div
            v-if="false"
            class="trash-type-select"
          >
            <BaseText variant="body-small-medium">View:</BaseText>
            <select
              :value="ui.type"
              @input="(event) => (ui.type = event)"
            >
              <option :value="props.types.IDENTITY">Identity</option>
              <option :value="props.types.ACTIVITY">Activity</option>
            </select>
          </div>
          <div class="pagination">
            <button
              v-if="pages > 1"
              @click="navPage(-1)"
            >
              <InlineSvg name="chevron-left" />
            </button>
            <BaseText variant="body-small-medium">
              {{ currentSummary }}
            </BaseText>
            <button
              v-if="pages > 1"
              @click="navPage(1)"
            >
              <InlineSvg name="chevron-right" />
            </button>
          </div>
        </div>
      </div>
      <div
        class="data-table"
        :class="{ selecting: data.selected.length > 0 }"
      >
        <table>
          <thead>
            <tr>
              <th />
              <BaseText
                variant="body-3-semibold"
                as="th"
              >
                Item
              </BaseText>
              <BaseText
                variant="body-3-semibold"
                as="th"
              >
                Identity
              </BaseText>
              <BaseText
                variant="body-3-semibold"
                as="th"
              >
                Deleted On
              </BaseText>
              <BaseText
                variant="body-3-semibold"
                as="th"
              >
                URL
              </BaseText>
              <BaseText
                variant="body-3-semibold"
                as="th"
              >
                Gone In
              </BaseText>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in data.trash"
              :key="index"
              :class="{
                selected: isSelected(item),
                'can-select': canSelect(item),
              }"
            >
              <td>
                <button @click="toggleSelect(item)">
                  <InlineSvg name="checkmark" />
                </button>
              </td>
              <td>
                <div class="item-value">
                  <input
                    readonly="true"
                    :type="shouldShowItem(item) ? 'text' : 'password'"
                    :value="item.item"
                  />
                  <div class="hover-reveal">
                    <UiTooltip
                      v-if="isPasswordObject(item)"
                      title="Show/Hide value"
                      position="top"
                      align-x="center"
                    >
                      <button @click="toggleShowItem(item)">
                        <InlineSvg
                          v-if="shouldShowItem(item)"
                          name="eye"
                        />
                        <InlineSvg
                          v-else
                          name="eye-slash"
                        />
                      </button>
                    </UiTooltip>
                    <UiTooltip
                      v-if="shouldCopy(item)"
                      :title="item.title || 'copy'"
                      position="top"
                      align-x="center"
                    >
                      <button @click="copyItem(item)">
                        <InlineSvg name="copy" />
                      </button>
                    </UiTooltip>
                  </div>
                </div>
              </td>
              <td class="identity-name">
                <IdentityIcon
                  :identity="{ ...item, logo_url: item.logo }"
                  :override="{ height: '24px', width: '24px' }"
                />
                <BaseText variant="body-small-medium">
                  {{ item.identity_name }}
                </BaseText>
              </td>
              <BaseText
                as="td"
                variant="body-small-medium"
              >
                {{ dateFormat(item.created_at) }}
              </BaseText>
              <BaseText
                as="td"
                variant="body-small-medium"
              >
                {{ domainOnly(item.website_url) }}
              </BaseText>
              <BaseText
                as="td"
                variant="body-small-medium"
              >
                {{ deletesIn(item.created_at) }}
              </BaseText>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div
      v-else
      class="trash-empty"
    >
      <div>
        <InlineSvg name="delete-trash" />
        <BaseText
          as="h3"
          variant="headline-6-medium"
        >
          There's nothing here yet.
        </BaseText>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.identity-name {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
  gap: 10px;
}
input[type="checkbox"] {
  all: unset;
}
.trash-container {
  height: 100%;
}
.select-all-button {
  display: block !important;
  padding: 0 !important;
  height: 25px;
  svg {
    color: $color-primary-100 !important;
    rect {
      color: $color-primary-1 !important;
    }
    path {
      color: $color-primary-1 !important;
    }
  }
}
.trash-data-header {
  color: $color-primary-100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
  .actions {
    > div {
      display: flex;
      gap: 5px;
      button {
        color: $color-primary-100;
        svg {
          color: $color-primary-100;
          fill: $color-primary-100;
          path {
            fill: $color-primary-100;
          }
          svg {
            transform: scale(0.7);
          }
        }
        &.disabled {
          opacity: 0.5;
        }
        &.delete-button {
          &:hover {
            background-color: $color-alert-tint;
            color: $color-alert !important;
            svg {
              path {
                fill: $color-alert !important;
              }
            }
          }
          svg {
            transform: scale(0.6);
          }
        }
      }
    }
  }
  button {
    padding: 2px 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    border: none;
    border-radius: 8px;
    background-color: transparent;
    cursor: pointer;
    &:disabled {
      svg {
        opacity: 0.3;
      }
    }
    &:hover {
      background-color: $color-primary-5;
    }
  }
  .trash-type-select {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-size: 15px; // NOTE: select is an exception for now
    font-style: normal; // NOTE: select is an exception for now
    font-weight: 400; // NOTE: select is an exception for now
    line-height: normal; // NOTE: select is an exception for now
    select {
      color: $color-primary-100;
      background-color: transparent;
      border: none;
    }
  }
  .right {
    display: flex;
    gap: 10px;
    span {
      color: $color-primary-50;
      // font-size: 12px;
    }
  }
}
.trash-info {
  color: $color-primary-100;
  border-bottom: 1px solid $color-primary-10;
  background-color: $color-primary-5;
  padding: 16px 24px;
  align-items: center;
  gap: 10px;
  display: flex;
  justify-content: center;
  .empty-trash-icon {
    button {
      cursor: pointer;
      color: $color-primary-100;
      padding: 0;
      position: relative;
      border: none;
      background-color: transparent;
      display: inline-flex;
      text-decoration-line: underline;
    }
  }
}

.data-table {
  color: $color-primary-100;
  padding: 0 24px;
  &.selecting {
    tbody {
      tr {
        opacity: 0.3;
        &.selected,
        &.can-select {
          opacity: 1;
        }
      }
    }
  }
  table {
    width: 100%;
    border-spacing: 12px;
    border-collapse: collapse;

    thead {
      th {
        text-align: left;
      }
    }
    tbody {
      position: relative;
      tr {
        border-radius: 10px;
        &:first-child {
          &:after {
            background: transparent;
          }
        }
        &:after {
          content: "";
          background: $color-primary-5;
          position: absolute;
          left: 1%;
          height: 1px;
          width: 98%;
        }
        &:hover {
          background-color: $color-primary-5;
          td {
            .item-value {
              .hover-reveal {
                opacity: 1;
              }
            }
          }
        }
        &.selected {
          &:hover {
            background-color: $color-primary-5;
          }
          td {
            &:first-child {
              button {
                background-color: $color-primary-100;
                color: $color-primary-1;
                svg {
                  display: block;
                }
              }
            }
          }
        }
        td {
          .item-value {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin: 0;
            padding: 0 10px 0 0;

            .hover-reveal {
              display: flex;
              opacity: 0;
              gap: 5px;
              justify-content: center;
              align-items: center;
            }
            button {
              color: $color-primary-100;
              background-color: transparent;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
              padding: 0;
            }
            input {
              background-color: transparent;
              border: none;
              color: $color-primary-100;
              height: 100%;
              width: 100%;
              margin: 0;
              padding: 0;
            }
          }
          padding: 15px 10px;
          &:last-child {
            padding-right: 15px;
            border-top-right-radius: 10px;
            border-bottom-right-radius: 10px;
          }
          &:first-child {
            padding-left: 15px;
            border-top-left-radius: 10px;
            border-bottom-left-radius: 10px;
            button {
              cursor: pointer;
              background-color: transparent;
              border: 1px solid $color-primary-100;
              color: $color-primary-100;
              border-radius: 50px;
              height: 28px;
              width: 28px;
              transform: scale(0.7);
              display: flex;
              justify-content: center;
              align-items: center;
              svg {
                transform: scale(1.2);
                display: none;
              }
            }
          }
        }
      }
    }
  }
}

.pagination {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  button {
    cursor: pointer;
    background-color: transparent;
    border: none;
    color: $color-primary-100;
  }
}

.trash-empty {
  color: $color-primary-100;
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 200px);
  gap: 10px;
  padding-top: 50%;
  transform: translateY(-50%);
  > div {
    text-align: center;
    max-width: 200px;
    h3 {
      font-style: normal;
      font-weight: 500;
      line-height: normal;
    }
    p {
      color: $color-primary-70;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }
    svg {
      transform: scale(1.2);
    }
  }
}
</style>
