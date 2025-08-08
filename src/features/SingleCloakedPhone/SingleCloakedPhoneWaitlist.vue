<script setup>
import { onMounted, computed, ref } from "vue";
import store from "@/store";
import WaitlistServices from "@/api/actions/waitlist-service";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import BaseButton from "@/library/BaseButton.vue";

onMounted(() => {
  WaitlistServices.getWaitlist();
});

const joinButtonClicked = ref(false);

const loading = ref(false);

const buttonText = computed(() => {
  if (joinButtonClicked.value) {
    return "Joined";
  }

  return "Join Waitlist";
});

const description = computed(() => {
  if (joinButtonClicked.value) {
    return "We'll notify you when the Cloaked Phone Number is ready. You'll be able to use it immediately.";
  }

  return "Keep scammers away forever, get a Cloaked phone number to protect your real one.";
});

const oneRingWaitlistActive = computed(
  () => store.getters.oneRingWaitlistActive
);

const oneRingWaitlist = computed(() => {
  const waitlist = store.state.waitlist?.waitlist || [];
  return waitlist.find((item) => item.internal_name === "one_ring") || {};
});

const handleJoinWaitlist = () => {
  loading.value = true;
  WaitlistServices.joinWaitlist({ waitlist_id: oneRingWaitlist.value.id })
    .then(() => {
      joinButtonClicked.value = true;
      setTimeout(() => {
        loading.value = false;
      }, 1000);
    })
    .catch(() => {
      loading.value = false;
    });
};
</script>

<template>
  <BaseSheet
    v-if="
      oneRingWaitlistActive && (!oneRingWaitlist.joined_at || joinButtonClicked)
    "
    class="cloaked-phone-waitlist"
  >
    <div class="cloaked-phone-waitlist__header">
      <BaseIcon
        name="phone"
        class="cloaked-phone-waitlist__header-icon"
      />
      <BaseProgressTag
        color="cloaked"
        class="cloaked-phone-waitlist__header-progress-tag"
      >
        Coming Soon
      </BaseProgressTag>
      <BaseText
        variant="headline-4-medium"
        as="h4"
        class="cloaked-phone-waitlist__header-title"
      >
        Cloaked Phone Number
      </BaseText>
    </div>

    <BaseText
      variant="body-small-medium"
      as="p"
      class="cloaked-phone-waitlist__description"
    >
      {{ description }}
    </BaseText>

    <BaseButton
      :icon="joinButtonClicked ? 'check' : 'arrow-right'"
      fullWidth
      class="cloaked-phone-waitlist__button"
      :disabled="joinButtonClicked || loading"
      :loading="loading"
      @click="handleJoinWaitlist"
    >
      {{ buttonText }}
    </BaseButton>
  </BaseSheet>
</template>

<style lang="scss" scoped>
.cloaked-phone-waitlist {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    align-content: center;

    &-icon {
      font-size: 22px;
    }

    &-title {
      display: block;
      width: 100%;
      margin-top: 8px;
    }
  }

  &__description {
    margin-top: 16px;
  }

  &__button {
    margin-top: 16px;
  }
}
</style>
