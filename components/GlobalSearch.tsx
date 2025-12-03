"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getOrganizations, getSmsTemplates, getSmsLogs } from "@/lib/api";
import { Organization, SmsTemplate, SmsMessageLog } from "@/types";

interface SearchResult {
  type: "org" | "template" | "log";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      const q = query.toLowerCase();

      const [orgs, templates, logs] = await Promise.all([
        getOrganizations(),
        getSmsTemplates(),
        getSmsLogs({}),
      ]);

      const searchResults: SearchResult[] = [];

      // Search organizations
      orgs
        .filter((org) => org.name.toLowerCase().includes(q) || org.id.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach((org) => {
          searchResults.push({
            type: "org",
            id: org.id,
            title: org.name,
            subtitle: `${org.country} · ${org.smsEnabled ? "SMS Enabled" : "SMS Disabled"}`,
            href: `/orgs/${org.id}`,
          });
        });

      // Search templates
      templates
        .filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.key.toLowerCase().includes(q) ||
            t.defaultBody.toLowerCase().includes(q)
        )
        .slice(0, 5)
        .forEach((t) => {
          searchResults.push({
            type: "template",
            id: t.id,
            title: t.name,
            subtitle: `${t.key} · ${t.type}`,
            href: `/templates/${t.id}/edit`,
          });
        });

      // Search logs by phone number
      logs
        .filter((log) => log.phoneNumber.includes(q) || log.body.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach((log) => {
          searchResults.push({
            type: "log",
            id: log.id,
            title: log.phoneNumber,
            subtitle: `${log.direction} · ${log.status}`,
            href: `/logs?phone=${encodeURIComponent(log.phoneNumber)}`,
          });
        });

      setResults(searchResults);
      setSelectedIndex(0);
      setLoading(false);
    };

    const debounce = setTimeout(search, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "org":
        return "🏢";
      case "template":
        return "📝";
      case "log":
        return "📱";
      default:
        return "🔍";
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span>Search...</span>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-mono bg-gray-700 rounded">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 pt-4 pb-20 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-xl mt-16 text-left align-top transition-all transform bg-white shadow-2xl rounded-xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center px-4 border-b border-gray-200">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search organizations, templates, phone numbers..."
              className="flex-1 px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            {loading && (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            )}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <ul className="py-2">
                {results.map((result, index) => (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      onClick={() => handleSelect(result)}
                      className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 ${
                        index === selectedIndex ? "bg-gray-100" : ""
                      }`}
                    >
                      <span className="text-xl mr-3">{getTypeIcon(result.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : query ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No results found for "{query}"
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                Start typing to search...
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between">
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Enter</kbd> to select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

