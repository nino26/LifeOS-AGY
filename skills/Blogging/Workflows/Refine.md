# Refine Workflow

**Purpose:** Transform a raw essay draft into a polished, well-argued, image-ready blog post for dislatalk.com
**Time:** ~8–12 minutes for a full pipeline run
**Stages:** Thinking → Research → Polish → Red Team → Images

---

## Input

User provides the essay draft one of two ways:
1. Pasted directly into the message
2. File path to a markdown/text file

If not provided, ask: "Please paste your essay draft or give me the file path."

Derive `{post-slug}` from the essay title (lowercase, hyphens, max 5 words). Example: "The Attention Economy" → `attention-economy`.

---

## Stage 1 — Deepen the Thinking

**Invoke:** `Skill("Thinking")` with IterativeDepth mode

**Prompt to Thinking skill:**
```
Run IterativeDepth on the following essay thesis and core argument.
Extract 3–5 underdeveloped angles, counter-arguments, or hidden assumptions the author should consider.
Be specific — point to actual sentences or claims.
Return a "thinking brief": bulleted list of enrichment opportunities, each with a 1-sentence suggested addition.

Essay:
{essay_draft}
```

**Output:** Thinking brief — 3–5 enrichment suggestions with specific quotes and proposed additions.

Present the thinking brief to Jonathan before proceeding. Ask: "Which of these do you want to incorporate? I'll weave them into the draft."

Apply chosen suggestions before moving to Stage 2.

---

## Stage 2 — Fact-Check + Enrich (Conditional)

**Skip this stage if:** The post is personal narrative, pure opinion, or reflection with no factual claims. Ask the user: "Does this post make any factual claims worth verifying? (stats, historical events, research findings)"

**If factual claims exist, invoke:** `Skill("Research")` with QuickResearch mode

**Prompt to Research skill:**
```
Quick research for blog fact-checking. Verify these specific claims from the essay:
{list key factual claims extracted from essay}

For each claim:
- Confirm true/false/nuanced
- Surface 1 credible source if available
- Flag anything that needs to be softened or corrected

Blog context: dislatalk.com — technology improving personal lives.
```

**Output:** Fact-check report with verified claims and 1–2 citable sources.

Apply corrections and add any strong supporting stats to the draft.

---

## Stage 3 — Writing Polish

**Invoke:** `Skill("Utilities")` → Fabric workflow

Run two Fabric patterns in sequence:

**Pattern 1: `improve_writing`**
- Input: current draft
- Improves clarity, sentence rhythm, word choice, and flow
- Apply suggestions to produce Draft v2

**Pattern 2: `enrich_blog_post`**
- Input: Draft v2
- Improves structure: hook strength, section transitions, conclusion punch
- Apply suggestions to produce Draft v3 (the polished draft)

---

## Stage 4 — Red Team Pass

**Invoke:** `Skill("Thinking")` with RedTeam mode

**Prompt to Thinking skill:**
```
Red team this blog post. You are a sharp, skeptical reader of dislatalk.com.
Find the top 3 weaknesses:
- Claims that need more evidence
- Arguments that don't fully land
- Sections that lose the reader

For each weakness: quote the specific text, explain the problem in 1 sentence, and suggest one concrete fix.
Return exactly 3 items — no more, no less.

Draft:
{polished_draft}
```

**Output:** 3-item red team report.

Present to Jonathan: "Here are the top 3 issues the red team found. Which do you want me to fix?"

Apply chosen fixes to produce the final draft.

---

## Stage 5 — Image Generation

**Invoke:** `Skill("Media")` → Art workflow

### Header Image (Always)

Generate a high-quality editorial header image:

```
Style: Editorial essay illustration — think New Yorker meets Wired.
Mood: [derived from essay tone — contemplative, energetic, critical, etc.]
Subject: [derived from essay thesis — 1 sentence visual concept]
Format: Wide editorial banner, 1792×1024
No text, no logos, no people's faces
Compositionally strong, publication-quality
```

Save to: `~/Downloads/dislatalk/{post-slug}/header.png`

### Concept Images (Conditional)

Generate 1–2 inline concept images if the post contains:
- A framework or model with 2–4 components
- A before/after comparison
- A visual metaphor that would benefit from illustration

```
Style: Clean editorial diagram or conceptual illustration
Format: Square or 4:3, 1024×1024 or 1024×768
Matches header aesthetic
```

Save to: `~/Downloads/dislatalk/{post-slug}/concept-1.png` (and concept-2.png if needed)

**Always deliver:** The exact prompts used for each image, so Jonathan can regenerate variants.

---

## Stage 6 — Final Deliverable

Output in this order:

### Refined Essay
```markdown
---
title: [Post Title]
slug: {post-slug}
date: [today's date]
readTime: [X min read]
wordCount: [N words]
---

[Full refined essay, markdown-formatted, ready to paste into CMS]
```

### Red Team Issues (Unresolved)
If Jonathan chose not to fix some red team issues, list them here so he can revisit before publishing.

### Image Assets
```
Header: ~/Downloads/dislatalk/{post-slug}/header.png
Concept: ~/Downloads/dislatalk/{post-slug}/concept-1.png (if generated)

Prompts used:
- Header: [exact prompt]
- Concept: [exact prompt]
```

### Summary
- Word count: N words
- Estimated read time: N min
- Changes from original: [3-bullet summary of what changed]
