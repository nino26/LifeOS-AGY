---
name: Blogging
description: Blog post creation and refinement for dislatalk.com — refine an essay draft with thinking, research, and writing improvement, then generate header/content images. USE WHEN blog post, write blog, refine essay, polish post, dislatalk, blog draft, improve writing, blog image, blog header, publish post, biweekly post, essay refinement, improve essay, refine idea, blog workflow.
---

# Blogging

Essay refinement and publishing workflow for dislatalk.com. Takes a raw essay draft through a multi-stage pipeline: deepen the thinking, fact-check, polish the prose, red-team the argument, then generate header and concept images.

## Customization

**Before executing, check for user customizations at:**
`~/Projects/LifeOS-AGY/PAI/USER/SKILLCUSTOMIZATIONS/Blogging/`

If this directory exists, load and apply:
- `PREFERENCES.md` — writing style, tone, image aesthetic, blog-specific config

## 🚨 MANDATORY: Voice Notification (REQUIRED BEFORE ANY ACTION)

**You MUST send this notification BEFORE doing anything else when this skill is invoked.**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the Blogging skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **Blogging** skill to ACTION...
   ```

**This is not optional. Execute this curl command immediately upon skill invocation.**

## Workflow Routing

| Request Pattern | Route To |
|---|---|
| "refine", "polish", "improve this essay/post", "full refinement", default when essay provided | `Workflows/Refine.md` |
| "quick post", "quick", "fast", "just clean it up", "header only" | `Workflows/QuickPost.md` |

**Default:** If the user provides an essay draft without specifying a mode, route to `Workflows/Refine.md`.

## Examples

**Example 1: Full refinement**
```
User: "Here's my essay draft for dislatalk — can you refine it?"
→ Routes to Refine workflow
→ Deepens thinking with IterativeDepth
→ Fact-checks claims with QuickResearch
→ Polishes prose with Fabric patterns
→ Red teams the argument (surfaces top 3 issues)
→ Generates header image + any concept images
→ Returns refined essay, issues list, image paths
```

**Example 2: Quick post**
```
User: "This post is ready, just polish it and give me a header image"
→ Routes to QuickPost workflow
→ Runs improve_writing Fabric pattern
→ Generates header image → ~/Downloads/dislatalk/{slug}/
→ Returns polished draft + header image path
```

**Example 3: Image only**
```
User: "Generate a header image for my blog post about attention economy"
→ Routes to QuickPost workflow
→ Skips polish, goes straight to Media/Art
→ Returns header image path
```

## Blog Context

**Blog:** dislatalk.com
**Cadence:** Biweekly
**Mission alignment:** Technology improving personal lives — posts explore the intersection of tech, attention, and human optimization
**Tone:** Thoughtful, direct, practitioner voice — Marcus Aurelius meets Atomic Habits

## Image Output Convention

All blog images save to: `~/Downloads/dislatalk/{post-slug}/`
- `header.png` — editorial/essay header (1792×1024, always generated)
- `concept-1.png`, `concept-2.png` — optional inline concept art

Always deliver the image prompts used so Jonathan can generate variants.
