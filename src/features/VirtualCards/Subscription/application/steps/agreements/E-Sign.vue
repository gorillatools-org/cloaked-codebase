<script setup>
import { SUPPORT_EMAIL } from "@/scripts/constants";
</script>
<template>
  <div>
    <h1>E-Sign Disclosure and Consent</h1>
    <p>
      This policy describes how Cloaked delivers communications to you
      electronically. We may amend this policy at any time by providing a
      revised version on our website. The revised version will be effective at
      the time we post it. We will provide you with prior notice of any material
      changes via our website.
    </p>
    <h2>Electronic Delivery of Communications</h2>
    <p>
      You agree and consent to receive electronically all communications,
      agreements, documents, notices and disclosures (collectively,
      "Communications") that we provide in connection with your Cloaked
      Account(s) and your use of Cloaked Services. Communications include:
    </p>

    <ul>
      <li>
        Terms of use and policies you agree to (e.g., the Cloaked Terms of
        Service and Privacy Policy, or other product-specific agreements),
        including updates to these agreements or policies;
      </li>
      <li>
        Account information, transaction receipts, confirmations, and any other
        Account or transaction information;
      </li>
      <li>
        Legal, regulatory, and tax disclosures or statements we may be required
        to make available to you; and
      </li>
      <li>
        Responses to claims or customer support inquiries filed in connection
        with your Account.
      </li>
    </ul>

    <p>
      We will provide these Communications to you by posting them on the Cloaked
      Site, emailing them to you at the primary email address listed in your
      Cloaked profile, communicating to you via instant chat, and/or through
      other electronic communication such as text message or mobile push
      notification. You agree that providing these Communications in any of
      these mediums is sufficient notice and service to you.
    </p>
    <h2>Hardware and Software Requirements</h2>
    <p>
      In order to access and retain electronic Communications, you will need the
      following computer hardware and software:
    </p>
    <ul>
      <li>A device with an Internet connection;</li>
      <li>
        A current web browser that includes 128-bit encryption (e.g. Internet
        Explorer version 9.0 and above, Firefox version 3.6 and above, Chrome
        version 31.0 and above, or Safari 7.0 and above) with cookies enabled;
      </li>
      <li>
        A valid email address (your primary email address on file with Cloaked);
        and
      </li>
      <li>
        Sufficient storage space to save past Communications or an installed
        printer to print them.
      </li>
    </ul>
    <h2>How to Withdraw Your Consent</h2>
    <p>
      You may withdraw your consent to receive Communications electronically by
      contacting us at {{ SUPPORT_EMAIL }}. If you fail to provide or if you
      withdraw your consent to receive Communications electronically, Cloaked
      reserves the right to immediately close your Cloaked Account or charge you
      additional fees for paper copies.
    </p>
    <h2>Updating your Information</h2>
    <p>
      It is your responsibility to provide us with a true, accurate and complete
      e-mail address and your contact information, and to keep such information
      up to date. You understand and agree that if Cloaked sends you an
      electronic Communication but you do not receive it because your primary
      email address on file is incorrect, out of date, blocked by your service
      provider, or you are otherwise unable to receive electronic
      Communications, Cloaked will be deemed to have provided the Communication
      to you.
    </p>
    <p>
      You may update your information by logging into your account and visiting
      settings or by contacting our support team at {{ SUPPORT_EMAIL }}.
    </p>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
div {
  * {
    margin-top: 20px;
    font-size: 12px;
    font-style: normal;
    line-height: 16.8px;
    font-weight: 500;

    &:first-child {
      margin-top: 0;
    }
  }

  ul {
    margin-left: 15px;

    li {
      margin-top: 10px;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        top: 7px;
        left: -16px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: $color-primary-100;
      }

      &:first-child {
        margin-top: 0;
      }
    }
  }

  h1,
  h2 {
    font-weight: 600;
  }
}
</style>
