import { computed, reactive, ref, watch } from "vue";
import MarkdownIt from "markdown-it";
import { useColorScheme } from "@/composables/useColorScheme";
import { sanitize } from "@/scripts/sanitize";
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";
import { posthogCapture } from "@/scripts/posthog";

export const useDataDeletionRow = () => {
  const iframeRef = ref(null);
  const rowDetailsRef = ref(null);

  const state = reactive({
    iframeHeight: 0,
    iframeWidth: 0,
  });

  const markdown = new MarkdownIt();
  const { colorScheme } = useColorScheme();

  const linkColor = computed(() => {
    return colorScheme.value === "dark" ? "#FFFFFF" : "#191E23";
  });

  const renderMarkdown = (instructions) => {
    if (!instructions) return "";

    const formattedMarkdown = instructions
      ?.split(" ")
      .map((word) => {
        if (word.startsWith("http") || word.startsWith("www.")) {
          // dont want to do regex match cus some urls are already formatted in markdown correctly
          return `[${word}](${word})`;
        }
        return word;
      })
      .join(" ");

    let html = markdown.render(formattedMarkdown);

    html = sanitize.safe_html(html);
    html = html.replaceAll("<br />", "");
    html = html.replaceAll(
      "<a",
      `<a style='text-decoration: underline; cursor: pointer; color: ${linkColor.value};' target='_blank' rel='noopener noreferrer'`
    );
    html = html.replaceAll(
      "<li",
      `<li style='display: list-item; list-style-position: inside; margin-top: 16px; color: ${linkColor.value};'`
    );
    html = html.replaceAll(
      "<ol",
      "<ol style='list-style-type: decimal; margin: 0; padding: 0;'"
    );
    html = `
      <base href="/" target="_blank" />
      <style>
        @font-face { font-family: 'Urbanist'; src: local('Urbanist'), url(/static-fonts/Urbanist-Regular.woff2)  format('woff2'), url(/static-fonts/Urbanist-Regular.woff)  format('woff'), url(/static-fonts/Urbanist-Regular.ttf)  format('truetype'); font-weight: 400; font-style: normal;}
        html, body { font-family: 'Urbanist', sans-serif; color: ${linkColor.value}; }
      </style>
      <html>
        <body>
          ${html}
        </body>
      </html>`;
    return html;
  };

  function resizeIframe() {
    try {
      const body = iframeRef?.value?.contentWindow?.document?.body;
      const html = iframeRef?.value?.contentWindow?.document?.documentElement;

      if (body && html) {
        const height = Math.max(
          body?.scrollHeight,
          body?.offsetHeight,
          html?.clientHeight,
          html?.scrollHeight,
          html?.offsetHeight
        );
        state.iframeHeight = height;
      }
    } catch (error) {
      console.error("Error resizing iframe", error);
    }
  }

  function setupResizeWatch() {
    watch(rowDetailsRef, (value) => {
      if (value) {
        state.iframeWidth = value.clientWidth;
      }
    });
  }

  const isNameInSupportedList = (name) => {
    return [
      "infotracer",
      "spokeo",
      "usapeoplesearch",
      "veripages",
      "beenverified",
      "peopleconnect",
    ].includes(name.toLowerCase());
  };

  function onLinkToSupportPage(name) {
    let url = HELP_CENTER_BASE_URL;
    if (name.toLowerCase() === "infotracer") {
      url += "/articles/34574469891348-Removing-Your-Data-From-InfoTracer";
    } else if (name.toLowerCase() === "spokeo") {
      url += "/articles/34297441672084-Removing-Your-Data-From-Spokeo";
    } else if (name.toLowerCase() === "usapeoplesearch") {
      url += "/articles/32761477305236-Removing-Your-Data-From-USAPeopleSearch";
    } else if (name.toLowerCase() === "veripages") {
      url += "/articles/32761404903572-Removing-Your-Data-From-VeriPages";
    } else if (name.toLowerCase() === "beenverified") {
      url += "/articles/32761374505236-Removing-Your-Data-From-BeenVerified";
    } else if (name.toLowerCase() === "peopleconnect") {
      url += "/articles/32761276448916-Removing-Your-Data-From-PeopleConnect";
    }
    window.open(url, "_blank");
    posthogCapture("user_clicked_support_doc_databroker_detailed_view");
  }

  return {
    iframeRef,
    rowDetailsRef,
    state,
    linkColor,
    renderMarkdown,
    resizeIframe,
    setupResizeWatch,
    isNameInSupportedList,
    onLinkToSupportPage,
  };
};
