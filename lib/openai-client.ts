import OpenAI from 'openai'
import { HttpsProxyAgent } from 'https-proxy-agent'

// Create OpenAI client lazily to avoid build-time issues
export function getOpenAIClient() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  const httpAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
    ...(httpAgent && { httpAgent: httpAgent as any }),
  })
}
