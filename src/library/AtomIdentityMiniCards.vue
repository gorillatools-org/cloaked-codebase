<script setup>
/* eslint-disable import/no-restricted-paths */
import { inbox as inboxScripts } from "@/scripts/inbox";
import { phone_format } from "@/scripts/format";
import { getFormattedNickname } from "@/scripts/formattedText";
import { posthogCapture } from "@/scripts/posthog.js";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import store from "@/store";
/* eslint-enable import/no-restricted-paths */
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  identities: {
    type: Array,
    default: () => [],
  },
  posthogEvent: {
    type: String,
    default: "",
  },
  /*
  Currently handles nickname, updated_at, cloaked_phone, cloaked_email
  Otherwise just shows the identity top-level field value
  */
  previewFields: {
    type: Array,
    default: () => [],
  },
  /* previewFieldsColors- Pass in a dictionary of which field
  should be what color, or don't pass one
  in if you want the default color
  ie {cloaked_phone: 'red'}
  */
  previewFieldsColors: {
    type: Object,
    default: () => {},
  },
  maxWidth: {
    type: String,
    default: "",
  },
});
function timestamp(updatedAt) {
  return inboxScripts.getTimeDisplayInboxList(updatedAt);
}
function openCloakDetails(cloak) {
  store.dispatch("openCloakDetails", { cloak });
  if (props.posthogEvent) {
    posthogCapture(props.posthogEvent, {
      name: cloak.nickname,
    });
  }
}
</script>
<template>
  <div
    class="identities"
    :style="props.maxWidth ? `max-width: ${props.maxWidth}` : ''"
  >
    <div
      v-for="(identity, id_index) in identities"
      :key="`${identity.id}-${id_index}`"
      class="identity"
      @click="openCloakDetails(identity)"
    >
      <IdentityIcon
        :identity="identity"
        :override="{ width: '61px', height: '61px', 'align-self': 'center' }"
      />
      <div class="identity-bottom">
        <div
          v-for="(field, i) in previewFields"
          :key="`${field}-${i}-${identity.id}`"
        >
          <BaseText
            v-if="field === 'nickname'"
            as="div"
            variant="body-3-semibold"
            class="identity__nickname"
            :style="
              props.previewFieldsColors?.[field]
                ? `color: ${props.previewFieldsColors[field]}`
                : ''
            "
          >
            {{ getFormattedNickname(identity) }}
          </BaseText>
          <BaseText
            v-else-if="field === 'updated_at'"
            as="div"
            variant="caption-semibold"
            class="identity__field"
            :style="
              props.previewFieldsColors?.[field]
                ? `color: ${props.previewFieldsColors[field]}`
                : ''
            "
          >
            {{ timestamp(identity.updated_at) }}
          </BaseText>
          <BaseText
            v-else-if="
              field === 'cloaked_phone' && identity[field]?.phone_number
            "
            class="identity__field"
            as="div"
            variant="caption-semibold"
            :style="
              props.previewFieldsColors?.[field]
                ? `color: ${props.previewFieldsColors[field]}`
                : ''
            "
          >
            {{ phone_format(identity[field].phone_number) }}
          </BaseText>
          <BaseText
            v-else-if="field === 'cloaked_email' && identity[field]?.email"
            class="identity__field"
            as="div"
            variant="caption-semibold"
            :style="
              props.previewFieldsColors?.[field]
                ? `color: ${props.previewFieldsColors[field]}`
                : ''
            "
          >
            {{ identity[field]?.email }}
          </BaseText>
          <BaseText
            v-else-if="identity[field] && typeof identity[field] === 'string'"
            class="identity__field"
            as="div"
            variant="caption-semibold"
            :style="
              props.previewFieldsColors?.[field]
                ? `color: ${props.previewFieldsColors[field]}`
                : ''
            "
          >
            {{ identity[field] }}
          </BaseText>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.identities {
  gap: 8px;
  color: $color-primary-100;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));

  .identity {
    cursor: pointer;
    width: 100%;
    height: 158px;
    padding: 20px 10px;
    border-radius: 17px;
    border: 1px solid $color-primary-10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    line-height: normal;
    font-style: normal;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

    &:hover {
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      background-color: $color-primary-5;
    }

    &__nickname {
      margin-top: 10px;
      width: 100%;

      @include line-clamp(1);

      text-overflow: ellipsis;
    }

    &__field {
      margin-top: 1px;
    }
  }
}
</style>
