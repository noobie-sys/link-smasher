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
    permissions: ["storage", "tabs", "activeTab", "cookies"],
    host_permissions: ["http://localhost:3000/*", "https://*.linksmasher.com/*"],
    action: {},
  },
});
