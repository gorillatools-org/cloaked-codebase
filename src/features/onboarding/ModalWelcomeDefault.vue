<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import UserService from "@/api/actions/user-service";
import { HAS_SEEN_PLANS_MODAL } from "@/scripts/userFlags";
import store from "@/store";
import { usePlans } from "@/features/subscribe/composables/usePlans.js";
import { computed, onMounted } from "vue";
import { toValue } from "@vueuse/core/index";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.js";
import { formattedPrice } from "@/features/subscribe/composables/utils.js";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({ value: { type: Boolean, default: false } });
defineEmits(["input", "subscribe"]);

onMounted(() => {
  store.dispatch("subscription/init");
});

const { isLoadingPlans, allPlans } = usePlans();

const annualPlan = computed(() =>
  toValue(allPlans).find(
    (plan) =>
      plan.provider === "stripe" &&
      plan.max_members === 1 &&
      plan.recurring_interval === "annually"
  )
);

const monthlyPlan = computed(() =>
  toValue(allPlans).find(
    (plan) =>
      plan.provider === "stripe" &&
      plan.max_members === 1 &&
      plan.recurring_interval === "monthly"
  )
);

const annualPlanPrice = usePlanPrice(annualPlan);
const monthlyPlanPrice = usePlanPrice(monthlyPlan);

const onClose = () => {
  UserService.setFlag({
    name: HAS_SEEN_PLANS_MODAL,
    value: true,
  });
};

const onSubscribe = () => {
  onClose();

  setTimeout(() => {
    store.dispatch("subscription/openSubscriptionModal");
  }, 150);
};
</script>

<template>
  <AppModal
    v-if="props.value"
    :has-outside-click-close="false"
  >
    <AppModalContent class="modal-welcome">
      <AppModalTitle size="lg">Welcome to Cloaked!</AppModalTitle>
      <AppModalParagraph>
        It's time to decentralize your data.
      </AppModalParagraph>
      <div class="modal-welcome__content">
        <slot name="cta">
          <div class="modal-welcome__cta">
            <div class="modal-welcome__pricing">
              <template v-if="isLoadingPlans">
                <span class="modal-welcome__pricing-monthly--skeleton" />
                <span class="modal-welcome__pricing-yearly--skeleton" />
              </template>
              <template v-else>
                <BaseText
                  variant="headline-3-bold"
                  class="modal-welcome__pricing-monthly"
                >
                  {{ formattedPrice(monthlyPlanPrice) }}/mo
                </BaseText>
                <BaseText
                  variant="body-small-medium"
                  class="modal-welcome__pricing-yearly"
                >
                  or {{ formattedPrice(annualPlanPrice) }}/year
                </BaseText>
              </template>
            </div>
            <button
              class="modal-welcome__cta-button"
              @click="onSubscribe()"
            >
              <BaseText variant="body-small-medium">Subscribe today</BaseText>
              <InlineSvg
                name="arrow-right"
                class="modal-welcome__arrow-icon"
              />
            </button>
          </div>
        </slot>
        <ul class="modal-welcome__list">
          <li class="modal-welcome__list-item">
            <InlineSvg
              name="checkmark"
              class="modal-welcome__checkmark-icon"
            />
            <BaseText variant="headline-6-medium">
              Ongoing data removal*
            </BaseText>
          </li>
          <li class="modal-welcome__list-item">
            <InlineSvg
              name="checkmark"
              class="modal-welcome__checkmark-icon"
            />
            <BaseText variant="headline-6-medium">
              $1M identity theft insurance*
            </BaseText>
          </li>
          <li class="modal-welcome__list-item">
            <InlineSvg
              name="checkmark"
              class="modal-welcome__checkmark-icon"
            />
            <BaseText variant="headline-6-medium">
              Unlimited phone numbers*
            </BaseText>
          </li>
          <li class="modal-welcome__list-item">
            <InlineSvg
              name="checkmark"
              class="modal-welcome__checkmark-icon"
            />
            <BaseText variant="headline-6-medium">
              Password breach detection
            </BaseText>
          </li>
          <li class="modal-welcome__list-item">
            <InlineSvg
              name="checkmark"
              class="modal-welcome__checkmark-icon"
            />
            <BaseText variant="headline-6-medium">Unlimited inboxes</BaseText>
          </li>
          <li class="modal-welcome__list-item">
            <InlineSvg
              name="checkmark"
              class="modal-welcome__checkmark-icon"
            />
            <BaseText variant="headline-6-medium">
              Unlimited encrypted calls, texts, and emails
            </BaseText>
          </li>
          <li class="modal-welcome__list-item">
            <InlineSvg
              name="checkmark"
              class="modal-welcome__checkmark-icon"
            />
            <BaseText variant="headline-6-medium">
              Complete password management
            </BaseText>
          </li>
          <li class="modal-welcome__list-item">
            <InlineSvg
              name="checkmark"
              class="modal-welcome__checkmark-icon"
            />
            <BaseText variant="headline-6-medium">
              Advanced communication settings
            </BaseText>
          </li>
        </ul>
      </div>
      <AppModalParagraph class="modal-welcome__note">
        <BaseText variant="body-small-medium">
          *During your trial, you won't have access to identity theft coverage,
          data deletion and monitoring, or more than 15 Cloaked phone numbers.
        </BaseText>
      </AppModalParagraph>
      <button
        class="modal-welcome__dismiss"
        @click="onClose"
      >
        Experience Cloaked free for 14 days
        <InlineSvg
          name="arrow-right"
          class="modal-welcome__arrow-icon"
        />
      </button>
    </AppModalContent>
  </AppModal>
</template>

<style lang="scss" scoped>
.modal-welcome {
  text-align: center;

  &__content {
    padding: 0 32px;
    margin-top: 24px;
  }

  &__pricing {
    display: flex;
    justify-content: center;
    align-items: flex-end;

    &-monthly {
      color: $color-primary-100;

      &--skeleton {
        height: 24px;
        width: 116px;
        border-radius: 16px;

        @at-root .theme-dark & {
          @include base-skeleton($color-primary-10);
        }

        @at-root .theme-light & {
          @include base-skeleton($color-primary-20);
        }
      }
    }

    &-yearly {
      color: $color-primary-100;
      text-align: right;
      margin-left: auto;

      &--skeleton {
        height: 12px;
        width: 76px;
        border-radius: 8px;
        margin-left: auto;

        @at-root .theme-dark & {
          @include base-skeleton($color-primary-10);
        }

        @at-root .theme-light & {
          @include base-skeleton($color-primary-20);
        }
      }
    }
  }

  &__list {
    margin-top: 14px;

    &-item {
      margin-top: 5px;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }

  &__checkmark-icon {
    width: 24px;
    height: 24px;
    padding: 4px;
  }

  &__cta {
    padding: 18px 20px;
    border-radius: 16px;
    border: 1px solid $color-primary-10;
    background: $color-primary-1;

    &-button {
      color: $color-primary-1-light;
      padding: 13px 20px;
      width: 100%;
      background: $cloaked-gradient;
      border: 0;
      border-radius: 100px;
      margin-top: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
  }

  &__dismiss {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    padding: 16px 20px;
    margin: 0 auto 16px;
    color: $color-primary-100;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  &__arrow-icon {
    transition: transform 100ms ease-out;

    @at-root .modal-welcome__cta-button:hover &,
      .modal-welcome__dismiss:hover & {
      transform: translateX(3px);
    }
  }

  &__note {
    color: $color-primary-70;
    margin: 16px 0;
  }
}
</style>
