<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { ref, computed, markRaw } from "vue";
import { useDataDeletionRow } from "@/routes/DataDeletion/composables/useDataDeletionRow";
import { useDataDeleteOperator } from "@/routes/DataDeletion/composables/useDataDeleteOperator";
import store from "@/store";
import ActionRequiredMarkedDoneModal from "@/features/modals/data-delete/ActionRequiredMarkedDoneModal.vue";
import DataDeleteService from "@/api/actions/data-delete-service";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  PH_EVENT_DATA_REMOVAL_USER_CLICKED_MARK_DONE,
  PH_EVENT_DATA_REMOVAL_USER_CLICKED_MARK_DONE_CONFIRMATION,
  PH_EVENT_DATA_REMOVAL_USER_CLICKED_OPERATOR_START,
} from "@/scripts/posthogEvents";

const props = defineProps({
  actionRequiredFamilies: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["toggleFamilyOpen"]);

const {
  rowDetailsRef,
  renderMarkdown,
  isNameInSupportedList,
  onLinkToSupportPage,
  resizeIframe,
  setupResizeWatch,
  iframeRef,
} = useDataDeletionRow();

// Set up the iframe resize watcher
setupResizeWatch();

const { openOperatorModal } = useDataDeleteOperator();

const isExpanded = ref(false);
const expandedFamilies = ref(new Set());

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function toggleFamilyExpand(family) {
  if (expandedFamilies.value.has(family.id)) {
    expandedFamilies.value.delete(family.id);
  } else {
    expandedFamilies.value.add(family.id);
  }
  emit("toggleFamilyOpen", family);
}

function showMarkDoneConfirmation(brokerFamily) {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(ActionRequiredMarkedDoneModal),
      props: {
        name: brokerFamily?.name,
      },
      events: {
        done: () => markDone(brokerFamily),
        review: () => toggleFamilyExpand(brokerFamily, true),
      },
    },
  });

  posthogCapture(PH_EVENT_DATA_REMOVAL_USER_CLICKED_MARK_DONE, {
    broker_name: brokerFamily.name,
  });
}

function markDone(brokerFamily) {
  DataDeleteService.markBrokerFamilyDone(brokerFamily.id)
    .then(() => {
      return DataDeleteService.getRemovalLog().catch(() => {});
    })
    .catch(() => {});
  posthogCapture(PH_EVENT_DATA_REMOVAL_USER_CLICKED_MARK_DONE_CONFIRMATION, {
    broker_name: brokerFamily.name,
  });
}

function handleMarkDone(family, event) {
  event.stopPropagation();
  showMarkDoneConfirmation(family);
}

function handleOperatorClick() {
  posthogCapture(PH_EVENT_DATA_REMOVAL_USER_CLICKED_OPERATOR_START);
  openOperatorModal();
}

const sortedFamilies = computed(() => {
  return [...props.actionRequiredFamilies].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
});

const getMarkdownContent = computed(() => (instructions) => {
  return renderMarkdown(instructions);
});
</script>

<template>
  <div class="action-banner">
    <div
      class="banner-content"
      @click="handleOperatorClick"
    >
      <div class="banner-text">
        <BaseText
          variant="headline-4"
          class="banner-title"
        >
          Remove your data from {{ actionRequiredFamilies.length }} brokers
        </BaseText>
        <BaseText
          variant="body-2"
          class="banner-subtitle"
        >
          Use our AI-powered tool to automatically remove your information
        </BaseText>
      </div>
      <BaseButton
        variant="secondary"
        size="lg"
        icon="wand-2"
        class="banner-button"
        @click.stop="handleOperatorClick"
      >
        Start Removal
      </BaseButton>
    </div>

    <!-- Expandable Mini Table -->
    <div class="mini-table-section">
      <div
        class="mini-table-header"
        @click="toggleExpand"
      >
        <BaseText variant="headline-6-medium">
          {{ isExpanded ? "Hide" : "View" }} Removal Steps
        </BaseText>
        <InlineSvg
          :name="isExpanded ? 'chevron-up' : 'chevron-down'"
          class="chevron-icon"
        />
      </div>

      <div
        v-if="isExpanded"
        class="mini-table-content"
      >
        <div
          v-for="family in sortedFamilies"
          :key="family.id"
          class="mini-table-row-wrapper"
        >
          <div
            class="mini-table-row"
            @click="toggleFamilyExpand(family)"
          >
            <div class="broker-info">
              <BaseText
                variant="headline-6-medium"
                class="expand-icon"
              >
                {{ expandedFamilies.has(family.id) ? "-" : "+" }}
              </BaseText>
              <BaseText variant="body-2">
                {{ family.name }}
                <span v-if="family.brokers?.length">
                  ({{ family.brokers.length }})
                </span>
              </BaseText>
            </div>
            <div class="broker-status">
              <InlineSvg
                name="needs-attention"
                class="status-icon"
              />
              <BaseText
                variant="body-2"
                class="status-text"
              >
                Needs attention
              </BaseText>
            </div>
          </div>

          <!-- Expanded Content -->
          <div
            v-if="expandedFamilies.has(family.id)"
            ref="rowDetailsRef"
            class="expanded-content"
          >
            <BaseText
              variant="headline-6-medium"
              class="warning"
            >
              {{ family.name }} requires some additional information from you in
              order to remove your records.
            </BaseText>

            <div
              v-if="family.brokers?.length"
              class="sub-brokers"
            >
              <BaseText
                as="h3"
                variant="headline-4-bold"
                class="sub-brokers-title"
              >
                Requesting to remove your info from {{ family.name }} will
                remove it from:
              </BaseText>
              <ol>
                <li
                  v-for="(broker, idx) in family.brokers"
                  :key="`${broker?.name}-${idx}`"
                >
                  <BaseText
                    variant="caption-semibold"
                    class="list-rank"
                  >
                    {{ idx + 1 }}
                  </BaseText>
                  <BaseText variant="headline-6-medium">
                    {{ broker?.name }}
                  </BaseText>
                </li>
              </ol>
            </div>

            <div
              v-if="family.removal_steps"
              class="removal-instructions"
            >
              <BaseText
                as="h3"
                variant="headline-4-bold"
                class="instructions-title"
              >
                How to remove your records from {{ family.name }}
              </BaseText>
              <iframe
                ref="iframeRef"
                class="instructions"
                :srcdoc="getMarkdownContent(family.removal_steps)"
                :style="`height: 100%; width: 100%;`"
                frameborder="0"
                sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                @load="resizeIframe"
              />
            </div>

            <div class="action-buttons">
              <BaseButton
                variant="secondary"
                size="lg"
                class="mark-done-button"
                @click="(event) => handleMarkDone(family, event)"
              >
                Mark as done
              </BaseButton>
            </div>

            <BaseText
              v-if="isNameInSupportedList(family.name)"
              as="h3"
              variant="headline-4-bold"
              class="support-link"
            >
              {{ "Need more help removing your information? Click " }}
              <span
                class="link-text"
                @click="() => onLinkToSupportPage(family.name)"
              >
                {{ "here" }}
              </span>
              {{ " to access a step by step walkthrough." }}
            </BaseText>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
