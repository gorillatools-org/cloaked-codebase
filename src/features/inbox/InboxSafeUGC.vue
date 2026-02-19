<script setup>
import {
  ref,
  reactive,
  nextTick,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useColorScheme } from "@/composables/useColorScheme";
import { sanitize } from "@/scripts/sanitize";

const props = defineProps({
  content: {
    type: String,
    default: "",
    required: true,
  },
  contentType: {
    type: String,
    default: "email_body",
    required: true,
  },
  inbound: {
    type: Boolean,
    required: true,
  },
  overrideBodyStyle: {
    type: Object,
    default: () => {},
    required: false,
  },
  message: {
    type: Boolean,
    default: false,
    required: false,
  },
  attachments: {
    type: Array,
    default: () => [],
    required: false,
  },
});

onMounted(() => {
  if (!props.message) {
    window.addEventListener("resize", resize);
  }
});

onBeforeUnmount(() => {
  if (!props.message) {
    window.removeEventListener("resize", resize);
  }
});

const iframe = ref(null);

const state = reactive({
  height: 0,
  width: 0,
  resizeTriggered: false,
});

const { colorScheme } = useColorScheme();
const darkModeEnabled = computed(() => colorScheme.value === "dark");

const color = computed(() => {
  const colorPrimary100Light = "#191E23";
  const colorPrimary0Light = "#FFFFFF";
  const colorPrimary100Dark = "#FFFFFF";
  const colorPrimary0Dark = "#191E23";
  if (props.message) {
    if (darkModeEnabled.value) {
      return props.inbound ? colorPrimary100Dark : colorPrimary0Dark;
    } else {
      return props.inbound ? colorPrimary100Light : colorPrimary0Light;
    }
  } else {
    return darkModeEnabled.value ? colorPrimary100Dark : colorPrimary100Light;
  }
});

const iframeHeight = computed(() => {
  return props.overrideBodyStyle?.height
    ? props.overrideBodyStyle?.height
    : `${state.height}px`;
});

// NOTE: width is currently set to always be 100%
const iframeWidth = computed(() => {
  return props.overrideBodyStyle?.width
    ? props.overrideBodyStyle?.width
    : `${state.width}px`;
});

const iframeDivStyle = computed(() => {
  // NOTE: 475 matches max width of inbox message
  const style = {
    height: `${state.height}px`,
    "overflow-wrap": "break-word",
    width: `${state.width}px`,
  };
  if (props.message) {
    style["max-width"] = "475px";
    style["white-space"] = state.width < 475 ? "nowrap" : "normal";
  }
  return Object.keys(style).reduce((acc, key) => {
    acc += `${key}: ${style[key]}; `;
    return acc;
  }, "");
});

const safeContent = computed(() => {
  let contentCopy = props.content;
  if (props.attachments) {
    contentCopy = replaceAttachmentUrls(contentCopy);
  }

  switch (props.contentType) {
    case "email_body":
      contentCopy = sanitize.safe_html(contentCopy).trim();
      break;
    case "email_preview":
      contentCopy = sanitize.stripHtml(contentCopy).trim();
      break;
    case "text_message":
      contentCopy = sanitize.safe_text_message(contentCopy).trim();
      break;
    default:
      contentCopy = sanitize.safe_html(contentCopy).trim();
  }

  return contentCopy;
});

const bodyStyle = computed(() => {
  const newStyle = {
    padding: 0,
    margin: 0,
    "font-weight": "400",
    "font-size": "14px",
    "line-height": "21px",
    "font-family": "STKBureauSans, sans-serif",
    width: iframeWidth.value,
  };

  if (props.message) {
    newStyle.color = `${color.value} !important`;
  }

  if (props.overrideBodyStyle) {
    Object.keys(props.overrideBodyStyle).forEach((key) => {
      newStyle[key] = props.overrideBodyStyle[key];
    });
  }

  let bodyStyleString = "";
  Object.keys(newStyle).forEach((key) => {
    bodyStyleString += `${key}: ${newStyle[key]}; `;
  });
  return bodyStyleString;
});

