"use client"

import { useState, useEffect } from "react"
import { stats } from "../data/country-data"
import { useCompletion } from "@ai-sdk/react"

type AnalysisType = "overview" | "security" | "performance" | "traffic"

export function AIInsights() {
  const [activeTab, setActiveTab] = useState<AnalysisType | null>(null)
  const [error, setError] = useState<string>("")
  const [displayedText, setDisplayedText] = useState("")

  const {
    completion,
    complete,
    isLoading: isStreaming,
  } = useCompletion({
    api: "/api/stream-insights",
  })

  useEffect(() => {
    if (completion) {
      setDisplayedText(completion)
    }
  }, [completion])

  const fetchAnalysis = async (type: AnalysisType) => {
    setActiveTab(type)
    setError("")
    setDisplayedText("")

    console.log("[v0] Fetching analysis for:", type)

    try {
      await complete("", {
        body: { stats, focus: type },
      })
      console.log("[v0] Analysis completed successfully")
    } catch (err) {
      console.error("[v0] Error fetching analysis:", err)
      setError("Unable to generate insights. Please try again.")
    }
  }

  const tabs = [
    {
      id: "overview" as const,
      label: "Overview",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
        </svg>
      ),
    },
    {
      id: "security" as const,
      label: "Security",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      ),
    },
    {
      id: "performance" as const,
      label: "Performance",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      id: "traffic" as const,
      label: "Traffic",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
        </svg>
      ),
    },
  ]

  const hasContent = displayedText && activeTab

  return (
    <div className="bg-gray-alpha-100 rounded-md overflow-hidden border border-gray-alpha-400">
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-1000 flex items-center gap-2 mb-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
              AI-Powered Insights
            </h2>
            <p className="text-xs text-gray-900 font-mono">Powered by Google Gemini</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => fetchAnalysis(tab.id)}
                disabled={isStreaming}
                className={`px-3 py-2 text-xs font-mono uppercase border transition-all duration-200 rounded flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-gray-1000 border-gray-1000 text-white"
                    : "bg-transparent border-gray-alpha-400 text-gray-900 hover:text-gray-1000 hover:border-gray-1000 hover:bg-gray-alpha-100"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 font-mono mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {isStreaming && (
          <div className="space-y-3 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-alpha-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
            </div>
            <div className="pt-4 space-y-2.5">
              <div className="h-3 bg-gray-alpha-200 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-alpha-200 rounded animate-pulse w-11/12" />
              <div className="h-3 bg-gray-alpha-200 rounded animate-pulse w-4/5" />
              <div className="h-3 bg-gray-alpha-200 rounded animate-pulse w-10/12" />
              <div className="h-3 bg-gray-alpha-200 rounded animate-pulse w-3/4" />
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-900 font-mono">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </div>
              Analyzing with Gemini AI...
            </div>
          </div>
        )}

        {hasContent && !isStreaming && (
          <div className="space-y-4">
            <div className="text-sm text-gray-1000 leading-relaxed font-mono border-l-2 border-blue-500 pl-4 py-2 bg-gray-alpha-100 rounded-r">
              {displayedText}
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => fetchAnalysis(activeTab)}
                className="px-3 py-2 text-xs font-mono uppercase bg-transparent border border-gray-alpha-400 text-gray-900 hover:text-gray-1000 hover:border-gray-1000 hover:bg-gray-alpha-100 transition-all duration-200 rounded flex items-center gap-1.5"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                Regenerate
              </button>
              <span className="text-xs text-gray-900 font-mono">Generated with Gemini 2.5 Flash</span>
            </div>
          </div>
        )}

        {!hasContent && !isStreaming && (
          <div className="text-center py-8 px-4">
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-alpha-200">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-900"
              >
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
            </div>
            <p className="text-sm text-gray-900 font-mono mb-4 max-w-md mx-auto">
              Select a category above to get real-time AI-powered insights about your Black Friday metrics.
            </p>
            <button
              onClick={() => fetchAnalysis("overview")}
              className="px-4 py-2.5 text-xs font-mono uppercase bg-gray-1000 text-white hover:bg-gray-800 transition-all duration-200 rounded border border-gray-1000 flex items-center gap-2 mx-auto"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
              Generate Overview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
