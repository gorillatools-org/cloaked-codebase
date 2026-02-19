<script setup>
import moment from "moment/moment";

import { computed, onBeforeMount, onBeforeUnmount } from "vue";
import store from "@/store";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  recording: {
    type: Object,
    required: true,
  },
  idx: {
    type: Number,
    required: true,
  },
  inbound: {
    type: Boolean,
    required: true,
  },
});

const playing = computed(() => {
  return store.state.media.playing;
});

onBeforeMount(() => {
  store.dispatch("media/register", {
    recording: props.recording,
    id: `${props.idx}-vm`,
  });
});
onBeforeUnmount(() => {
  store.dispatch("media/unregister", {
    recording: props.recording,
    id: `${props.idx}-vm`,
  });
});

function durationDisplay(voicemail) {
  const duration = moment.duration(voicemail.duration);
  if (playing.value && playing.value.id === voicemail.id) {
    const played = store.state.media.progress;
    duration.subtract(played, "milliseconds");
  }
  const min = duration.minutes().toString().padStart(2, "0");
  const sec = duration.seconds().toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function pauseVoicemail(recording) {
  store.dispatch("media/playAudio", recording);
}

function playVoicemail(recording) {
  store.dispatch("media/playAudio", recording);
}

function isTruncated(idx) {
  const el = document.getElementById(`vm-body-${idx}`);
  if (!el) return false;
  return el.scrollHeight > el.clientHeight;
}

function expandTranscript(idx) {
  const el = document.getElementById(`vm-body-${idx}`);
  el?.classList?.remove("truncate");
}

function animationLengthSec(recording) {
  const duration = moment.duration(recording.duration);
  return duration.asSeconds();
}
</script>

<template>
  <div
    class="activity-call-display-voicemail"
    @click="expandTranscript(props.idx)"
  >
    <div class="vm-play">
      <button
        v-if="playing && playing.id === props.recording.id"
        class="playing"
        :class="{ inbound: props.inbound }"
        @click="pauseVoicemail(props.recording)"
      >
        <InlineSvg name="activity-pause-icon" />
      </button>
      <button
        v-else
        :class="{ inbound: props.inbound }"
        @click="playVoicemail(props.recording)"
      >
        <InlineSvg name="activity-play-black-circle" />
      </button>
      <div class="vm-line">
        <div
          :id="`vm-circle-${props.recording.id}`"
          class="vm-circle"
          :class="{ inbound: props.inbound }"
          :style="`animation-duration: ${animationLengthSec(props.recording)}s`"
        />
      </div>
      <BaseText
        variant="caption-semibold"
        as="div"
        class="vm-duration"
        :class="{ inbound: props.inbound }"
      >
        {{ durationDisplay(props.recording) }}
      </BaseText>
    </div>

    <BaseText
      v-if="props.recording.transcription_status === 'available'"
      variant="body-3-semibold"
      as="div"
      class="vm-title"
      :class="{ inbound: props.inbound }"
    >
      Transcription
      {{ !props.recording.transcription_text ? "unavailable" : "" }}
    </BaseText>
    <BaseText
      v-if="props.recording.transcription_status === 'available'"
      :id="`vm-body-${props.idx}`"
      variant="body-3-semibold"
      as="div"
      class="vm-body truncate"
      :class="{ inbound: props.inbound }"
    >
      {{ props.recording.transcription_text }}
    </BaseText>
    <BaseText
      v-if="
        props.recording.transcription_status === 'available' &&
        isTruncated(props.idx)
      "
      variant="caption-semibold"
      as="div"
      class="vm-read-more"
      :class="{ inbound: props.inbound }"
      @click="expandTranscript(props.idx)"
    >
      Read more
    </BaseText>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.activity-call-display-voicemail {
  cursor: pointer;
  margin: 0 24px;

  .vm-play {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: relative;
    gap: 10px;

    button {
      padding: 0;
      background-color: $color-primary-1;
      color: $color-primary-100;
      border: none;
      cursor: pointer;
      border-radius: 50%;
      height: 24px;
      width: 24px;
      align-items: center;
      justify-content: center;
      display: flex;

      &.inbound {
        background-color: $color-primary-100;
        color: $color-primary-1;
      }
    }

    .vm-duration {
      text-align: right;
      color: $color-primary-30;

      &.inbound {
        color: $color-primary-70;
      }
    }

    .vm-line {
      height: 2px;
      width: 100%;
      min-width: 125px;
      background-color: $color-primary-30;
      position: relative;
      border-radius: 999px;

      .vm-circle {
        width: 12px;
        height: 12px;
        background-color: $color-primary-1;
        position: absolute;
        top: -5px;
        left: 0;
        border-radius: 999px;
        animation: animate;
        animation-timing-function: linear;
        animation-play-state: paused;

        &.inbound {
          background-color: $color-primary-100;
        }

        &.playVoicemail {
          animation-play-state: running;
        }

        &.pauseVoicemail {
          animation-play-state: paused;
        }
      }
    }
  }

  .vm-title {
    color: $color-primary-1;
    margin-top: 8px;

    &.inbound {
      color: $color-primary-100;
    }
  }

  .vm-body {
    color: $color-primary-1;

    &.inbound {
      color: $color-primary-100;
    }

    &.truncate {
      @include line-clamp(3);
    }
  }

  .vm-read-more {
    margin-top: 22.5px;
    color: $color-primary-1;

    &.inbound {
      color: $color-primary-100;
    }
  }
}

@keyframes animate {
  0% {
    left: 0%;
  }

  100% {
    left: 100%;
  }
}
</style>
