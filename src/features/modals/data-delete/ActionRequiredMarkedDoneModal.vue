<script setup>
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseButton from "@/library/BaseButton.vue";
import store from "@/store";
function closeModal() {
  store.dispatch("closeModal");
}

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["done", "review"]);

function markDone() {
  emit("done");
  closeModal();
}
function openReview() {
  emit("review");
  closeModal();
}
</script>

<template>
  <ModalTemplate
    class="recovery-modal"
    :show="true"
    :width="707"
    @close="closeModal"
  >
    <template #header>
      <h1 class="title">Mark as done</h1>
    </template>
    <template #body>
      <p class="paragraph">
        {{
          `Before marking this item as done, be sure you have completed all of the steps to remove your data from ${props?.name}`
        }}
      </p>
    </template>
    <template #footer>
      <div class="footer">
        <BaseButton
          variant="primary"
          size="lg"
          class="button"
          @click="markDone"
        >
          I've completed the instructions
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="lg"
          class="button"
          @click="openReview"
        >
          Review instructions
        </BaseButton>
      </div>
    </template>
  </ModalTemplate>
</template>
<style scoped lang="scss">
.title {
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  color: $color-primary-100;
}

.paragraph {
  font-size: 15px !important;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: $color-primary-100;

  &:not(:first-child) {
    margin-top: 16px;
  }
}

.link {
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  text-decoration-line: underline;
  color: $color-primary-100;
}

.footer {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  .button {
    width: 100%;
  }
}
</style>
