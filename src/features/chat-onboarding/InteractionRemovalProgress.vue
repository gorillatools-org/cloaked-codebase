<script setup lang="ts">
import type { RemovalProgress } from "@/features/chat-onboarding/types.ts";
import {
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
} from "vue";
import BaseText from "@/library/BaseText.vue";
import LineProgress from "@/features/ui/LineProgress.vue";
import ChatBubble from "@/features/chat-onboarding/utils/ChatBubble.vue";
import { wait } from "@/features/chat-onboarding/utils.ts";
import { random } from "lodash-es";

type InteractionRemovalProgressProps = {
  interaction: RemovalProgress;
};

const props = defineProps<InteractionRemovalProgressProps>();
const emit = defineEmits(["complete", "resize"]);

const removalProgress = defineModel<number>("removalProgress", {
  required: true,
});

const initialRemovalProgress = ref(removalProgress.value);

const progress = ref(initialRemovalProgress.value);
const isSubmitted = ref(false);

onBeforeMount(() => emit("resize"));

onMounted(async () => {
  removalProgress.value = Math.max(
    removalProgress.value,
    props.interaction.progress
  );

  await wait(50);

  const finalProgress = removalProgress.value;

  while (progress.value < finalProgress) {
    const isEnding = progress.value / finalProgress >= 0.8;

    await wait(random(300, isEnding ? 500 : 400));
    const increment = isEnding ? Math.random() / 40 : Math.random() / 10;

    progress.value = Math.min(finalProgress, progress.value + increment);
  }

  await wait(600);
  isSubmitted.value = true;

  emit("complete", props.interaction);
});

const content = useTemplateRef("content");
const progressWidth = ref(0);

const onWindowResize = () => {
  progressWidth.value = content.value?.offsetWidth ?? 0;
};

onMounted(() => {
  window.addEventListener("resize", onWindowResize, { passive: true });
  onWindowResize();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
});
</script>

<template>
  <ChatBubble
    class="interaction-removal-progress"
    :class="{ 'interaction-removal-progress--done': isSubmitted }"
  >
    <div ref="content">
      <BaseText
        variant="body-3-regular"
        as="p"
      >
        {{ interaction.text }}
      </BaseText>
      <LineProgress
        v-if="initialRemovalProgress < 1"
        :width="progressWidth"
        :progress="progress"
        :height="16"
        class="interaction-removal-progress__progress"
      />
      <BaseText
        v-if="initialRemovalProgress < 1"
        variant="body-3-regular"
        as="p"
        class="interaction-removal-progress__requests"
      >
        <span v-if="isSubmitted">{{ interaction.removedText }}</span>
        <span v-else>{{ interaction.removingText }}</span>
        <span class="interaction-removal-progress__percentage">
          {{ Math.ceil(progress * 100) }}%
        </span>
      </BaseText>
    </div>
  </ChatBubble>
</template>

<style lang="scss" scoped>
.interaction-removal-progress {
  width: 100%;

  &__progress {
    margin-top: 10px;

    :deep(.progress-line__indicator) {
      stroke: $color-brand-300;

      @at-root .interaction-removal-progress--done & {
        stroke: $color-green-300;
      }
    }

    :deep(.progress-line__background) {
      stroke: $color-base-black-10;
    }
  }

  &__requests {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    color: $color-brand-300;

    @at-root .interaction-removal-progress--done & {
      color: $color-green-200;
    }
  }

  &__percentage {
    flex-shrink: 0;
    padding-left: 16px;
  }
}
</style>
