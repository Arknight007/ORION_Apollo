import { GoogleGenerativeAI } from "@google/generative-ai"

export const maxDuration = 30

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function POST(req: Request) {
  try {
    const { stats, focus } = await req.json()

    console.log("[v0] Received request for:", focus)

    let prompt = ""

    switch (focus) {
      case "security":
        prompt = `Analyze the security posture of this Black Friday traffic:

Firewall Actions: ${stats.firewallActions.total.toLocaleString()} total
- Blocked: ${stats.firewallActions.systemBlocks.toLocaleString()}
- Challenged: ${stats.firewallActions.systemChallenges.toLocaleString()}
- WAF Blocks: ${stats.firewallActions.customWafBlocks.toLocaleString()}

Bot Management:
- Bots Blocked: ${stats.botManagement.botsBlocked.toLocaleString()}
- Humans Verified: ${stats.botManagement.humansVerified.toLocaleString()}

Provide insights on threat patterns, attack vectors, and security effectiveness. Keep it under 150 words.`
        break

      case "performance":
        prompt = `Analyze the performance metrics:

Total Requests: ${stats.totalRequests.toLocaleString()}
Cache Hits: ${stats.cacheHits.toLocaleString()}
Cache Hit Rate: ${((stats.cacheHits / stats.totalRequests) * 100).toFixed(1)}%
Deployments: ${stats.totalDeployments.toLocaleString()}

Discuss cache efficiency, scaling patterns, and optimization opportunities. Keep it under 150 words.`
        break

      case "traffic":
        prompt = `Analyze the traffic patterns:

Total Requests: ${stats.totalRequests.toLocaleString()}
AI Gateway: ${stats.aiGatewayRequests.toLocaleString()}
Top regions: US (40B+), Germany (6B+), UK (5B+), India (4B+)

Discuss geographic distribution, traffic scale, and notable patterns. Keep it under 150 words.`
        break

      default:
        prompt = `Provide a comprehensive analysis of these Black Friday metrics: ${JSON.stringify(stats, null, 2)}. Focus on overall trends and key takeaways. Keep it under 200 words.`
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    console.log("[v0] Calling Gemini API with model: gemini-2.5-flash")

    const result = await model.generateContentStream(prompt)

    // Create a readable stream for the response
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
    console.error("[v0] Error streaming insights:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    if (errorMessage.includes("quota")) {
      return new Response("API quota exceeded. Please try again in a few moments.", { status: 429 })
    }
    return new Response("Failed to generate insights", { status: 500 })
  }
}
