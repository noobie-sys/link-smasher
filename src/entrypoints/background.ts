import { onMessage } from "@/lib/messaging";
import { getUserActions } from "@/lib/user.action";
export default defineBackground(() => {
  // The message handler function can be async
  onMessage("userAction", (userAction) => {
    switch (userAction.data.type) {
      case "newTab":
        browser.tabs.create({});
        break;
      case "newWindow":
        browser.windows.create({});
        break;
      case "muteTab":
        if (userAction.data.tab?.id) {
          browser.tabs.update(userAction.data.tab.id, { muted: true });
        }
        break;
      case "unmuteTab":
        if (userAction.data.tab?.id) {
          browser.tabs.update(userAction.data.tab.id, { muted: false });
        }
        break;
    }
  });

  onMessage("getActiveTab", async () => {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tabs[0];
  });
});