const iframeContent = computed(() => {
  // NOTE: the only difference netween these two returns
  // is that props.message has the added "html-content-div" wrapper inside iframe
  // instead of trying to adjust the styles dynamically,
  // im just going to remove it for emails

  if (props.message) {
    return `
    <base href="/" target="_blank" />
    <style>
    html, body {
      ${bodyStyle.value}
    }
    a {
      color: ${color.value};
      text-decoration: underline;
    }
    @font-face {
      font-family: 'STKBureauSans';
      src: local('STKBureauSans'), url(/static-fonts/STKBureauSans-Regular.woff2) format('woff2'), url(/static-fonts/STKBureauSans-Regular.woff) format('woff'), url(/static-fonts/STKBureauSans-Regular.ttf) format('truetype');
      font-weight: 400;
      font-style: normal;
    }
    .hidden {
      visibility: hidden;
    }

  </style>
  <html>
    <div id='html-content-div' class='hidden' style='width: fit-content; ${
      iframeDivStyle.value
    }'>
      ${safeContent.value || ""}
    </div>
  </html>
  `;
  }
  return `
    <base href="/" target="_blank" />
    <style>
    html, body {
      ${bodyStyle.value}
    }
    a {
      text-decoration: underline;
    }
    @font-face {
      font-family: 'STKBureauSans';
      src: local('STKBureauSans'), url(/static-fonts/STKBureauSans-Regular.woff2) format('woff2'), url(/static-fonts/STKBureauSans-Regular.woff) format('woff'), url(/static-fonts/STKBureauSans-Regular.ttf) format('truetype');
      font-weight: 400;
      font-style: normal;
    }
    .hidden {
      visibility: hidden;
    }

  </style>
  <html>
      ${safeContent.value || ""}
  </html>
  `;
});

watch(
  () => darkModeEnabled.value,
  () => {
    setTimeout(() => recalculate(true), 200);
  },
  { deep: true }
);

function replaceAttachmentUrls(contentCopy) {
  props.attachments.forEach((attachment) => {
    contentCopy = contentCopy.replaceAll(
      `cid:${attachment.content_id}`,
      attachment.url
    );
  });
  setTimeout(() => recalculate(true), 500);
  return contentCopy;
}

function recalculate(lastRender = false) {
  if (iframe.value && iframe.value.contentWindow) {
    const body = iframe.value.contentWindow.document.body;
    const html = iframe.value.contentWindow.document.documentElement;

    if (body && html) {
      const height = Math.max(
        body?.scrollHeight,
        body?.offsetHeight,
        html?.clientHeight,
        html?.scrollHeight,
        html?.offsetHeight
      );

      const width = Math.max(
        body?.scrollWidth,
        body?.offsetWidth,
        html?.clientWidth,
        html?.scrollWidth,
        html?.offsetWidth
      );

      if (height !== state.height) {
        state.height = height;
      }

      // NOTE: 300 is the minimum width of an iframe (from the browser)
      // here we are overriding that to be smaller when necessary
      if (lastRender === true) {
        if (props.message) {
          const htmlDiv =
            iframe?.value?.contentWindow?.document?.getElementById(
              "html-content-div"
            );
          // NOTE this is a hack to hide the recalculating dimensions from user
          htmlDiv.classList.remove("hidden");
          const htmlDivWidth = Math.max(
            htmlDiv?.clientWidth,
            htmlDiv?.scrollWidth,
            htmlDiv?.offsetWidth
          );
          if (htmlDivWidth <= 475) {
            state.width = htmlDivWidth;
          } else if (htmlDivWidth > 475 && props.message) {
            state.width = 475;
          } else {
            state.width = width;
          }

          setTimeout(() => recalculate(true), 500);
        } else {
          state.width = width;
        }
        return;
      }
      if (width !== state.width) {
        state.width = width;
      }
    }
  }
}

function resize() {
  // NOTE: @load was firing twice, this prevents unnecessary additional renders
  if (!state.resizeTriggered) {
    state.resizeTriggered = true;
    const document = iframe.value.contentWindow.document;
    nextTick(() => {
      setTimeout(recalculate, 50);
      setTimeout(recalculate, 100);
      setTimeout(recalculate, 200);
      setTimeout(() => recalculate(true), 500);
    });
    const q = document.body.getElementsByTagName("a");
    for (let i = 0; i < q.length; i++) {
      q[i].target = "_blank";
      if (q[i].href && !q[i].href.match(/http/i)) {
        q[i].href = `https://${q[i].href}`;
      }
    }
  }
}
</script>

<template>
  <iframe
    ref="iframe"
    :srcdoc="iframeContent"
    allowtransparency="true"
    frameborder="0"
    scrolling="no"
    sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
    :style="`height: ${iframeHeight}; width: ${iframeWidth};`"
    @load="resize"
  />
</template>
