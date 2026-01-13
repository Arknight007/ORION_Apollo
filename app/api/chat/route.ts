import { GoogleGenerativeAI } from "@google/generative-ai"
import { stats, topCountries } from "@/app/data/country-data"

export const maxDuration = 30

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

const systemContext = `You are an AI analytics assistant analyzing Black Friday/Cyber Monday 2025 traffic data for Vercel's infrastructure.

Key Metrics:
- Total Requests: ${stats.totalRequests.toLocaleString()} (115.8B+)
- Total Deployments: ${stats.totalDeployments.toLocaleString()} (6.1M+)
- Cache Hits: ${stats.cacheHits.toLocaleString()} (78.9B+)
- Cache Hit Rate: ${((stats.cacheHits / stats.totalRequests) * 100).toFixed(1)}%
- AI Gateway Requests: ${stats.aiGatewayRequests.toLocaleString()} (24M+)

Firewall & Security:
- Total Firewall Actions: ${stats.firewallActions.total.toLocaleString()} (7.5B+)
- Blocked Threats: ${stats.firewallActions.systemBlocks.toLocaleString()} (1.4B+)
- Challenges Issued: ${stats.firewallActions.systemChallenges.toLocaleString()} (3.2B+)
- WAF Blocks: ${stats.firewallActions.customWafBlocks.toLocaleString()} (328M+)
- Bots Blocked: ${stats.botManagement.botsBlocked.toLocaleString()} (415M+)
- Humans Verified: ${stats.botManagement.humansVerified.toLocaleString()} (2.4B+)

Top Countries by Traffic:
${topCountries.map((c, i) => `${i + 1}. ${c.name}: ${c.requests.toLocaleString()}`).join("\n")}

Provide concise, insightful responses about these metrics. Be technical but accessible. Keep responses under 200 words unless asked for more detail.`

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return new Response("Invalid message", { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const fullPrompt = `${systemContext}

User Question: ${message}

Provide a helpful, data-driven response:`

    const result = await model.generateContentStream(fullPrompt)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            controller.enqueue(encoder.encode(text))
          }
          controller.close()
        } catch (error) {
          console.error("[v0] Error in stream:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("[v0] Chat error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    if (errorMessage.includes("quota")) {
      return new Response("API quota exceeded. Please try again later.", { status: 429 })
    }
    return new Response("Failed to process chat message", { status: 500 })
  }
}
