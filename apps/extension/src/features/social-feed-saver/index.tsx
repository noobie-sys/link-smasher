import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { linkService } from "@/core/services/link.service";
import { useSavedLinksStore } from "@/core/store/saved-links.store";

// Platform-specific configuration for extracting data and positioning the icon
const PLATFORM_CONFIGS: Record<string, {
    container: string;
    category: string;
    platform: string;
    iconPosition: { top: string; right: string };
    extract: (el: Element) => any;
}> = {
    "linkedin.com": {
        container: ".feed-shared-update-v2, [data-urn]",
        category: "LinkedIn Post",
        platform: "LinkedIn",
        // Offset right to avoid overlapping with LinkedIn's native "..." context menu
        iconPosition: { top: "12px", right: "48px" },
        extract: (el) => {
            const text = el.querySelector(".feed-shared-update-v2__description, .update-components-text")?.textContent?.trim() || "";
            const author = el.querySelector(".update-components-actor__name, .feed-shared-actor__name")?.textContent?.trim() || "";
            const urlEl = el.querySelector("a[href*='/update/']");
            const url = urlEl ? (urlEl as HTMLAnchorElement).href : window.location.href;
            const timestamp = el.querySelector(".update-components-actor__sub-description, .feed-shared-actor__sub-description")?.textContent?.trim() || "";
            const media = el.querySelector("img.update-components-image__image")?.getAttribute("src") || "";
            return { text, author, url, timestamp, media };
        },
    },
    "twitter.com": {
        container: "article[data-testid='tweet']",
        category: "Tweet",
        platform: "X / Twitter",
        // Offset right to avoid overlapping with Twitter's native "..." context menu
        iconPosition: { top: "12px", right: "48px" },
        extract: (el) => {
            const text = el.querySelector("[data-testid='tweetText']")?.textContent?.trim() || "";
            const authorEl = el.querySelector("[data-testid='User-Name']");
            const author = authorEl?.textContent?.replace(/\n/g, ' ')?.trim() || "";
            const urlEl = Array.from(el.querySelectorAll("a[href*='/status/']")).pop();
            const url = urlEl ? (urlEl as HTMLAnchorElement).href : window.location.href;
            const timestamp = el.querySelector("time")?.getAttribute("datetime") || "";
            const media = el.querySelector("img[src*='media']")?.getAttribute("src") || "";
            return { text, author, url, timestamp, media };
        },
    },
    "x.com": {
        container: "article[data-testid='tweet']",
        category: "Tweet",
        platform: "X / Twitter",
        iconPosition: { top: "12px", right: "48px" },
        extract: (el) => {
            const text = el.querySelector("[data-testid='tweetText']")?.textContent?.trim() || "";
            const authorEl = el.querySelector("[data-testid='User-Name']");
            const author = authorEl?.textContent?.replace(/\n/g, ' ')?.trim() || "";
            const urlEl = Array.from(el.querySelectorAll("a[href*='/status/']")).pop();
            const url = urlEl ? (urlEl as HTMLAnchorElement).href : window.location.href;
            const timestamp = el.querySelector("time")?.getAttribute("datetime") || "";
            const media = el.querySelector("img[src*='media']")?.getAttribute("src") || "";
            return { text, author, url, timestamp, media };
        },
    },
    "facebook.com": {
        container: "div[role='article']",
        category: "Facebook Post",
        platform: "Facebook",
        iconPosition: { top: "12px", right: "48px" },
        extract: (el) => {
            const text = el.querySelector("[data-ad-preview='message']")?.textContent?.trim() || el.textContent?.trim()?.substring(0, 200) || "";
            const author = el.querySelector("strong")?.textContent?.trim() || "";
            const urlEl = el.querySelector("a[role='link'][href*='/posts/'], a[role='link'][href*='/videos/'], a[role='link'][href*='fbid']");
            const url = urlEl ? (urlEl as HTMLAnchorElement).href : window.location.href;
            const timestamp = "N/A";
            const media = el.querySelector("img")?.getAttribute("src") || "";
            return { text, author, url, timestamp, media };
        },
    },
    "instagram.com": {
        container: "article",
        category: "Instagram Post",
        platform: "Instagram",
        iconPosition: { top: "12px", right: "48px" },
        extract: (el) => {
            const text = el.querySelector("h1, span[dir='auto']")?.textContent?.trim() || "";
            const author = el.querySelector("header a")?.textContent?.trim() || "";
            const urlEl = el.querySelector("a[href*='/p/'], a[href*='/reel/']");
            const url = urlEl ? (urlEl as HTMLAnchorElement).href : window.location.href;
            const timestamp = el.querySelector("time")?.getAttribute("datetime") || "";
            const media = el.querySelector("img")?.getAttribute("src") || "";
            return { text, author, url, timestamp, media };
        },
    },
    "reddit.com": {
        container: "shreddit-post, .Post",
        category: "Reddit Thread",
        platform: "Reddit",
        // Reddit often uses a specific structure, we ensure top right alignment stays clean
        iconPosition: { top: "0px", right: "100px" },
        extract: (el) => {
            const text = el.getAttribute("post-title") || el.querySelector("h3")?.textContent?.trim() || "";
            const author = el.getAttribute("author") || el.querySelector("[data-testid='post_author_link']")?.textContent?.trim() || "";
            const permalink = el.getAttribute("permalink");
            const url = permalink ? "https://www.reddit.com" + permalink : window.location.href;
            const timestamp = el.getAttribute("created-timestamp") || "";
            const media = el.querySelector("img")?.getAttribute("src") || "";
            return { text, author, url, timestamp, media };
        },
    },
    "threads.net": {
        container: "div[data-pressable-container='true']",
        category: "Threads Post",
        platform: "Threads",
        iconPosition: { top: "12px", right: "48px" },
        extract: (el) => {
            const text = el.textContent?.trim()?.substring(0, 200) || "";
            const author = el.querySelector("a")?.textContent?.trim() || "";
            const url = window.location.href; // threads URLs are hard to extract directly from container often
            const timestamp = "N/A";
            const media = el.querySelector("img")?.getAttribute("src") || "";
            return { text, author, url, timestamp, media };
        },
    },
};

