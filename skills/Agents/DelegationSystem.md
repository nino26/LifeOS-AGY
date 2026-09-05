# Subagent & Delegation Harness

**Status:** ✅ Redesigned for Antigravity (Phase 6)
**Date:** 2026-09-04

---

## Core Concept

In Antigravity (`agy`), multi-agent workflows do not rely on custom REST APIs, legacy CLI wrappers, or the deprecated `Task()` tool pattern. Instead, Antigravity provides first-class native tools for concurrent subagent delegation: `invoke_subagent` and `define_subagent`.

We map the classic LifeOS agent roles to these native subagents to fully leverage the Google AI Pro subscription tiers efficiently.

---

## The Subagent Roster

The following subagents are predefined in the environment. You can invoke them immediately using the `invoke_subagent` tool.

| Subagent Type | Role & Capabilities | Model Tier | Use Case |
|---|---|---|---|
| **`researcher`** | Exploration & read-only analysis | `flash` | Sifting logs, searching codebase, summarizing web pages. Fast, low quota impact. |
| **`architect`** | System design & structure | `pro` | High-level planning, API design, writing specifications, and deep reasoning. |
| **`engineer`** | Implementation & TDD | `pro` | Writing code, fixing bugs, refactoring, and applying the Architect's designs. |
| **`auditor`** | QA, Verification & ISC checks | `pro` | Verifying that code meets the Ideal State Criteria (ISC). Breaking the implementation. |

---

## How to Delegate (The `invoke_subagent` Tool)

To delegate work, use the `invoke_subagent` tool. You pass an array of `Subagents`, which allows you to spawn multiple agents concurrently.

### Parallel Execution (Grunt Work)

If you need to research 5 companies or analyze 3 files, spawn multiple `researcher` subagents in a single tool call:

```json
{
  "Subagents": [
    {
      "TypeName": "researcher",
      "Role": "Company A Analyst",
      "Prompt": "Research Company A and summarize their products...",
      "Model": "flash"
    },
    {
      "TypeName": "researcher",
      "Role": "Company B Analyst",
      "Prompt": "Research Company B and summarize their products...",
      "Model": "flash"
    }
  ]
}
```

The system will spawn these agents in the background. You do not need to poll; Antigravity will notify you as soon as they message back with their results.

### Complex Multi-Agent Workflows (The Delegation Pattern)

For complex tasks, coordinate different types of agents:

1. **Invoke the Researcher:** Ask them to explore the codebase and find the relevant files.
2. **Invoke the Architect:** Give them the Researcher's findings and ask them to design a solution.
3. **Invoke the Engineer:** Pass the Architect's design and instruct them to write the code.
4. **Invoke the Auditor:** Instruct the Auditor to review the Engineer's PR and verify it against the Ideal State Criteria (ISC).

*Note: You can message already-running subagents using the `send_message` tool by passing their Conversation ID. Use this to pass the output of one agent to another.*

---

## Verification & Ideal State Criteria (ISC)

When delegating to an `engineer` or `auditor`, your `Prompt` must be explicit about the Ideal State Criteria (ISC).

**Do NOT just say:** "Fix the bug."
**DO say:** "Fix the bug. The Ideal State Criteria are: 1. Tests pass. 2. No regressions in module X. 3. Code adheres to our style guide. Do not return until these criteria are met."

---

## Defining Custom Agents

If the task requires a highly specialized role that isn't covered by the 4 standard profiles, use the `define_subagent` tool to register a new type on the fly:

```json
{
  "name": "data_scientist",
  "description": "Specialist in pandas, numpy, and statistical analysis.",
  "system_prompt": "You are a Data Scientist...",
  "enable_write_tools": true,
  "enable_mcp_tools": true,
  "enable_subagent_tools": false
}
```

After defining it, you can invoke it using `TypeName: "data_scientist"`.
