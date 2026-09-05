#!/usr/bin/env bun
/**
 * agy-hook-adapter.ts
 * Smart router for legacy LifeOS hooks. Reads the legacy hooks.json, maps Antigravity
 * lifecycle events to legacy events, and only runs the registered scripts.
 */
import { spawnSync } from "child_process";
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
const commandsToRun: {cmd?: string, url?: string, event: string}[] = [];

// Access the inner "hooks" property
const actualHooksConfig = legacyHooksConfig.hooks || legacyHooksConfig;

for (const legacyEvent of legacyEventsToRun) {
    const hookGroups = actualHooksConfig[legacyEvent] || [];
    for (const group of hookGroups) {
        if (group.hooks && Array.isArray(group.hooks)) {
            for (const h of group.hooks) {
                if (h.command || h.url) {
                    commandsToRun.push({ cmd: h.command, url: h.url, event: legacyEvent });
                }
            }
        }
    }
}

// 5. Execute mapped hooks
let blocked = false;
let blockReason = "";

for (const task of commandsToRun) {
    const payload = JSON.parse(legacyJsonBase);
    payload.hook_event_name = task.event;
    
    if (task.url) {
        try {
            const resp = spawnSync("curl", ["-s", "-X", "POST", task.url, "-H", "Content-Type: application/json", "-d", JSON.stringify(payload)], { timeout: 10000 });
            const out = resp.stdout.toString();
            if (agyEventName === "Stop" && out.includes('"decision":"block"')) {
                blocked = true;
                blockReason = "Blocked by HTTP " + task.url;
            }
        } catch (err) {
            console.error(`[agy-hook-adapter] Error fetching ${task.url}:`, err);
        }
    } else if (task.cmd) {
        // Rewrite legacy path to local workspace path
        const executableCmd = task.cmd.replace("$HOME/.gemini/config/hooks/", join(hooksDir, "/") + "/");
        
        try {
            // Run inside a shell to support features like ;, &&, and ENV variables
            const proc = spawnSync("sh", ["-c", executableCmd], {
                input: Buffer.from(JSON.stringify(payload)),
                encoding: "utf8",
                timeout: 10000 // 10s timeout
            });
            
            const out = proc.stdout ? proc.stdout.toString() : "";
            if (agyEventName === "Stop" && out.includes('"decision":"block"')) {
                blocked = true;
                blockReason = "Blocked by " + executableCmd;
            }
        } catch (err) {
            console.error(`[agy-hook-adapter] Error running ${executableCmd}:`, err);
        }
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
