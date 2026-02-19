import moment from "moment";

let media;

const defaultState = () => ({
  playing: null,
  progress: 0,
  length: 0,
  key: null,
  register: {},
});

export default {
  namespaced: true,
  state: defaultState(),

  mutations: {
    reset(state) {
      Object.assign(state, defaultState());
    },
    setPlaying(state, { playing, type }) {
      state.playing = playing;
      state.type = type;
      const duration = moment.duration(playing.duration);
      state.length = duration.milliseconds();
    },
    clearPlay(state) {
      state.playing = null;
      state.type = null;
    },
    updateProgress(state, progress) {
      state.progress = progress;
    },
    mediaState(state, { recording, current }) {
      state.register[recording.id] = current;
    },
  },
  getters: {},
  actions: {
    reset({ commit }) {
      commit("reset");
    },
    register({ commit, state }, { recording, id }) {
      const update = Array.isArray(state.register[recording.id])
        ? [...state.register[recording.id], id]
        : [id];
      commit("mediaState", { recording, current: update });
    },
    unregister({ commit, state }, { recording, id }) {
      const update = state.register[recording.id].filter((i) => i !== id);
      commit("mediaState", { recording, current: update });
      if (update.length === 0) {
        if (state.playing && state.playing.id === recording.id) {
          media.pause();
          commit("clearPlay");
        }
      }
    },
    playAudio({ commit, state }, recording) {
      const isSame = state.playing && recording.id === state.playing.id;
      if (!media || !isSame) {
        if (media) {
          media.pause();
        }
        media = new Audio(recording.recording_url);
        media.addEventListener("canplay", () => {
          media.play();
        });
        media.addEventListener("play", () => {
          commit("setPlaying", { playing: recording, type: "audio" });
          const activeEl = document.getElementById(`vm-circle-${recording.id}`);
          if (activeEl) {
            activeEl.classList.add("playVoicemail");
            activeEl.classList.remove("pauseVoicemail");
          }
        });
        media.addEventListener("timeupdate", () => {
          commit("updateProgress", media.currentTime * 1000);
        });
        media.addEventListener("pause", () => {
          commit("clearPlay");
          const activeEl = document.getElementById(`vm-circle-${recording.id}`);
          if (activeEl) {
            activeEl.classList.remove("vm-circle");
            activeEl.classList.remove("playVoicemail");
            activeEl.classList.add("pauseVoicemail");
            setTimeout(() => {
              activeEl.classList.add("vm-circle");
            }, 50);
          }
        });
      } else {
        media.pause();
      }
    },
  },
};
