import { defineStore } from "pinia";
import UserService from "@/api/actions/user-service.js";
import { UI_NAVIGATION_COLLAPSED } from "@/scripts/userFlags.ts";

export const useNavigationStore = defineStore("navigation", {
  state: () => ({
    collapse: false,
  }),

  actions: {
    toggleCollapse() {
      this.collapse = !this.collapse;
      this.saveCollapseState();
    },

    setCollapse(value) {
      this.collapse = value;
    },

    async saveCollapseState() {
      try {
        await UserService.setFlag({
          name: UI_NAVIGATION_COLLAPSED,
          value: this.collapse,
        });
      } catch (error) {
        console.error("Error saving navigation state:", error);
      }
    },

    async loadCollapseState(flags) {
      const navigationState = flags?.onboarding_meta?.[UI_NAVIGATION_COLLAPSED];
      if (navigationState !== undefined) {
        if (typeof navigationState === "string") {
          this.collapse = navigationState === "closed";
        } else {
          this.collapse = Boolean(navigationState);
        }
      }
    },
  },
});
