export default defineBackground(() => {
  console.log("Link Smasher background script initialized (React MVP)");

  chrome.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed/updated:", details);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      console.log("Tab updated:", { tabId, url: tab.url, title: tab.title });
    }
  });

  chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log("Tab activated:", activeInfo);
  });
});
