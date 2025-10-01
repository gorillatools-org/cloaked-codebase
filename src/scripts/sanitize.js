import DOMPurify from "dompurify";

const CONFIG = {
  default: {
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|blob|xmpp|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["style", "input", "form"],
    FORBID_ATTR: ["srcset", "for"],
    // Only accept official HTML tags, exclude SVG & MathML tags
    USE_PROFILES: { html: true },
  },
  noImageContent: {
    ALLOW_UNKNOWN_PROTOCOLS: true,
    WHOLE_DOCUMENT: false,
    FORBID_TAGS: ["style", "input", "form", "img"],
  },
};
export const safe_html = (htmlContent) => {
  // DOMPurifier removes script tags by default
  const cleanHtml = DOMPurify.sanitize(htmlContent, CONFIG.default);
  const parser = new DOMParser();

  const doc = parser.parseFromString(cleanHtml, "text/html");

  /* If cleanHtml doesn't have any tags, replace all the /n with <br /> to preserve formatting */
  if (cleanHtml === htmlContent) {
    return cleanHtml.replaceAll("\n", "<br />");
  }

  const anchors = doc.querySelectorAll("a");

  anchors.forEach((anchor) => {
    anchor.setAttribute("target", "_blank");
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
};

export const safe_title = (title) => {
  /* We should only ever show titles and subjects as a string */
  const cleanTitle = DOMPurify.sanitize(title);
  return `${cleanTitle}`;
};

export const safe_text_message = (message) => {
  if (typeof message !== "string") {
    throw new TypeError("Input must be a string");
  }
  const wrappedText = `<span>${message}</span>`;

  const cleanHtml = DOMPurify.sanitize(wrappedText, {
    ...CONFIG.noImageContent,
  });

  return cleanHtml.replaceAll("\n", "<br />");
};

export const stripHtml = (html) => {
  // NOTE: use for preview display
  let tmp = document.createElement("DIV");
  tmp.innerHTML = safe_html(html);
  return tmp.textContent || tmp.innerText || "";
};

export const sanitize = {
  safe_html,
  safe_title,
  safe_text_message,
  stripHtml,
};
