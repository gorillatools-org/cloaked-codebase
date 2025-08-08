import api from "@/api/api";
import axios from "axios";

export default class ReferralService {
  /* Fetch all referrals that are not status 'Revoked' */
  static getAllReferrals() {
    return api().get(`/api/v1/user-referral/?status__in=Pending,Accepted`);
  }

  /* Fetch all referrals with status 'Accepted' - count property represents total accepted invites */
  static getAcceptedReferrals() {
    return api().get(`/api/v1/user-referral/?status=Accepted&page_size=20`);
  }

  /* Fetch all referrals with status 'Pending' - count property represents total pending invites */
  static getPendingReferrals() {
    return api().get(`/api/v1/user-referral/?status=Pending&page_size=20`);
  }

  static createReferrals(email) {
    return api().post(`/api/v1/user-referral/`, {
      email: email,
    });
  }

  static revokeReferral(baseUrl) {
    return api().post(`${baseUrl}revoke/`);
  }

  static checkIfReferralCodeIsValid(referralCode) {
    /* Check if referral code is valid
     */
    /* Ideally we would call it like this but
   can't get this to work without authenticating */
    const url = `${
      import.meta.env.VITE_API
    }api/v1/user-referral/verify-referral/?code=${referralCode}`;
    return axios.get(url);
  }
}
