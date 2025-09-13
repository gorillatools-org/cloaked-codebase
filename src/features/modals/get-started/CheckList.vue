<template>
  <div class="checklist-container">
    <div
      v-for="item of checklist"
      :key="item.id"
      :class="`checklist-item ${item.status} ${type}-${item.status}  ${
        item.link_title ? 'link' : 'no-link'
      }`"
    >
      <div
        class="checkmark"
        @click="() => updateStatus(item)"
      >
        <inlineSvg
          v-if="item.status === 'completed'"
          name="check"
          class="check"
        />
      </div>
      <p
        :class="`description ${item.status} ${
          item.link_title ? 'link' : 'no-link'
        }`"
      >
        {{ item.title }}
      </p>
      <InputSpinner
        v-if="state.loading && state.updateId === item.id"
        class="loader"
      />
      <div
        v-if="!state.loading"
        :class="`checklist-buttons ${item.status} ${
          item.link_title ? 'link' : 'no-link'
        }`"
      >
        <a
          v-if="
            item.link_title &&
            item.status !== 'hidden' &&
            item.link_url.includes('http')
          "
          :href="item.link_url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ item.link_title }}
        </a>
        <div
          v-if="
            item.link_title &&
            item.status !== 'hidden' &&
            !item.link_url.includes('http')
          "
          @click="(event) => closeModal(event, item.link_url)"
        >
          {{ item.link_title }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, reactive } from "vue";
import inlineSvg from "@/features/InlineSvg";
import InputSpinner from "@/features/InputSpinner";
import store from "@/store";
import UserService from "@/api/actions/user-service";
import router from "@/routes/router";
const props = defineProps({
  type: {
    validator: (prop) =>
      ["power-up", "strong", "security", "skipped", ""].includes(prop),
    default: "",
  },
});
const emit = defineEmits("updated");
const typeToStoreGetters = {
  strong: "getStarted/getCloakSetupList",
  "power-up": "getStarted/getOnlinePrivacyList",
  security: "getStarted/getSecuredInformation",
};

const state = reactive({
  loading: false,
  updateId: "",
});
const checklist = computed(
  () => store.getters[typeToStoreGetters[props.type]]?.tasks
);

async function updateStatus({ id, status }) {
  if (status !== "pending") return;
  state.loading = true;
  state.updateId = id;
  try {
    await UserService.updateAndFetchGetStartedChecklist({
      id,
      status: "completed",
    });
    emit("updated");
  } catch (e) {
    console.error(e);
  } finally {
    state.loading = false;
  }
}

function closeModal(event, partialUrl) {
  event.preventDefault();
  router.push({ path: `/${partialUrl}` });
  store.dispatch("getStarted/openGetStarted", false);
}
</script>
<style lang="scss" scoped>
/* stylelint-disable */
.checklist-container {
  .checklist-item {
    display: flex;
    align-items: center;
    padding: 6px;
    border-radius: 8px;
    margin: 6px 0;
    position: relative;

    &:hover {
      background: $color-primary-10;
    }

    &:not(
        &.no-link,
        &.power-up-completed,
        &.strong-completed,
        &.security-completed
      ) {
      .description {
        min-width: 200px;
      }

      .checklist-buttons {
        display: flex;
      }
    }

    .checklist-buttons {
      display: none;
      width: 120px;
      margin-left: 12px;
      justify-content: flex-end !important;

      a {
        font-size: 12px;
        text-decoration: underline;
        color: $color-primary-100;
        cursor: pointer;
      }

      div {
        font-size: 12px;
        text-decoration: underline;
        color: $color-primary-100;
        cursor: pointer;
      }
    }

    .checkmark {
      border: 2px solid $color-primary-100;
      min-width: 18px;
      height: 18px;
      border-radius: 50%;
      background: transparent;
      cursor: pointer;
      margin-right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      .check {
        width: 10px;
        color: $white;
      }
    }

    .description {
      color: $color-primary-100;
      font-size: 12px;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .loader {
      margin-left: auto;
    }

    &.hidden {
      .checkmark {
        background: $color-primary-30;
        border-color: $color-primary-30;
      }

      .description {
        color: $color-primary-30;
        font-style: italic;
      }
    }

    &.power-up-completed {
      pointer-events: none;

      .checkmark {
        background: $color-brand-3-100-light;
        border-color: $color-brand-3-100-light;
      }

      .description {
        color: $color-brand-3-100-light;
      }
    }

    &.security-completed {
      pointer-events: none;

      .checkmark {
        background: $color-brand-6-100-light;
        border-color: $color-brand-6-100-light;
      }

      .description {
        color: $color-brand-6-100-light;
      }
    }

    &.strong-completed {
      pointer-events: none;

      .checkmark {
        background: $color-brand-5-100-light;
        border-color: $color-brand-5-100-light;
      }

      .description {
        color: $color-brand-5-100-light;
      }
    }
  }
}
</style>
