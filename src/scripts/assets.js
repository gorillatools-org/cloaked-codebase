// NOTE: leaving this here in case we want to revisit only using eager for builds
// eager: process?.env?.NODE_ENV === "production",

const assets = import.meta.glob("/src/assets/**/*.{png,webp}", {
  eager: true,
});

export const assetUrl = (url) => assets[url.replace("@", "/src")]?.default;
