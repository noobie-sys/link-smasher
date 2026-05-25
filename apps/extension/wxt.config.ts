import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: {
    name: "Link Crust",
    description: "Save and revisit links instantly without breaking your flow.",
    permissions: ["storage", "tabs", "activeTab"],
    action: {},
  },
});
