import { type AppaloftSdkOperationResult, createAppaloftClient } from "@appaloft/sdk";

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function unwrap<T>(result: AppaloftSdkOperationResult<T>): T {
  if (result.ok) return result.data;
  throw new Error(
    `Appaloft API request failed (${result.status}): ${JSON.stringify(result.error)}`,
  );
}

export const appaloft = createAppaloftClient({
  baseUrl: requiredEnv("APPALOFT_API_URL"),
  auth: {
    kind: "product-session",
    cookie: requiredEnv("APPALOFT_SESSION_COOKIE"),
  },
});
