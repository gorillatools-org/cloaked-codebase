<script setup>
import { onMounted, reactive, computed, onBeforeUnmount } from "vue";
import inlineSvg from "@/features/InlineSvg.vue";
import BreachesService from "@/api/actions/breaches-service.js";
import IdentityService from "@/api/actions/identity-service.js";
import UiTooltip from "@/features/ui/ui-tooltip";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog.js";
import { timestamp } from "@/scripts/timestamp_format";
import { format } from "@/scripts/format";

const toast = useToast();

const state = reactive({
  breaches: {},
  usersPrimaryEmail: "",
  usersPrimaryPhone: "",
  maxDisplayCount: window.innerWidth > 1375 ? 10 : 5,
  showAll: false,
});

onMounted(() => {
  window.addEventListener("resize", onResize);
  BreachesService.getBreachesForPrimaryEmailPhone().then((response) => {
    const primaryEmailReport = response?.data?.primary_email_report;
    const primaryPhoneReport = response?.data?.primary_phone_report;
    if (primaryEmailReport) {
      const usersEmail = primaryEmailReport.personal_email?.email;
      state.usersPrimaryEmail = usersEmail;
      const emailBreachesThatAreNotDismissed = primaryEmailReport.items.filter(
        (item) => !item.dismissed
      );
      if (emailBreachesThatAreNotDismissed.length) {
        state.breaches[usersEmail] = emailBreachesThatAreNotDismissed;
      }
    }
    if (primaryPhoneReport) {
      const usersPhone = primaryPhoneReport.personal_phone?.phone;
      state.usersPrimaryPhone = usersPhone;
      const phoneBreachesThatAreNotDismissed = primaryPhoneReport.items.filter(
        (item) => !item.dismissed
      );
      if (phoneBreachesThatAreNotDismissed.length) {
        state.breaches[usersPhone] = phoneBreachesThatAreNotDismissed;
      }
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});

const displayCount = computed(() => {
  return state.showAll ? totalBreaches.value : state.maxDisplayCount;
});

const isVisible = computed(() => {
  const canCreateIdentities =
    store.getters["settings/isSubscribed"] || store.getters["settings/isTrial"];
  return (
    canCreateIdentities &&
    (state.breaches[state.usersPrimaryEmail]?.length ||
      state.breaches[state.usersPrimaryPhone]?.length)
  );
});

const totalBreaches = computed(() => {
  const emailBreachCount = state.breaches[state.usersPrimaryEmail]?.length;
  const phoneBreachCount = state.breaches[state.usersPrimaryPhone]?.length;
  return Math.max(emailBreachCount ?? 0, phoneBreachCount ?? 0);
});

function createCloak(breach, usersPhoneOrEmail) {
  posthogCapture("user_clicked_breachedidentitycreate", {
    breached_identity_name: breach.name,
    breached_identity_domain: breach.domain,
  });

  const payload = {
    app_ref: breach.name,
    nickname: breach.name,
    website_url: breach.domain
      ? new URL(format.standardizeUrl(breach.domain))
      : undefined,
    category: "website",
  };

  state.breaches = {
    ...state.breaches,
    [usersPhoneOrEmail]: state.breaches[usersPhoneOrEmail].filter(
      (item) => item.id !== breach.id
    ),
  };

  IdentityService.createIdentity(payload)
    .then(({ data }) => {
      openCloakDetails(data);
      return dismiss(breach, usersPhoneOrEmail, false);
    })
    .catch(() => {
      state.breaches = {
        ...state.breaches,
        [usersPhoneOrEmail]: [...state.breaches[usersPhoneOrEmail], breach],
      };
      toast.error("Something went wrong, please try again.");
    });
}

function openCloakDetails(newCloak) {
  store.dispatch("openCloakDetails", { cloak: newCloak });
  store.dispatch("updateCloaks", [newCloak]);
  const newEvent = new CustomEvent("cloak:created");
  newEvent.data = newCloak;
  window.dispatchEvent(newEvent);
}

function dismiss(breach, usersPhoneOrEmail, showToast = true) {
  return BreachesService.dismissBreach(breach.id)
    .then(() => {
      if (showToast) {
        posthogCapture("user_dismissed_singlebreach", {
          breached_identity_name: breach.name,
          breached_identity_domain: breach.domain,
        });
        toast.success(`${breach.name} breach notification dismissed`);
      }
      state.breaches = {
        ...state.breaches,
        [usersPhoneOrEmail]: state.breaches[usersPhoneOrEmail].filter(
          (item) => item.id !== breach.id
        ),
      };
    })
    .catch(() => {
      if (showToast) {
        toast.error("Failed to dismiss breach notification");
      }
    });
}

function onResize() {
  state.maxDisplayCount = window.innerWidth > 1375 ? 10 : 5;
}

function showAll(shouldShowAll) {
  state.showAll = shouldShowAll;
}

function dismissAll() {
  posthogCapture("user_dismissed_allbreaches");
  Object.keys(state.breaches).forEach((usersPhoneOrEmail) => {
    Promise.allSettled(
      state.breaches[usersPhoneOrEmail].map((breach) => {
        return dismiss(breach, usersPhoneOrEmail, false);
      })
    )
      .then(() => {
        toast.success("All breach notifications dismissed");
        state.breaches = {};
      })
      .catch(() => {
        toast.error("Failed to dismiss all breach notifications");
      });
  });
}
</script>

<template>
  <div
    v-if="isVisible"
    class="breaches-alert"
  >
    <div class="breaches-alert__row">
      <h1 class="title">Data breaches</h1>
      <div class="breaches-alert__buttons">
        <div
          v-if="totalBreaches > displayCount"
          class="breaches-alert__start"
          type="secondary"
          @click="showAll(true)"
        >
          {{ "Show All" }}
        </div>
        <div
          v-else-if="totalBreaches > state.maxDisplayCount"
          class="breaches-alert__start"
          type="secondary"
          @click="showAll(false)"
        >
          {{ "Show Less" }}
        </div>
        <div
          v-if="
            totalBreaches > displayCount ||
            totalBreaches > state.maxDisplayCount
          "
          class="separator"
        />
        <div
          class="breaches-alert__start"
          type="primary"
          @click="dismissAll"
        >
          Dismiss All
        </div>
      </div>
    </div>
    <div class="breaches-alert__row">
      <div
        v-for="(usersPhoneOrEmail, index) in Object.keys(state.breaches)"
        :key="`breaches-${index}`"
        class="breaches-alert__content"
      >
        <h2 class="breaches-alert__title">
          <strong>
            We found {{ usersPhoneOrEmail }} in
            {{ state.breaches[usersPhoneOrEmail].length }} data breaches
          </strong>
        </h2>
        <h2 class="breaches-alert__title">
          Click
          <inlineSvg name="add-currentColor" />
          to replace breached credentials with a new Cloak Identity
        </h2>
        <div class="breaches-alert__breach-section">
          <div
            v-for="(breach, idx) in state.breaches[usersPhoneOrEmail].slice(
              0,
              displayCount
            )"
            :key="`${breach.name}-${idx}`"
            class="breaches-alert__subtitle-wrapper"
          >
            <div class="flex-start">
              <span class="breaches-alert__subtitle-icon-plus">
                <UiTooltip
                  align-x="center"
                  :title="`Create &quot;${breach.domain}&quot; identity`"
                  position="bottom"
                  class="tooltip-wrapper"
                  @click="createCloak(breach, usersPhoneOrEmail)"
                >
                  <inlineSvg name="add-currentColor" />
                </UiTooltip>
              </span>
              <span class="breaches-alert__subtitle">
                <strong>{{ breach.name }}</strong>
                account was compromised on
                {{ timestamp.formatAbbreviatedDayDateTime(breach.breach_date) }}
              </span>
            </div>

            <span class="breaches-alert__subtitle-icon-close">
              <UiTooltip
                align-x="center"
                title="Dismiss notification"
                position="bottom"
                class="tooltip-wrapper"
                @click="dismiss(breach, usersPhoneOrEmail)"
              >
                <inlineSvg name="close" />
              </UiTooltip>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.breaches-alert {
  background-color: $color-primary-5;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 24px;
  margin-top: 16px;

  &__row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
  }

  &__icon {
    width: 45px;
    height: 45px;
    color: $color-primary-100;

    > path {
      color: $color-primary-1;
    }
  }

  &__content {
    text-align: left;
  }

  &__title {
    font-weight: 400;
    font-size: 15px;
    line-height: 21px;
    color: $color-primary-100;
    text-align: left;

    &:first-of-type {
      margin-top: 12px;
    }
  }

  &__subtitle {
    font-size: 13px;
    text-align: left;
    color: $color-primary-100;
    width: 100%;
  }

  &__breach-section {
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: minmax(45px, auto);
    gap: 10px 16px;

    @media all and (width <= 1375px) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__subtitle-wrapper {
    display: flex;
    padding: 10px 16px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: $color-primary-1;
    border: 1px solid $color-primary-10;
    border-radius: 8px;
    font-size: 13px;
    max-width: 475px;

    .flex-start {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
    }
  }

  &__subtitle-icon-plus {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    margin-right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $color-primary-10;
    color: $color-primary-100;
    cursor: pointer;

    .tooltip-wrapper {
      > svg {
        width: 11px;
      }
    }
  }

  &__subtitle-icon-close {
    height: 25px;
    width: 25px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    color: $color-primary-100;
    cursor: pointer;

    .tooltip-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;

      > svg {
        color: $color-primary-100;
        width: 9px;
      }
    }
  }

  &__buttons {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-end;

    // width of icon + margin
    gap: 8px;
  }

  &__start {
    // padding: 11px 16px;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-100;
    background-color: transparent;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &__close {
    height: 30px;
    width: 30px;
    border-radius: 50%;
    margin-left: 8px;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary-100;

    &:hover {
      background-color: $color-primary-10;
    }
  }
}

.separator {
  width: 1px;
  height: 24px;
  background-color: $color-primary-10;
}

.title {
  color: $color-primary-100;
  font-size: 18px;
  font-weight: 600;
  flex-grow: 1;
}
</style>
