import { GoogleGenerativeAI } from "@google/generative-ai"
import type { NextRequest } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function POST(req: NextRequest) {
  try {
    const { countryCode, countryName, requests, stats } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `Analyze this Black Friday traffic data for ${countryName} (${countryCode}):
    
Country Stats:
- Total Requests: ${requests.toLocaleString()}
- Percentage of Global Traffic: ${((requests / stats.totalRequests) * 100).toFixed(2)}%

Global Context:
- Total Global Requests: ${stats.totalRequests.toLocaleString()}
- Total Deployments: ${stats.totalDeployments.toLocaleString()}
- Firewall Blocks: ${stats.firewallActions.systemBlocks.toLocaleString()}
- Bot Protection Actions: ${stats.botManagement.botsBlocked.toLocaleString()}

Provide a concise analysis (3-4 sentences) covering:
1. This country's significance in the overall traffic pattern
2. Potential reasons for this traffic volume (e-commerce trends, population, tech adoption)
3. Security or performance insights specific to this region

Keep it technical but accessible.`

    const result = await model.generateContentStream(prompt)

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
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error: unknown) {
    console.error("[v0] Error analyzing country:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
