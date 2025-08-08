import ConfirmContact from "@/features/ui/confirm-contact";
import store from "@/store";
import { markRaw } from "vue";

export const confirm_contact = ({ type, contact, callback, id, cancel }) => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(ConfirmContact),
      params: {
        confirm: callback,
        cancel: () => {
          if (cancel) {
            cancel();
          }
          store.commit("closeModal");
        },
        id,
        type,
        contact,
      },
    },
  });
};
