import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import AuthService from "@/api/actions/auth-service";

import { authDecrypt } from "@/scripts/actions/encryption";
import { SUPPORT_EMAIL } from "@/scripts/constants";
const copyText = async (text) => {
  /* Verify Clipboard API is available & window is secure */
  if (navigator?.clipboard && window?.isSecureContext) {
    return new Promise((resolve, reject) => {
      try {
        navigator?.clipboard?.writeText(text).then(() => {
          resolve(true);
        });
      } catch (err) {
        reject(err);
      }
    });
  } else {
    /* Fallback mobile webviews, ye olde browsers */
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    return new Promise((resolve, reject) => {
      try {
        const successful = document?.execCommand("copy");
        if (successful) {
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        reject(err);
      } finally {
        document?.body?.removeChild(textArea);
      }
    });
  }
};

export const copy = async (text, $event) => {
  await copyText(text);
  const div = document.createElement("div");
  div.innerHTML = "Copied";
  div.classList.add("copy-div");
  div.style.left = `${$event.clientX + 5}px`;
  div.style.top = `${
    $event.clientY +
    ($event.currentTarget.scrollTop || document.documentElement.scrollTop) +
    5
  }px`;
  div.addEventListener("mouseout", () => {
    if (div) {
      document.body.removeChild(div);
    }
  });
  document.body.appendChild(div);
  setTimeout(() => {
    if (div) {
      document.body.removeChild(div);
    }
  }, 650);
};

export const copyToClipboard = async (text, formattingOn = true) => {
  let formattedText = text;
  if (formattingOn) {
    formattedText = text?.replace(/\n/g, " ");
  }
  await copyText(formattedText);
};

export const downloadFile = ({
  fileContents = "",
  fileName = "file.txt",
  mimeType = "text/plain",
  createBlob = true,
}) => {
  let data = fileContents;
  const link = document.createElement("a");
  link.setAttribute("download", fileName);
  link.style.display = "none";
  link.rel = "noopener";

  if (createBlob) {
    data = new Blob([fileContents], {
      type: mimeType,
    });
  }

  const blobURL = window.URL.createObjectURL(data);
  link.href = blobURL;

  if (typeof link.download === "undefined") {
    link.setAttribute("target", "_blank");
  }

  link.click();

  setTimeout(() => {
    // For Firefox it is necessary to delay revoking the ObjectURL
    window.URL.revokeObjectURL(blobURL);
  }, 100);
};

/* Wait for an element to appear on the DOM, then return it */
export const waitForElmmentOnPage = (selector) => {
  return new Promise((resolve) => {
    if (document.getElementById(selector)) {
      return resolve(document.getElementById(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.getElementById(selector)) {
        resolve(document.getElementById(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

export const createPDF = async (key, supportEmail, username = null) => {
  try {
    const res = await fetch("/templates/recovery.pdf");
    const buffer = await res.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer);
    // font
    pdfDoc.registerFontkit(fontkit);
    const fontBytesRes = await fetch(
      "/static-fonts/Atkinson-Hyperlegible-Regular-102.ttf"
    );
    const fontBytesBoldRes = await fetch(
      "/static-fonts/Atkinson-Hyperlegible-Bold-102.ttf"
    );
    const fontBytes = await fontBytesRes.arrayBuffer();
    const fontBytesBold = await fontBytesBoldRes.arrayBuffer();
    const embeddedFont = await pdfDoc.embedFont(fontBytes);
    const embeddedFontBold = await pdfDoc.embedFont(fontBytesBold);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    let keyStringWidth = 0;
    const textSize = 15;

    key.split("").forEach((char) => {
      let charWidth = embeddedFont.widthOfTextAtSize(char, textSize);
      if (/\d/.test(char)) {
        // is number
        firstPage.drawText(char, {
          x: 55 + keyStringWidth,
          y: 505,
          size: textSize,
          font: embeddedFontBold,
          color: rgb(0, 0, 1),
        });
        charWidth = embeddedFontBold.widthOfTextAtSize(char, textSize);
      } else if (/[a-z]/.test(char.toLowerCase())) {
        // is letter
        firstPage.drawText(char, {
          x: 55 + keyStringWidth,
          y: 505,
          size: textSize,
          font: embeddedFont,
          color: rgb(0, 0, 0),
        });
      } else {
        // is special char
        firstPage.drawText(char, {
          x: 55 + keyStringWidth,
          y: 505,
          size: textSize,
          font: embeddedFont,
          color: rgb(1, 0, 0),
        });
      }

      keyStringWidth += charWidth;
    });

    let usernameWidth = 0;
    username.split("").forEach((char) => {
      let charWidth = embeddedFont.widthOfTextAtSize(char, textSize);
      if (/\d/.test(char)) {
        // is number
        firstPage.drawText(char, {
          x: 55 + usernameWidth,
          y: 565,
          size: textSize,
          font: embeddedFontBold,
          color: rgb(0, 0, 1),
        });
        charWidth = embeddedFontBold.widthOfTextAtSize(char, textSize);
      } else if (/[a-z]/.test(char.toLowerCase())) {
        // is letter
        firstPage.drawText(char, {
          x: 55 + usernameWidth,
          y: 565,
          size: textSize,
          font: embeddedFont,
          color: rgb(0, 0, 0),
        });
      } else {
        // is special char
        firstPage.drawText(char, {
          x: 55 + usernameWidth,
          y: 565,
          size: textSize,
          font: embeddedFont,
          color: rgb(1, 0, 0),
        });
      }

      usernameWidth += charWidth;
    });

    firstPage.drawText(
      supportEmail ? `support.${supportEmail}` : SUPPORT_EMAIL,
      { x: 55, y: 235, size: 15, font: embeddedFont, color: rgb(0, 0, 0) }
    );
    const pdfBytes = await pdfDoc.save();
    downloadFile({
      fileContents: pdfBytes,
      fileName: "recovery-key.pdf",
      // can't tell mobile safari it's a pdf, otherwise it will try to be smart and immediately
      // open it in the same tab causing terrible user experience
      mimeType: "application/octet-stream",
    });
  } catch (e) {
    console.error(e);
  }
};

export const downloadRecoveryKeyAndCreatePdf = (
  supportEmail,
  username = null
) => {
  AuthService.passPhrase()
    .then(({ data }) => {
      const { results } = data;
      if (results && results[0]) {
        authDecrypt(results[0].key).then((key) => {
          createPDF(key, supportEmail, username);
        });
      } else {
        throw "error";
      }
    })
    .catch(() => {
      throw "error";
    });
};

export const supportsWasm = () => {
  try {
    if (
      typeof WebAssembly === "object" &&
      typeof WebAssembly.instantiate === "function"
    ) {
      const module = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );
      if (module instanceof WebAssembly.Module)
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
    }
  } catch {
    return false;
  }
};

export const isInAppBrowser = (() => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (userAgent?.indexOf("FBAN") > -1 || userAgent?.indexOf("FBAV") > -1) {
    return true;
  }
  if (userAgent?.includes("Instagram")) {
    return true;
  }

  if (document?.documentElement?.classList?.contains("in-app-browser")) {
    return true;
  }
  return false;
})();

export function bankCardExpiresAtStringToDate(value) {
  if (!value || typeof value !== "string") {
    throw new Error("Invalid expiration date format");
  }

  if (!/^\d{2}\/\d{2}$/.test(value)) {
    throw new Error("Expiration date must be in MM/YY format");
  }

  const [expiresAtMonth, expiresAtYear] = value.split("/");
  const month = parseInt(expiresAtMonth);
  const year = parseInt(expiresAtYear);

  if (month < 1 || month > 12) {
    throw new Error("Invalid month value");
  }

  return new Date(Date.UTC(2000 + year, month - 1, 1, 0, 0, 0));
}

export default {
  copy,
  copyToClipboard,
  downloadFile,
  waitForElmmentOnPage,
  createPDF,
  downloadRecoveryKeyAndCreatePdf,
  supportsWasm,
  isInAppBrowser,
};

export const tools = {
  copy,
  copyToClipboard,
  downloadFile,
  waitForElmmentOnPage,
  createPDF,
  downloadRecoveryKeyAndCreatePdf,
  supportsWasm,
  isInAppBrowser,
};
