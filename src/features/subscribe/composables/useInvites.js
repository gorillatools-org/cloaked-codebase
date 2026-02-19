import { computed, ref, watch } from "vue";
import { toValue } from "@vueuse/core";
import { useToast } from "@/composables/useToast.js";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import store from "@/store";

const isSendingInvite = ref(false);
const isCancellingInvite = ref(false);
const cancellingInviteId = ref(null);
const isRemovingMember = ref(false);

const { success, error } = useToast();

const { activePlan } = usePlans();

export const useInvites = () => {
  const planMembers = computed(
    () => store.getters["subscription/getInvitations"]
  );

  const freeSpots = computed(() =>
    Math.max(toValue(activePlan)?.max_members - planMembers.value.length - 1, 0)
  );

  watch(
    () => activePlan?.value,
    (newValue, oldValue) => {
      if (newValue?.product_id !== oldValue?.product_id) {
        store.dispatch("subscription/fetchInvitations");
      }
    }
  );

  const inviteMember = async (email) => {
    isSendingInvite.value = true;
    const recipientEmail = toValue(email);

    try {
      await store.dispatch("subscription/sendInvite", recipientEmail);
      success("Invite sent!");
    } catch (err) {
      if (err?.response?.data?.error_code?.includes("monthly_limit_exceeded")) {
        throw new Error("monthly_limit_exceeded");
      }

      error("Failed to send invite!");
    } finally {
      isSendingInvite.value = false;
    }
  };

  const cancelInvite = async (inviteId) => {
    isCancellingInvite.value = true;
    cancellingInviteId.value = inviteId;

    try {
      await store.dispatch("subscription/removeMember", inviteId);

      success("Invite canceled");
    } catch {
      error("Failed to cancel invite!");
    } finally {
      isCancellingInvite.value = false;
      cancellingInviteId.value = null;
    }
  };

  const removeMember = async (inviteId) => {
    isRemovingMember.value = true;

    const recipientEmail = planMembers.value.find(
      (invite) => invite.id === inviteId
    ).recipient_email;

    try {
      await store.dispatch("subscription/removeMember", inviteId);

      success(`${recipientEmail} successfully removed`);
    } catch {
      error("Failed to remove member!");
    } finally {
      isRemovingMember.value = false;
    }
  };

  return {
    planMembers,
    freeSpots,
    isSendingInvite,
    isCancellingInvite,
    isRemovingMember,
    cancellingInviteId,
    inviteMember,
    cancelInvite,
    removeMember,
  };
};
