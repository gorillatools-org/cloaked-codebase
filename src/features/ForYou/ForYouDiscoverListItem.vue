<script setup>
import { markRaw, ref, computed } from "vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import IdentityTheftProtectionModal from "@/features/IdentityTheftProtection/IdentityTheftProtectionModal.vue";
import { useRouter } from "vue-router";
import store from "@/store";

const router = useRouter();
const identityTheftProtectionModal = ref(false);

const props = defineProps({
  feature: {
    type: Object,
    required: true,
  },
});

const iconMapping = {
  vpn: "website",
  id_monitoring: "search-user",
  heimdall: "phone-shield",
  id_theft: "shield-tick",
};

const progressMapping = {
  vpn: "For Your Privacy",
  id_monitoring: "For Your Safety",
  heimdall: "For Tackling Spam",
  id_theft: "Securing Your Identity",
};

const colorMapping = {
  vpn: "safe-zone-blue",
  id_monitoring: "safe-zone-green",
  heimdall: "spam-protection",
  id_theft: "safe-zone-blue",
};

const icon = computed(() => {
  return iconMapping[props.feature.internal_name] || "cloaked-logo-outline";
});

const progress = computed(() => {
  return progressMapping[props.feature.internal_name] || null;
});

const color = computed(() => {
  return colorMapping[props.feature.internal_name] || "safe-zone-blue";
});

const handleClick = () => {
  // Check if this is the identity theft protection feature
  if (props.feature.internal_name === "id_theft") {
    openIdentityTheftProtectionModal();
  } else {
    router.push(`/for-you/feature/${props.feature.id}`);
  }
};

const openIdentityTheftProtectionModal = () => {
  identityTheftProtectionModal.value = true;

  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(IdentityTheftProtectionModal),
      props: {
        show: true,
      },
      events: {
        close: () => {
          identityTheftProtectionModal.value = false;
          store.dispatch("closeModal");
        },
      },
    },
  });
};
</script>

<template>
  <div class="for-you-discover-list-item">
    <div class="for-you-discover-list-item__hero">
      <div
        class="for-you-discover-list-item__hero-background"
        :style="{ backgroundColor: feature.style.primaryColor }"
      ></div>

      <img
        :src="feature.images.web.header"
        alt="Feature hero"
        class="for-you-discover-list-item__hero-image"
      />
    </div>

    <div class="for-you-discover-list-item__content">
      <div class="for-you-discover-list-item__content-title">
        <BaseMedallion
          :icon="icon"
          :color="color"
          class="for-you-discover-list-item__content-title-icon"
        />

        <BaseProgressTag
          v-if="progress"
          :color="color"
          class="for-you-discover-list-item__content-title-progress-tag"
        >
          {{ progress }}
        </BaseProgressTag>

        <BaseText
          variant="headline-4-bold"
          class="for-you-discover-list-item__content-title-text"
        >
          {{ feature.title }}
        </BaseText>
      </div>

      <BaseText
        variant="body-3-regular"
        class="for-you-discover-list-item__content-summary"
      >
        {{ feature.summary }}
      </BaseText>

      <BaseButton
        class="for-you-discover-list-item__content-button"
        full-width
        @click="handleClick"
      >
        {{ feature.style.primaryCTA }}
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.for-you-discover-list-item {
  background-color: $color-base-white-100;
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid $color-primary-10;

  &__hero {
    width: 100%;
    height: 207px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;

    &-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.15;
      z-index: 1;
    }

    &-image {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 2;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 16px;
    flex-grow: 1;
    width: 100%;

    &-title {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      &-text {
        width: 100%;
      }
    }

    &-button {
      margin-top: auto;
    }
  }
}
</style>
