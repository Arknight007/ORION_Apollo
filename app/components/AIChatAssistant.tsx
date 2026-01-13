"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const suggestedQuestions = [
  "What's the overall traffic performance?",
  "How effective is the security?",
  "Which regions had the most traffic?",
  "What's the cache hit rate?",
]

export function AIChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (question?: string) => {
    const messageText = question || input.trim()
    if (!messageText || isLoading) return

    const userMessage: Message = { role: "user", content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          assistantContent += chunk

          setMessages((prev) => {
            const newMessages = [...prev]
            newMessages[newMessages.length - 1] = {
              role: "assistant",
              content: assistantContent,
            }
            return newMessages
          })
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="bg-gray-alpha-100 rounded-md overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="mb-6">
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
              <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
            </svg>
            AI Analytics Assistant
          </h2>
          <p className="text-sm text-gray-900 font-mono m-0">Ask questions about your Black Friday metrics</p>
        </div>

        {messages.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-6 px-4">
              <p className="text-sm text-gray-900 font-mono m-0 leading-relaxed">
                I can analyze your traffic patterns, security metrics, performance data, and regional insights.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-900 font-mono uppercase m-0">Suggested Questions</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(question)}
                    disabled={isLoading}
                    className="text-left px-4 py-3 text-sm font-mono bg-transparent text-gray-1000 hover:bg-gray-alpha-200 transition-colors duration-150 rounded-md border border-transparent hover:border-gray-alpha-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-4 max-h-[500px] overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] rounded-md px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gray-1000 text-white"
                      : "bg-transparent text-gray-1000 border-l-2 border-gray-alpha-400"
                  }`}
                >
                  <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap m-0">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading &&
              messages[messages.length - 1]?.role === "assistant" &&
              messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="bg-transparent border-l-2 border-gray-alpha-400 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-900 rounded-full animate-pulse"></span>
                        <span className="inline-block w-1.5 h-1.5 bg-gray-900 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                        <span className="inline-block w-1.5 h-1.5 bg-gray-900 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                      </div>
                      <span className="text-sm text-gray-900 font-mono">Analyzing</span>
                    </div>
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="relative mt-4">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your metrics..."
            disabled={isLoading}
            rows={1}
            className="w-full px-4 py-3 pr-12 text-sm font-mono text-gray-1000 border border-gray-alpha-400 focus:outline-none focus:ring-2 focus:ring-gray-1000 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-900 text-background bg-sidebar-foreground rounded-xl shadow-xl"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-1000 text-white rounded hover:bg-gray-900 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-1000"
            aria-label="Send message"
          >
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
              <line x1="22" x2="11" y1="2" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-900 font-mono mt-3 m-0">Powered by Google Gemini 2.5 Flash</p>
      </div>
    </div>
  )
}
