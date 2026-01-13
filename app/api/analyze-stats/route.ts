import { GoogleGenerativeAI } from "@google/generative-ai"

export const maxDuration = 30

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function POST(req: Request) {
  try {
    const { stats } = await req.json()

    const prompt = `You are an expert web infrastructure analyst. Analyze the following Black Friday/Cyber Monday traffic statistics from Vercel's edge network and provide actionable insights:

**Traffic Overview:**
- Total Requests: ${stats.totalRequests.toLocaleString()} requests
- Total Deployments: ${stats.totalDeployments.toLocaleString()} deployments
- Cache Hits: ${stats.cacheHits.toLocaleString()} (${((stats.cacheHits / stats.totalRequests) * 100).toFixed(1)}% cache rate)
- AI Gateway Requests: ${stats.aiGatewayRequests.toLocaleString()}

**Security Metrics:**
- Total Firewall Actions: ${stats.firewallActions.total.toLocaleString()}
- System Blocks: ${stats.firewallActions.systemBlocks.toLocaleString()}
- System Challenges: ${stats.firewallActions.systemChallenges.toLocaleString()}
- Custom WAF Blocks: ${stats.firewallActions.customWafBlocks.toLocaleString()}

**Bot Management:**
- Bots Blocked: ${stats.botManagement.botsBlocked.toLocaleString()}
- Humans Verified: ${stats.botManagement.humansVerified.toLocaleString()}

**Geographic Distribution:**
Top countries by traffic: United States (40B+ requests), Germany (6B+), United Kingdom (5B+), India (4B+), Brazil (4B+), Singapore (4B+), Japan (3.6B+)

Please provide:
1. A brief assessment of the traffic scale and what it indicates
2. Key security insights (threat patterns, protection effectiveness)
3. Performance analysis (cache efficiency, optimization opportunities)
4. Any notable trends or recommendations

Keep your response concise (under 180 words), professional, and focused on insights that would matter to engineering teams.`

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return Response.json({ analysis: text })
  } catch (error) {
    console.error("[v0] Error analyzing stats with Gemini:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    if (errorMessage.includes("quota")) {
      return Response.json(
        {
          error: "API quota exceeded. Please try again in a few moments.",
        },
        { status: 429 },
      )
    }
    return Response.json(
      {
        error: "Failed to analyze stats. Please check your API configuration.",
      },
      { status: 500 },
    )
  }
}