/**
 * Individual bookmark button rendered into each post using React Portal.
 * Extracts only its parent post's metadata when clicked.
 */
const PostBookmarkButton = ({ post, config }: { post: Element; config: typeof PLATFORM_CONFIGS[string] }) => {
    const { isUrlSaved, addUrl } = useSavedLinksStore();
    // Container standard DOM div tracking the injection
    const [container] = useState(() => {
        const div = document.createElement("div");
        // Ensure the container itself uses absolute positioning so it doesn't disrupt native layout
        div.style.position = "absolute";
        div.style.top = config.iconPosition.top;
        div.style.right = config.iconPosition.right;
        div.style.zIndex = "100";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        return div;
    });

    const [theme, setTheme] = useState<{ color: string; bgColor: string; hoverBg: string }>({
        color: "#4B5563", // default dark gray
        bgColor: "rgba(255, 255, 255, 0.8)",
        hoverBg: "rgba(255, 255, 255, 1)",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // 1. Inject the container into the visible post
        post.appendChild(container);

        // 2. Ensure post container allows absolute positioning inside it
        const style = window.getComputedStyle(post);
        if (style.position === "static") {
            (post as HTMLElement).style.position = "relative";
        }

        // 3. Adaptive theme icon styling based on platform's container background
        const detectTheme = () => {
            let currentElement: Element | null = post;
            let bgColor = "rgba(0, 0, 0, 0)";

            // Traverse up to find a non-transparent background
            while (currentElement && currentElement !== document.documentElement) {
                const bg = window.getComputedStyle(currentElement).backgroundColor;
                if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
                    bgColor = bg;
                    break;
                }
                currentElement = currentElement.parentElement;
            }

            // Detect background brightness using naive conversion
            const match = bgColor.match(/\d+/g);
            if (match && match.length >= 3) {
                const [r, g, b] = match.map(Number);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;

                if (brightness < 128) {
                    // Dark background -> render a lighter icon format
                    setTheme({
                        color: "#E5E7EB", // Gray 200
                        bgColor: "rgba(31, 41, 55, 0.6)", // Gray 800 semi-transparent
                        hoverBg: "rgba(31, 41, 55, 0.9)", // Gray 800 mostly opaque
                    });
                } else {
                    // Light background -> render a darker icon format
                    setTheme({
                        color: "#4B5563", // Gray 600
                        bgColor: "rgba(255, 255, 255, 0.6)",
                        hoverBg: "rgba(255, 255, 255, 0.9)",
                    });
                }
            }
        };

        // Delay slightly to ensure native CSS classes have populated elements fully
        setTimeout(detectTheme, 100);

        return () => {
            // Clean up injected DOM when React unmounts
            if (container.parentElement) {
                container.parentElement.removeChild(container);
            }
        };
    }, [post, container]);

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            // Run the specific extraction method mapped to this post container from its parent!
            const extracted = config.extract(post);

            // Attempt extracting a specific node's URL, fallback to window.location
            const urlToSave = extracted.url || window.location.href;

            // Skip save entirely if URL is already bookmarked — no database request
            if (isUrlSaved(urlToSave)) {
                toast.info("Already bookmarked!");
                return;
            }

            setIsSaving(true);

            const title = extracted.author
                ? config.platform + " Post by " + extracted.author
                : config.platform + " Post";

            const result = await linkService.addLink({
                url: urlToSave,
                title: title,
                category: config.category,
                tags: [config.category.toLowerCase().replace(" ", "-"), config.platform.toLowerCase()],
            });

            // Update Zustand store so all bookmark buttons reflect this immediately
            addUrl(urlToSave);

            if (result) {
                toast.success("Social post saved!");
            } else {
                toast.info("Post updated or already exists.");
            }
        } catch (error) {
            console.error("Failed to save post", error);
            toast.error("Failed to save post.");
        } finally {
            setIsSaving(false);
        }
    };

    let isSaved = false;
    try {
        const extractedUrl = config.extract(post).url || window.location.href;
        isSaved = isUrlSaved(extractedUrl);
    } catch (e) { }

    // Portals attach React nodes completely outside the parent's normal component hierarchy into the standard host document.
    return createPortal(
        <button
            onClick={handleSave}
            disabled={isSaving}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title="Save this post"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: isHovered ? theme.hoverBg : theme.bgColor,
                color: isSaved ? "#22C55E" : theme.color, // Highlight green if saved safely
                border: "none",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease",
                opacity: isSaving ? 0.5 : 1,
            }}
        >
            {isSaved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
        </button>,
        container
    );
};

