import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  dev: {
    server: {
      port: 3001,
    },
  },
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: {
    name: "Link Crust",
    description: "Save and revisit links instantly without breaking your flow.",
    permissions: ["storage", "tabs", "activeTab", "cookies", "scripting", "alarms"],
    host_permissions: [
      "http://localhost:3000/*",
      "https://*.linksmasher.com/*",
      "<all_urls>",
      "*://*.linkedin.com/*",
      "*://*.instagram.com/*",
      "*://*.x.com/*",
      "*://*.twitter.com/*",
      "*://*.facebook.com/*",
      "*://*.reddit.com/*",
      "*://*.threads.net/*",
    ],
    action: {},
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["content-scripts/main.js"],
        css: ["content-scripts/main.css"],
      },
      {
        matches: [
          "*://*.linkedin.com/*",
          "*://*.instagram.com/*",
          "*://*.x.com/*",
          "*://*.twitter.com/*",
          "*://*.facebook.com/*",
          "*://*.reddit.com/*",
          "*://*.threads.net/*",
        ],
        js: ["content-scripts/social-feed.js"],
        css: ["content-scripts/social-feed.css"],
      },
    ],
  },
});
