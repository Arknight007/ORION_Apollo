"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface CountryInsightPanelProps {
  countryCode: string
  countryName: string
  requests: number
  onClose: () => void
}

export default function CountryInsightPanel({ countryCode, countryName, requests, onClose }: CountryInsightPanelProps) {
  const [analysis, setAnalysis] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true)
      setAnalysis("")

      try {
        const response = await fetch("/api/analyze-country", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            countryCode,
            countryName,
            requests,
            stats: {
              totalRequests: 115832282051,
              totalDeployments: 6120247,
              firewallActions: { systemBlocks: 1398205677 },
              botManagement: { botsBlocked: 415683895 },
            },
          }),
        })

        if (!response.ok) throw new Error("Failed to fetch analysis")

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const text = decoder.decode(value, { stream: true })
            setAnalysis((prev) => prev + text)
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching analysis:", error)
        setAnalysis("Unable to generate analysis at this time.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysis()
  }, [countryCode, countryName, requests])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[var(--ds-background-100)] border border-[var(--ds-gray-alpha-400)] rounded-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--ds-gray-alpha-400)]">
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--ds-gray-1000)]">{countryName}</h3>
            <p className="text-xs text-[var(--ds-gray-900)] mt-0.5 font-mono">{requests.toLocaleString()} requests</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)] transition-colors"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--ds-gray-900)]">AI Analysis</span>
          </div>

          {isLoading && !analysis ? (
            <div className="space-y-2">
              <div className="h-3 bg-[var(--ds-gray-alpha-400)] rounded animate-pulse w-full" />
              <div className="h-3 bg-[var(--ds-gray-alpha-400)] rounded animate-pulse w-5/6" />
              <div className="h-3 bg-[var(--ds-gray-alpha-400)] rounded animate-pulse w-4/6" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-[var(--ds-gray-1000)]">
              {analysis}
              {isLoading && <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-0.5 animate-pulse" />}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
