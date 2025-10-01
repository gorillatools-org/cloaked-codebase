<script setup>
import HomeIdentityDisplay from "@/features/home/HomeIdentityDisplay.vue";
import IdentityService from "@/api/actions/identity-service";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog.js";
import { format } from "@/scripts/format";
import BaseText from "@/library/BaseText.vue";

const dataBreachesList = [
  {
    name: "LastPass",
    website: "lastpass.com",
    icon: "lastpass",
    article:
      "https://www.cybersecuritydive.com/news/lastpass-cyberattack-timeline/643958/",
  },
  {
    name: "Bank of America",
    website: "bankofamerica.com",
    icon: "bankamerica",
    article:
      "https://www.forbes.com/advisor/personal-finance/data-breach-affects-bank-of-america-customers/",
  },
  {
    name: "23andMe",
    website: "23andme.com",
    icon: "23andme",
    article: "https://www.bbc.com/news/technology-67624182",
  },
  {
    name: "loanDepot",
    website: "loandepot.com",
    icon: "loandepot",
    article:
      "https://www.msn.com/en-us/money/personalfinance/loandepot-says-about-17-million-customers-had-personal-data-and-social-security-numbers-stolen-during-cyberattack/ar-BB1h4CJf",
  },
  {
    name: "United Healthcare",
    website: "uhc.com",
    icon: "unitedhealthcare",
    article:
      "https://www.cnbc.com/2024/02/27/unitedhealths-change-healthcare-cyberattack-outages-continue-pharmacies-deploy-workarounds.html",
  },
  {
    name: "Duolingo",
    website: "duolingo.com",
    icon: "duolingo",
    article:
      "https://cybernews.com/security/hackers-exposed-duolingo-users-more-available-scraping/",
  },
  {
    name: "Trello",
    website: "trello.com",
    icon: "trello",
    article:
      "https://www.cpomagazine.com/cyber-security/massive-trello-user-data-leak-hacker-lists-15-million-records-on-a-dark-web-hacking-forum/",
  },
  {
    name: "CareSource",
    website: "caresource.com",
    icon: "caresource",
    article:
      "https://www.daytondailynews.com/business/caresource-sued-for-99m-in-data-breach-class-action-lawsuit/4NBHUOQM6BC6REGAZUQVKNJUU4/",
  },
  {
    name: "T-mobile",
    website: "t-mobile.com",
    icon: "tmobile",
    article:
      "https://www.theverge.com/2023/5/2/23707894/tmobile-data-breach-april-personal-data-pin-hack-security",
  },
  {
    name: "U-Haul",
    website: "uhaul.com",
    icon: "uhaul",
    article:
      "https://www.techradar.com/pro/security/u-haul-admits-thousands-of-customers-have-data-stolen-in-breach",
  },
];

function createCloak(listItem) {
  posthogCapture("user_clicked_breachedidentity", {
    name: listItem.name,
  });
  const payload = {
    app_ref: listItem.name,
    nickname: listItem.name,
    website_url: new URL(format.standardizeUrl(listItem.website)),
    category: "website",
  };

  IdentityService.createIdentity(payload).then(({ data }) => {
    openCloakDetails(data);
  });

  function openCloakDetails(newCloak) {
    store.dispatch("openCloakDetails", { cloak: newCloak });
    store.dispatch("updateCloaks", [newCloak]);
    const newEvent = new CustomEvent("cloak:created");
    newEvent.data = newCloak;
    window.dispatchEvent(newEvent);
  }
}
</script>
<template>
  <section class="breaches">
    <BaseText
      as="h1"
      variant="headline-3-bold"
    >
      Check for data breaches
    </BaseText>
    <BaseText
      as="h2"
      variant="headline-6-medium"
      class="subheader"
    >
      If you've used one of these services, click to generate new Cloaked
      information that you can use to update your old credentials.
    </BaseText>
    <div class="breach-group">
      <div class="breach-list-wrapper">
        <HomeIdentityDisplay
          v-for="(data, idx) in dataBreachesList.slice(0, 5)"
          :key="`${data.name}-${idx}`"
          :name="data.name"
          :website="data.website"
          :icon="data.icon"
          :article="data.article"
          @click-create="createCloak(data)"
        />
      </div>
      <div class="breach-list-wrapper">
        <HomeIdentityDisplay
          v-for="(data, idx) in dataBreachesList.slice(5, 10)"
          :key="`${data.name}-${idx}`"
          :name="data.name"
          :website="data.website"
          :icon="data.icon"
          :article="data.article"
          @click-create="createCloak(data)"
        />
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.subheader {
  padding: 0;
  margin-top: 9px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 6.5px;
}

.breach-group {
  margin-top: 24px;
  border-radius: 16px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  border: 1px solid $color-primary-10;
  padding: 0 18px 24px;
  min-width: 480px;

  .breach-list-wrapper {
    width: calc(50% - 12px);
    margin-top: 17px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
