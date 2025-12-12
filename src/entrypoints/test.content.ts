import { fetchHistory } from "@/lib/helpers";

export default defineContentScript({
  matches: ["<all_urls>"],
  // The main function of the content script can be async
  async main(ctx) {
    const history = await fetchHistory(4);
    console.log(history);
  },
});