// Generate unique IDs for React keys upon node ingestion
const generateNodeId = () => Math.random().toString(36).substring(2, 11);

/**
 * Controller Component acting as the Manager.
 * Scans the native page dynamically, tracks newly loaded posts intelligently, and assigns them Portalled Bookmarks.
 */
export const SocialFeedSaver = () => {
    const [posts, setPosts] = useState<Element[]>([]);
    const initialize = useSavedLinksStore((state) => state.initialize);

    // Check if current site aligns with our supported list cleanly
    const getHostnameMatch = () => {
        const hostname = window.location.hostname;
        for (const key in PLATFORM_CONFIGS) {
            if (hostname.includes(key)) return PLATFORM_CONFIGS[key];
        }
        return null;
    };

    const config = getHostnameMatch();

    // Load saved URLs from local storage on mount so bookmarks show as checked after reload
    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!config) return;

        let timeout: ReturnType<typeof setTimeout>;

        // Function to find structurally compliant DOM posts
        const discoverPosts = () => {
            const foundPosts = document.querySelectorAll(config.container);
            const newPosts: Element[] = [];

            foundPosts.forEach((post) => {
                // Double check no duplicate injections occur by writing flags directly to nodes!
                if (!post.hasAttribute("data-bookmark-injected")) {
                    // Lock node against future passes
                    post.setAttribute("data-bookmark-injected", "true");
                    // Add deterministic ID tracking mapped backwards into React Array Keys
                    post.setAttribute("data-link-smasher-id", generateNodeId());
                    newPosts.push(post);
                }
            });

            // Flush state array safely grouping mutations together
            if (newPosts.length > 0) {
                setPosts((prev) => [...prev, ...newPosts]);
            }
        };

        // Setup an overarching MutationObserver dynamically watching user-scrolling behaviors and layout mutations
        const observer = new MutationObserver(() => {
            // Extensive Debounce mapping -> this stops aggressive loops during initial or rapid page paints natively!
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                discoverPosts();
            }, 500);
        });

        // Subtree handles all deep children effectively covering infinite scrolls seamlessly.
        observer.observe(document.body, { childList: true, subtree: true });

        // Initial first-pass query for components already existing upon extension instantiation natively
        setTimeout(() => {
            discoverPosts();
        }, 100);

        return () => {
            observer.disconnect();
            clearTimeout(timeout);
        };
    }, [config]);

    if (!config) return null;

    return (
        <>
            {posts.map((post) => (
                <PostBookmarkButton
                    key={post.getAttribute("data-link-smasher-id")}
                    post={post}
                    config={config}
                />
            ))}
        </>
    );
};
