import OpenAI from 'openai'
import { HttpsProxyAgent } from 'https-proxy-agent'

// Check if we need to use a proxy (local development with system proxy)
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
const httpAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

console.log('[OpenAI Client] Proxy configured:', proxyUrl || 'No proxy')

// Create OpenAI client with proxy support
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(httpAgent && { httpAgent: httpAgent as any }),
})
