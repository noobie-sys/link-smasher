"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShorten = async () => {
    if (!originalUrl) return;

    setLoading(true);
    try {
      // In a real app, this would call your API
      // For now, we'll simulate it
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newShortUrl = `http://link.smash/${Math.random()
        .toString(36)
        .substring(2, 8)}`;
      setShortUrl(newShortUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Link Smasher
        </h1>
        <p className="text-center text-gray-600 mb-8">Shorten your links</p>

        <div className="flex gap-3 mb-4">
          <input
            type="url"
            placeholder="Paste your long URL here..."
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
          />
          <button
            onClick={handleShorten}
            disabled={loading || !originalUrl}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Smashing..." : "Smash"}
          </button>
        </div>

        {shortUrl && (
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
            <span className="text-gray-700">{shortUrl}</span>
            <button
              onClick={copyToClipboard}
              className="text-gray-600 hover:text-gray-900"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
