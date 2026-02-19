<script setup>
import AuthIframe from "./AuthIframe";
import { useRoute } from "vue-router";
import { onMounted, onUnmounted, ref } from "vue";
import router from "@/routes/router";

const route = useRoute();
const prevRoute = ref(route.query.prevRoute);

const iFrameEventListener = (e) => {
  const originUrl = new URL(e.origin);
  const envUrl = new URL(import.meta.env.VITE_API);
  if (originUrl.origin === envUrl.origin) {
    /* if we get a signup event, use AF function to send signup event */
    if (e.data.event === "signup_succeeded") {
      window.AF("pba", "event", {
        eventType: "EVENT",
        eventValue: { category: "registration" },
        eventName: "signup_succeeded",
      });
    }

    if (e.data.event === "signup") {
      window.AF("pba", "event", {
        eventType: "EVENT",
        eventValue: { category: "registration" },
        eventName: "signup",
      });
    }
    if (e.data.event === "signup_error") {
      window.AF("pba", "event", {
        eventType: "EVENT",
        eventValue: { category: "registration" },
        eventName: "signup_error",
      });
    }
  }
  /* test event that we know works */
  // if (e.data.event === "test") {
  //   window.AF("pba", "event", {
  //     eventType: "EVENT",
  //     eventValue: { category: "holiday_promotion" },
  //     eventName: "checkout",
  //   });
  // }
};
const loadScript = async () => {
  /* AppsFlyer SDK */
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `
    !function(t,e,n,s,a,c,i,o,p){t.AppsFlyerSdkObject=a,t.AF=t.AF||function(){
(t.AF.q=t.AF.q||[]).push([Date.now()].concat(Array.prototype.slice.call(arguments)))},
t.AF.id=t.AF.id||i,t.AF.plugins={},o=e.createElement(n),p=e.getElementsByTagName(n)[0],o.async=1,
o.src="https://websdk.appsflyer.com?"+(c.length>0?"st="+c.split(",").sort().join(",")+"&":"")+(i.length>0?"af_id="+i:""),
p.parentNode.insertBefore(o,p)}(window,document,"script",0,"AF","pba",{pba: {webAppId: "c7afbba5-203b-4ce0-9001-b8a7af9a867d"}})`;
    script.onload = resolve;
    script.onerror = reject;
    document.getElementsByTagName("head")[0].appendChild(script);
  });
};

onMounted(() => {
  router.replace({
    query: {
      ...route.query,
      prevRoute: undefined,
    },
  });

  window.addEventListener("message", iFrameEventListener);
  loadScript();
});

onUnmounted(() => {
  window.removeEventListener("message", iFrameEventListener);
});
</script>
<template>
  <AuthIframe
    id="cloak-iframe"
    source="auth/signup"
    :prev-route="prevRoute"
  />
</template>
