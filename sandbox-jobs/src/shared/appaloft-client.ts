import {
  type AppaloftClient,
  createAppaloftClient,
} from "@appaloft/sdk";

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function createClient(): AppaloftClient {
  return createAppaloftClient({
    baseUrl: requiredEnv("APPALOFT_API_URL"),
    auth: {
      kind: "product-session",
      cookie: requiredEnv("APPALOFT_SESSION_COOKIE"),
    },
  });
}
