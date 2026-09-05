#!/usr/bin/env bun
/**
 * agy-hook-adapter.ts
 * Smart router for legacy LifeOS hooks. Reads the legacy hooks.json, maps Antigravity
 * lifecycle events to legacy events, and only runs the registered scripts.
 */
import { spawnSync } from "bun";
import { readFileSync } from "fs";
import { resolve, join } from "path";

// 1. Parse Antigravity JSON on stdin
let inputStr = "";
for await (const chunk of Bun.stdin.stream()) {
    inputStr += new TextDecoder().decode(chunk);
}
let agyInput;
try { agyInput = JSON.parse(inputStr); } catch (e) { process.exit(0); }

const agyEventName = process.argv[2] || "Unknown";

// 2. Map Antigravity Events to Legacy Events
const eventMappings: Record<string, string[]> = {
    "PreInvocation": ["UserPromptSubmit", "SessionStart"],
    "PreToolUse": ["PreToolUse", "PermissionRequest"],
    "PostToolUse": ["PostToolUse"],
    "Stop": ["Stop", "SessionEnd"]
};

const legacyEventsToRun = eventMappings[agyEventName] || [];

// 3. Construct Legacy JSON Input
const legacyInput = {
    session_id: agyInput.conversationId || "agy-session",
    transcript_path: agyInput.transcriptPath || "",
    hook_event_name: agyEventName, // will be overridden per script
    last_assistant_message: "",
    effort: { level: "medium" }
};
const legacyJsonBase = JSON.stringify(legacyInput);

// 4. Load legacy hooks.json
const hooksDir = resolve(__dirname, "../skills/LifeOS/install/hooks");
let legacyHooksConfig: any = {};
try {
    legacyHooksConfig = JSON.parse(readFileSync(join(hooksDir, "hooks.json"), "utf8"));
} catch (e) {
    console.error("[agy-hook-adapter] Could not read legacy hooks.json", e);
    process.exit(0);
}

// Extract the commands we need to run
const commandsToRun: {cmd: string, event: string}[] = [];

for (const legacyEvent of legacyEventsToRun) {
    const hookGroups = legacyHooksConfig[legacyEvent] || [];
    for (const group of hookGroups) {
        // Simple matcher logic (we run all for now, ignoring tool specific matchers to ensure full parity)
        if (group.hooks && Array.isArray(group.hooks)) {
            for (const h of group.hooks) {
                if (h.command) {
                    commandsToRun.push({ cmd: h.command, event: legacyEvent });
                }
            }
        }
    }
}

// 5. Execute mapped hooks
let blocked = false;
let blockReason = "";

for (const task of commandsToRun) {
    // Rewrite legacy path to local workspace path
    const executableCmd = task.cmd.replace("$HOME/.gemini/config/hooks/", join(hooksDir, "/") + "/");
    
    // Inject the specific legacy event name
    const payload = JSON.parse(legacyJsonBase);
    payload.hook_event_name = task.event;
    
    const [bin, ...args] = executableCmd.split(" ");
    
    try {
        const proc = spawnSync(bin, args, {
            stdin: Buffer.from(JSON.stringify(payload)),
            stdout: "pipe",
            stderr: "inherit",
            timeout: 10000 // 10s timeout
        });
        
        const out = proc.stdout.toString();
        // If it's a stop event and the hook tries to block
        if (agyEventName === "Stop" && out.includes('"decision":"block"')) {
            blocked = true;
            blockReason = "Blocked by " + args[0];
        }
        
    } catch (err) {
        console.error(`[agy-hook-adapter] Error running ${executableCmd}:`, err);
    }
}

// 6. Return standard Antigravity responses
if (agyEventName === "PreToolUse") {
    console.log(JSON.stringify({ decision: "allow" }));
} else if (agyEventName === "Stop") {
    if (blocked) {
         console.log(JSON.stringify({ decision: "continue", reason: blockReason }));
    } else {
         console.log(JSON.stringify({})); // Allow stop
    }
} else {
    console.log(JSON.stringify({}));
}
process.exit(0);
