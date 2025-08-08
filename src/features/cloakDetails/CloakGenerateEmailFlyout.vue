<script setup>
import RadioButton from "@/features/RadioButton.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import { reactive } from "vue";
import store from "@/store";

const props = defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "generate"]);

const state = reactive({
  emailType: store.state.profile.email_type,
});

function onChangeInput(selected) {
  state.emailType = selected;
}
</script>

<template>
  <UiMenu
    :value="props.visible"
    width="250px"
    placement="left-start"
    class="cloak-generate-email-flyout"
    @close="emit('close')"
  >
    <template #content>
      <UiMenuButton
        title="Professional"
        subtitle="(ie. yourusername@cloak.id)"
        :rtl="false"
        :active="state.emailType === 'professional'"
        @click="onChangeInput('professional')"
      >
        <template #icon>
          <RadioButton
            name="email_type"
            value="professional"
            :checked="state.emailType === 'professional'"
            @update="onChangeInput"
          />
        </template>
      </UiMenuButton>

      <UiMenuButton
        title="Random"
        subtitle="(ie. five.score.extra@cloaked.id)"
        :rtl="false"
        :active="email_type === 'random'"
        @click="onChangeInput('random')"
      >
        <template #icon>
          <RadioButton
            name="email_type"
            value="random"
            :checked="state.emailType === 'random'"
            @update="onChangeInput"
          />
        </template>
      </UiMenuButton>

      <UiMenuSeparator />

      <UiMenuButton
        title="Generate New Email Address"
        active
        @click="emit('generate', email_type)"
      >
        <template #icon>
          <InlineSvg name="generate" />
        </template>
      </UiMenuButton>
    </template>
  </UiMenu>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.cloak-generate-email-flyout {
  position: absolute;
  inset: 0;

  .popper__activator {
    position: absolute;
    inset: 0;
    cursor: pointer;
  }
}
</style>
