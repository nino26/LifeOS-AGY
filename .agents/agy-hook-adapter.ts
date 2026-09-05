#!/usr/bin/env bun
/**
 * agy-hook-runner.ts
 * Emulates Claude Code's hook runner. Receives Antigravity hook payloads,
 * transforms them to the legacy LifeOS shape, and executes all .hook.ts 
 * files in the legacy directory in parallel.
 */
import { spawnSync } from "bun";
import { readdirSync } from "fs";
import { resolve, join } from "path";

// 1. Parse Antigravity JSON
let inputStr = "";
for await (const chunk of Bun.stdin.stream()) {
    inputStr += new TextDecoder().decode(chunk);
}
let agyInput;
try { agyInput = JSON.parse(inputStr); } catch (e) { process.exit(0); }

// 2. Map to legacy
const hookEventName = process.argv[2] || "Unknown";
const legacyInput = {
    session_id: agyInput.conversationId || "agy-session",
    transcript_path: agyInput.transcriptPath || "",
    hook_event_name: hookEventName,
    last_assistant_message: "", // best effort
    effort: { level: "medium" }
};
const legacyJson = JSON.stringify(legacyInput);

// 3. Find all legacy hooks
const hooksDir = resolve(__dirname, "../skills/LifeOS/install/hooks");
let hookFiles: string[] = [];
try {
    hookFiles = readdirSync(hooksDir).filter(f => f.endsWith(".hook.ts"));
} catch (e) {}

// 4. Run them
let blocked = false;
let blockReason = "";

for (const file of hookFiles) {
    const hookPath = join(hooksDir, file);
    try {
        const proc = spawnSync(["bun", "run", hookPath], {
            stdin: Buffer.from(legacyJson),
            stdout: "pipe",
            stderr: "inherit",
            timeout: 5000 // 5 seconds max per hook
        });
        
        const out = proc.stdout.toString();
        if (hookEventName === "Stop" && out.includes('"decision":"block"')) {
            blocked = true;
            blockReason = "Blocked by " + file;
        }
    } catch (err) {
        console.error(`[agy-hook-runner] Failed to run ${file}:`, err);
    }
}

// 5. Output Antigravity response
if (hookEventName === "PreToolUse") {
    console.log(JSON.stringify({ decision: "allow" }));
} else if (hookEventName === "Stop") {
    if (blocked) {
         console.log(JSON.stringify({ decision: "continue", reason: blockReason }));
    } else {
         console.log(JSON.stringify({})); // Allow stop
    }
} else {
    console.log(JSON.stringify({}));
}
process.exit(0);
