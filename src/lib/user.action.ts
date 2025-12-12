import { sendMessage } from "./messaging";
import { UserAction } from "./types";

export const getUserActions = async (): Promise<UserAction[]> => {
  const activeTab = await sendMessage("getActiveTab", undefined);
  const isMuted: boolean = activeTab.mutedInfo?.muted || false;

  const userAction: UserAction[] = [
    {
      title: "New Tab",
      id: "newTab",
      handler: () => {
        sendMessage("userAction", { type: "newTab" });
      },
      visible: true,
    },
    {
      title: "New Window",
      id: "newWindow",
      handler: () => {
        sendMessage("userAction", { type: "newWindow" });
      },
      visible: true,
    },
    {
      title: "Mute Tab",
      id: "muteTab",
      handler: () => {
        sendMessage("userAction", {
          type: "muteTab",
          tab: activeTab,
        });
      },
      visible: !isMuted,
    },
    {
      title: "Unmute Tab",
      id: "unmuteTab",
      handler: () => {
        sendMessage("userAction", {
          type: "unmuteTab",
          tab: activeTab,
        });
      },
      visible: isMuted,
    },
  ];

  return userAction.filter((action) => action.visible);
};
