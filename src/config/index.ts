import { z } from "zod";

const configSchema = z.object({
  finnhub: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().url(),
  }),
  cryptocompare: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().url(),
  }),
  newsapi: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().url(),
  }),
  marketaux: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().url(),
  }),
  openai: z.object({
    apiKey: z.string()
  }).optional(),
  gemini: z.object({
    apiKey: z.string().min(1),
  }),
});

export const config = {
  finnhub: {
    apiKey: process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '',
    baseUrl: 'https://finnhub.io/api/v1',
  },
  cryptocompare: {
    apiKey: process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY || '',
    baseUrl: 'https://min-api.cryptocompare.com/data/v2',
  },
  newsapi: {
    apiKey: process.env.NEXT_PUBLIC_NEWSAPI_KEY || '',
    baseUrl: 'https://newsapi.org/v2',
  },
  marketaux: {
    apiKey: process.env.NEXT_PUBLIC_MARKETAUX_API_KEY || '',
    baseUrl: 'https://api.marketaux.com/v1',
  },
  openai: {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  },
  gemini: {
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
  },
} as const;

configSchema.parse(config); 