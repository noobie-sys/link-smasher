/**
 * Automatically categorizes a link based on its URL and title.
 * 
 * Core Categories:
 * - Development (violet)
 * - Social Media (pink)
 * - Productivity (blue)
 * - Entertainment (red/orange)
 * - News (teal)
 * - Shopping (emerald)
 * - Education (indigo)
 * - General (gray)
 */
export function categorizeUrl(url: string, title?: string): string {
  if (!url) return "General";

  const lowerUrl = url.toLowerCase();
  const lowerTitle = (title || "").toLowerCase();

  // Helper to extract hostname
  let hostname = "";
  try {
    const urlObj = new URL(url);
    hostname = urlObj.hostname.toLowerCase();
  } catch {
    // Fallback if URL parsing fails
    const match = lowerUrl.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    hostname = match ? match[1] : "";
  }

  // 1. Social
  const socialDomains = [
    "twitter.com", "x.com", "linkedin.com", "facebook.com", "instagram.com", 
    "reddit.com", "t.co", "fb.com", "tiktok.com", "pinterest.com", "threads.net", 
    "bluesky.social", "discord.com", "discord.gg"
  ];
  if (
    socialDomains.some(domain => hostname.includes(domain)) ||
    lowerTitle.includes("tweet") || 
    lowerTitle.includes("reddit thread") || 
    lowerTitle.includes("linkedin post") ||
    lowerTitle.includes("facebook post")
  ) {
    // Specifically handle social network exact post types or fall back to "Social Media"
    if (hostname.includes("linkedin.com")) return "LinkedIn Post";
    if (hostname.includes("x.com") || hostname.includes("twitter.com")) return "Tweet";
    if (hostname.includes("reddit.com")) return "Reddit Thread";
    return "Social Media";
  }

  // 2. Development
  const devDomains = [
    "github.com", "gitlab.com", "bitbucket.org", "stackoverflow.com", "stackexchange.com", 
    "npmjs.com", "pnpm.io", "yarnpkg.com", "typescriptlang.org", "wxt.dev", "vite.dev", 
    "nextjs.org", "react.dev", "vuejs.org", "svelte.dev", "neon.tech", "supabase.com", 
    "vercel.com", "netlify.com", "aws.amazon.com", "console.cloud.google.com", 
    "docker.com", "kubernetes.io", "localhost"
  ];
  const devKeywords = [
    "api", "developer", "docs", "documentation", "git", "pull request", "commit", 
    "repository", "coding", "programming", "bug", "issue", "debug", "console", 
    "mdn", "w3schools"
  ];
  if (
    devDomains.some(domain => hostname.includes(domain)) ||
    devKeywords.some(keyword => lowerTitle.includes(keyword) || lowerUrl.includes(keyword))
  ) {
    return "Development";
  }

  // 3. Productivity
  const prodDomains = [
    "notion.so", "figma.com", "slack.com", "drive.google.com", "docs.google.com", 
    "sheets.google.com", "slides.google.com", "trello.com", "asana.com", "jira.com", 
    "atlassian.net", "linear.app", "miro.com", "zoom.us", "teams.microsoft.com"
  ];
  const prodKeywords = [
    "calendar", "document", "sheet", "board", "workspace", "inbox", "email", 
    "todo", "task", "project", "dashboard"
  ];
  if (
    prodDomains.some(domain => hostname.includes(domain)) ||
    prodKeywords.some(keyword => lowerTitle.includes(keyword) || lowerUrl.includes(keyword))
  ) {
    return "Productivity";
  }

  // 4. Entertainment
  const entDomains = [
    "youtube.com", "youtu.be", "netflix.com", "spotify.com", "twitch.tv", 
    "vimeo.com", "soundcloud.com", "disneyplus.com", "hbo.com", "crunchyroll.com"
  ];
  const entKeywords = [
    "video", "music", "movie", "song", "stream", "podcast", "watch", "game", 
    "gaming", "play", "cinema", "entertainment"
  ];
  if (
    entDomains.some(domain => hostname.includes(domain)) ||
    entKeywords.some(keyword => lowerTitle.includes(keyword) || lowerUrl.includes(keyword))
  ) {
    return "Entertainment";
  }

  // 5. Education
  const eduDomains = [
    "coursera.org", "udemy.com", "khanacademy.org", "duolingo.com", "edx.org", 
    "ocw.mit.edu", "freecodecamp.org", "codecademy.com", "geeksforgeeks.org"
  ];
  const eduKeywords = [
    "course", "lecture", "learn", "class", "academy", "syllabus", "education", 
    "school", "university", "tutorial", "study"
  ];
  if (
    eduDomains.some(domain => hostname.includes(domain)) ||
    eduKeywords.some(keyword => lowerTitle.includes(keyword) || lowerUrl.includes(keyword))
  ) {
    return "Education";
  }

  // 6. News
  const newsDomains = [
    "wikipedia.org", "nytimes.com", "bbc.com", "bbc.co.uk", "techcrunch.com", 
    "news.ycombinator.com", "wired.com", "theverge.com", "cnn.com", "reuters.com", 
    "bloomberg.com", "forbes.com"
  ];
  const newsKeywords = [
    "news", "article", "wikipedia", "definition", "how to", "guide", "journal", 
    "blog", "post"
  ];
  if (
    newsDomains.some(domain => hostname.includes(domain)) ||
    newsKeywords.some(keyword => lowerTitle.includes(keyword) || lowerUrl.includes(keyword))
  ) {
    return "News";
  }

  // 7. Shopping
  const shopDomains = [
    "amazon.com", "amazon.in", "amazon.co.uk", "ebay.com", "shopify.com", 
    "stripe.com", "paypal.com", "target.com", "walmart.com", "aliexpress.com", 
    "etsy.com"
  ];
  const shopKeywords = [
    "buy", "cart", "checkout", "price", "shop", "store", "purchase", "product", 
    "sales", "deal", "discount"
  ];
  if (
    shopDomains.some(domain => hostname.includes(domain)) ||
    shopKeywords.some(keyword => lowerTitle.includes(keyword) || lowerUrl.includes(keyword))
  ) {
    return "Shopping";
  }

  return "General";
}