@import "@/assets/scss/recursive/_variables.scss";

.action-banner {
  width: 100%;
  margin-top: 24px;
  transition: all 0.3s ease-in-out;

  .banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    background: linear-gradient(to right, $color-primary-5, $color-primary-10);
    border-radius: 12px 12px 0 0;
    border: 1px solid $color-primary-10;
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &:hover {
      border: 1px solid $color-primary-100;
      transform: translateY(-1px);
      box-shadow: 0px 8px 16px rgba($color-primary-100-light, 0.12);
      @at-root .theme-dark & {
        box-shadow: 0px 8px 16px rgba($color-primary-50-dark, 0.12);
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 16px;
      padding: 20px;
    }
  }

  .banner-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .banner-title {
    color: $color-primary-100;
  }

  .banner-subtitle {
    color: $color-primary-70;
  }

  .banner-button {
    white-space: nowrap;
  }

  .mini-table-section {
    border: 1px solid $color-primary-10;
    border-top: none;
    border-radius: 0 0 12px 12px;
  }

  .mini-table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    cursor: pointer;
    background: $color-primary-5;
    border-bottom: 1px solid $color-primary-10;
    transition: all 0.2s ease;

    &:hover {
      background: $color-primary-10;
      padding-left: 28px;
    }

    .chevron-icon {
      width: 16px;
      height: 16px;
      transition: transform 0.3s ease;
      color: $color-primary-70;
    }
  }

  .mini-table-content {
    background: $color-base-white-100;
    padding: 4px 0;
  }

  .mini-table-row-wrapper {
    border-bottom: 1px solid $color-primary-10;
    margin: 0 12px;

    &:last-child {
      border-bottom: none;
    }
  }

  .mini-table-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 12px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    margin: 2px 0;

    &:hover {
      background: $color-primary-5;
      transform: translateX(2px);
    }

    .broker-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .expand-icon {
        min-width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $color-primary-10;
        border-radius: 4px;
        color: $color-primary-100;
        font-size: 14px;
      }
    }

    .broker-status {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba($color-primary-100, 0.1);
      border-radius: 12px;

      .status-icon {
        width: 16px;
        height: 16px;
        color: $color-primary-100;
      }

      .status-text {
        color: $color-primary-100;
      }
    }
  }

  .expanded-content {
    padding: 20px 24px 24px;
    background: $color-primary-5;
    margin: 0 12px;
    border-radius: 0 0 8px 8px;

    .warning {
      background-color: $color-alert-tint;
      color: $color-alert;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px 20px;
      width: 100%;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
      line-height: 1.4;
      font-size: 14px;
    }

    .sub-brokers {
      margin-top: 24px;
      background: $color-base-white-100;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba($color-primary-10, 0.4);

      .sub-brokers-title {
        margin-bottom: 16px;
        font-size: 16px;
        color: $color-primary-100;
      }

      ol {
        list-style: none;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
        padding: 0;

        li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: $color-primary-5;
          border-radius: 6px;
          transition: transform 0.2s ease;
          font-size: 14px;

          &:hover {
            transform: translateY(-1px);
          }

          .list-rank {
            background-color: $color-primary-100;
            border-radius: 50%;
            color: $color-primary-1;
            height: 20px;
            width: 20px;
            flex-shrink: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
          }
        }
      }
    }

    .removal-instructions {
      margin-top: 24px;
      background: $color-base-white-100;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba($color-primary-10, 0.4);

      .instructions-title {
        margin-bottom: 16px;
        font-size: 16px;
        color: $color-primary-100;
      }

      .instructions {
        font-size: 14px;
        line-height: 1.5;
        color: $color-primary-70;
        width: 100%;
        border: none;
        background: $color-primary-5;
        padding: 12px;
        border-radius: 6px;
      }
    }

    .action-buttons {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .mark-done-button {
        min-width: 120px;
        padding: 10px 20px;
        font-size: 14px;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.02);
        }
      }
    }

    .support-link {
      margin-top: 24px;
      padding: 16px;
      background: $color-primary-10;
      border-radius: 8px;
      text-align: center;
      line-height: 1.4;
      font-size: 14px;

      .link-text {
        text-decoration: underline;
        cursor: pointer;
        color: $color-primary-100;
        font-weight: 600;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
