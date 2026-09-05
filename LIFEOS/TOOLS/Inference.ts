#!/usr/bin/env bun
/**
 * INFERENCE — Unified Headless Inference Tool for LifeOS on Antigravity (agy)
 *
 * Doctrine: Spawns headless Antigravity sessions (`agy --print`) with
 * intent-based effort levels, inheriting Google AI Pro subscription auth
 * with zero API key dependencies.
 */

import { spawn } from "child_process";
import { modelForEffort, type EffortLevel } from "./models";

export type { EffortLevel };

export interface InferenceOptions {
  systemPrompt?: string;
  userPrompt: string;
  level?: EffortLevel;
  expectJson?: boolean;
  timeout?: number;
}

export interface InferenceResult {
  success: boolean;
  output: string;
  parsed?: unknown;
  error?: string;
  latencyMs: number;
  level: EffortLevel;
  model: string;
}

// Default timeouts per effort tier (in milliseconds)
const DEFAULT_TIMEOUTS: Record<EffortLevel, number> = {
  low: 20000,     // 20s for Flash low
  medium: 45000,  // 45s for Flash high
  high: 90000,    // 90s for Pro low
  max: 150000,    // 150s for Pro high
};

/**
 * Run headless inference through Antigravity CLI (agy)
 */
export async function inference(options: InferenceOptions): Promise<InferenceResult> {
  const level = options.level || "medium";
  const model = modelForEffort(level);
  const startTime = Date.now();
  const timeout = options.timeout || DEFAULT_TIMEOUTS[level];

  // Prepare combined prompt
  let fullPrompt = "";
  if (options.systemPrompt && options.systemPrompt.trim().length > 0) {
    fullPrompt += `[SYSTEM INSTRUCTION]\n${options.systemPrompt.trim()}\n\n`;
  }
  if (options.expectJson) {
    fullPrompt += `[FORMAT REQUIREMENT]\nRespond with valid, parseable JSON only. Do not include markdown code fences (no \`\`\`json).\n\n`;
  }
  fullPrompt += `[REQUEST]\n${options.userPrompt.trim()}`;

  return new Promise((resolve) => {
    const args = [
      "--disable-slash-commands",
      "--model", model,
      "--print", fullPrompt,
    ];

    let stdout = "";
    let stderr = "";
    let killed = false;

    const proc = spawn("agy", args, {
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const timer = setTimeout(() => {
      killed = true;
      proc.kill("SIGKILL");
      resolve({
        success: false,
        output: "",
        error: `Inference timed out after ${timeout}ms (level: ${level}, model: ${model})`,
        latencyMs: Date.now() - startTime,
        level,
        model,
      });
    }, timeout);

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        success: false,
        output: "",
        error: `Failed to spawn agy: ${err.message}`,
        latencyMs: Date.now() - startTime,
        level,
        model,
      });
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      if (killed) return;

      const latencyMs = Date.now() - startTime;
      const trimmedOutput = stdout.trim();

      if (code !== 0) {
        resolve({
          success: false,
          output: trimmedOutput,
          error: stderr.trim() || `agy exited with code ${code}`,
          latencyMs,
          level,
          model,
        });
        return;
      }

      let parsed: unknown;
      if (options.expectJson) {
        try {
          const jsonClean = trimmedOutput.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
          parsed = JSON.parse(jsonClean);
        } catch (e: any) {
          resolve({
            success: false,
            output: trimmedOutput,
            error: `Failed to parse JSON: ${e.message}`,
            latencyMs,
            level,
            model,
          });
          return;
        }
      }

      resolve({
        success: true,
        output: trimmedOutput,
        parsed,
        latencyMs,
        level,
        model,
      });
    });
  });
}

// CLI execution
if (import.meta.main) {
  const args = process.argv.slice(2);
  let level: EffortLevel = "medium";
  let expectJson = false;
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--level" && args[i + 1]) {
      level = args[++i] as EffortLevel;
    } else if (args[i] === "--json") {
      expectJson = true;
    } else {
      positional.push(args[i]);
    }
  }

  const systemPrompt = positional.length > 1 ? positional[0] : undefined;
  const userPrompt = positional.length > 1 ? positional.slice(1).join(" ") : (positional[0] || "Respond with: ONLINE");

  console.log(`[Inference] Executing with level: '${level}' (expectJson: ${expectJson})...`);
  const result = await inference({ systemPrompt, userPrompt, level, expectJson });

  if (result.success) {
    console.log(`[Inference] Success (${result.latencyMs}ms, model: ${result.model})`);
    if (result.parsed) {
      console.log("Parsed JSON:", JSON.stringify(result.parsed, null, 2));
    } else {
      console.log(result.output);
    }
    process.exit(0);
  } else {
    console.error(`[Inference] Error (${result.latencyMs}ms): ${result.error}`);
    process.exit(1);
  }
}
