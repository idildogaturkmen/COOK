/**
 * Provider seam for skill handlers.
 *
 * Every handler in `src/lib/ai/<role>/` is deterministic today: it fills a
 * template from Prisma data, so the app works offline with no API keys. When a
 * team is ready to add an LLM, keep the same input/output types and branch here:
 *
 *   if (isLlmEnabled()) return callProvider(prompt, schema);
 *   return deterministicPackage(context);
 *
 * The response contract (`AiResponse` in `src/lib/ai/types.ts`) does not change,
 * so the UI and any external agent (e.g. Grok Bot) keep working either way.
 */
export function isLlmEnabled(): boolean {
  return process.env.COOK_AI_PROVIDER === "openai" && Boolean(process.env.OPENAI_API_KEY);
}

/** Human-readable label for the badge shown in the UI. */
export function providerLabel(): string {
  return isLlmEnabled() ? "LLM" : "Deterministic";
}
