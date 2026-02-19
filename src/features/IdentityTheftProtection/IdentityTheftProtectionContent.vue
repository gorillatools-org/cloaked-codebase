<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { useIdentityTheftProtection } from "@/composables/useIdentityTheftProtection";

defineProps({
  largePadding: {
    type: Boolean,
    default: false,
  },
});

const { phoneNumber } = useIdentityTheftProtection();

const scrollContainer = ref(null);
const scrollContent = ref(null);
let isDown = false;
let startX;
let startTranslateX;
const translateX = ref(0);

const getScrollBounds = () => {
  if (!scrollContainer.value || !scrollContent.value) return { min: 0, max: 0 };

  const containerWidth = scrollContainer.value.offsetWidth;
  const contentWidth = scrollContent.value.scrollWidth;
  const maxScroll = containerWidth - contentWidth;

  return {
    min: maxScroll,
    max: 0,
  };
};

const handleMouseDown = (e) => {
  isDown = true;
  scrollContainer.value.classList.add(
    "identity-theft-protection-content__scroll-container--active"
  );
  startX = e.pageX;
  startTranslateX = translateX.value;
  e.preventDefault();
};

const handleMouseLeave = () => {
  isDown = false;
  scrollContainer.value.classList.remove(
    "identity-theft-protection-content__scroll-container--active"
  );
};

const handleMouseUp = () => {
  isDown = false;
  scrollContainer.value.classList.remove(
    "identity-theft-protection-content__scroll-container--active"
  );
};

const handleMouseMove = (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX;
  const delta = x - startX;
  const newTranslateX = startTranslateX + delta;
  const { min, max } = getScrollBounds();

  // Clamp the value between min and max
  translateX.value = Math.min(Math.max(newTranslateX, min), max);
};

const handleResize = () => {
  const { min, max } = getScrollBounds();
  translateX.value = Math.min(Math.max(translateX.value, min), max);
};

onMounted(() => {
  const container = scrollContainer.value;
  container.addEventListener("mousedown", handleMouseDown);
  container.addEventListener("mouseleave", handleMouseLeave);
  container.addEventListener("mouseup", handleMouseUp);
  container.addEventListener("mousemove", handleMouseMove);

  // Add resize listener to update bounds
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  const container = scrollContainer.value;
  if (container) {
    container.removeEventListener("mousedown", handleMouseDown);
    container.removeEventListener("mouseleave", handleMouseLeave);
    container.removeEventListener("mouseup", handleMouseUp);
    container.removeEventListener("mousemove", handleMouseMove);
  }
  window.removeEventListener("resize", handleResize);
});

const items = ref([
  {
    id: 1,
    icon: "shield-tick",
    label: "Identity Theft Insurance",
  },
  {
    id: 2,
    icon: "money",
    label: "Financial Coverage",
  },
  {
    id: 3,
    icon: "user-tick",
    label: "Identity Restoration",
  },
  {
    id: 4,
    icon: "shield-user",
    label: "CyberSecurity Protection",
  },
  {
    id: 5,
    icon: "text",
    label: "Unlimited Support",
  },
]);

const openLink = () => {
  window.open("https://help.cloaked.app/hc/en-us", "_blank");
  posthogCapture("dashboard_id_theft_get_support");
};
</script>

<template>
  <div
    class="identity-theft-protection-content"
    :class="{
      'identity-theft-protection-content--large-padding': largePadding,
    }"
  >
    <div
      ref="scrollContainer"
      class="identity-theft-protection-content__scroll-container"
    >
      <div
        ref="scrollContent"
        class="identity-theft-protection-content__scroll-content"
        :style="{ transform: `translateX(${translateX}px)` }"
      >
        <BaseSheet
          v-for="item in items"
          :key="item.id"
          class="identity-theft-protection-content__item"
        >
          <BaseIcon
            :name="item.icon"
            class="identity-theft-protection-content__item-icon"
          />
          <BaseText
            variant="body-small-medium"
            as="p"
            class="identity-theft-protection-content__item-label"
          >
            {{ item.label }}
          </BaseText>
        </BaseSheet>
      </div>
    </div>

    <BaseButton
      full-width
      icon="new-tab"
      class="identity-theft-protection-content__button"
      :size="largePadding ? 'lg' : 'md'"
      @click="openLink"
    >
      Get support
    </BaseButton>

    <BaseText
      variant="caption-semibold"
      as="div"
      class="identity-theft-protection-content__caption"
    >
      To file a claim, call
      <strong>{{ phoneNumber }}</strong>
    </BaseText>
  </div>
</template>

<style lang="scss" scoped>
.identity-theft-protection-content {
  padding: 0 20px;
  overflow: hidden;
  width: calc(100% + 40px);
  transform: translateX(-20px);

  &--large-padding {
    padding: 0 36px;
    width: calc(100% + 72px);
    transform: translateX(-36px);
  }

  &__scroll-container {
    width: 100%;
    cursor: grab;
    user-select: none;

    &--active {
      cursor: grabbing;
    }
  }

  &__scroll-content {
    display: flex;
    gap: 8px;
    padding: 8px 0;
    will-change: transform;
    transition: transform 0.1s ease;
  }

  &__item {
    min-width: 130px;
    max-width: 130px;
    display: flex;
    flex-direction: column;
    color: $color-primary-100;
    flex-shrink: 0;

    &-icon {
      font-weight: 500;
      font-size: 24px;
    }

    &-label {
      font-weight: 600;
      margin-top: 16px;
    }
  }

  &__button {
    margin-top: 16px;
  }

  &__caption {
    margin-top: 16px;
    text-align: center;
  }
}
</style>
