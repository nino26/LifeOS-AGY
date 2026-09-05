#!/usr/bin/env bun
/**
 * MODELS — Unified Model & Effort Mapping for LifeOS on Antigravity CLI (agy)
 *
 * Doctrine: Tools, subagents, and scripts state INTENT (effort level),
 * never hardcoded model IDs. This file resolves the effort level to the
 * appropriate subscription model in agy.
 */

export type GeminiTier =
  | "gemini-3.8-flash-low"
  | "gemini-3.8-flash-medium"
  | "gemini-3.8-flash-high"
  | "gemini-3.1-pro-low"
  | "gemini-3.1-pro-high";

/**
 * Intent-based effort levels.
 */
export type EffortLevel = "low" | "medium" | "high" | "max";

/**
 * Map effort intent to subscription models available under Google AI Pro in agy.
 */
export const EFFORT_MODEL: Record<EffortLevel, GeminiTier> = {
  max: "gemini-3.1-pro-high",     // Keystone decisions, deepest reasoning & Algorithm loops
  high: "gemini-3.1-pro-low",      // Architecture, complex code synthesis & audit
  medium: "gemini-3.8-flash-high", // Standard operational workflows & balanced reasoning
  low: "gemini-3.8-flash-low",     // Quick triage, classification, and short summaries
};

/**
 * Human-readable descriptions for each effort level.
 */
export const EFFORT_DESCRIPTIONS: Record<EffortLevel, string> = {
  max: "Deepest reasoning, keystone architectural decisions (gemini-3.1-pro-high)",
  high: "Complex analysis, multi-file synthesis & audit (gemini-3.1-pro-low)",
  medium: "Balanced operational execution & standard tasks (gemini-3.8-flash-high)",
  low: "Fast triage, simple classification & extraction (gemini-3.8-flash-low)",
};

/**
 * Resolve effort level to model identifier.
 */
export function modelForEffort(level: EffortLevel = "medium"): GeminiTier {
  const model = EFFORT_MODEL[level];
  if (!model) {
    throw new Error(`Invalid effort level: '${level}'. Valid levels: ${Object.keys(EFFORT_MODEL).join(", ")}`);
  }
  return model;
}

/**
 * Pinned model resolver.
 */
export function pinnedModelForEffort(level: EffortLevel = "medium"): string {
  return modelForEffort(level);
}

// CLI verification when run directly: `bun models.ts`
if (import.meta.main) {
  console.log("LifeOS-AGY Model Mapping Verification:");
  for (const [level, model] of Object.entries(EFFORT_MODEL)) {
    console.log(`  - Level: ${level.padEnd(7)} -> Model: ${model}`);
  }
}