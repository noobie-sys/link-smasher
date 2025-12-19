import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: {
    name: "LinkCrust",
    description:
      "Store all the links here in the browser and access all the links anytime and anywhere",
    permissions: ["storage", "tabs"],
  },
});
