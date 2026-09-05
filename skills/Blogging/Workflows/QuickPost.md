# QuickPost Workflow

**Purpose:** Fast polish + header image for an already-solid draft
**Time:** ~2–3 minutes
**Use when:** The draft is ready, just needs a final pass and a header image

---

## Input

User provides the essay draft (pasted or file path) and optionally a title for the post.

Derive `{post-slug}` from the title (lowercase, hyphens, max 5 words).

---

## Stage 1 — Quick Polish

**Invoke:** `Skill("Utilities")` → Fabric workflow

Run one Fabric pattern: **`improve_writing`**
- Input: the draft as-is
- Improves sentence clarity, word choice, rhythm
- Returns a polished version

Apply the polish and present the revised draft.

---

## Stage 2 — Header Image

**Invoke:** `Skill("Media")` → Art workflow

Generate one editorial header image:

```
Style: Editorial essay illustration — think New Yorker meets Wired
Mood: [derived from essay tone]
Subject: [1-sentence visual concept from essay thesis]
Format: Wide editorial banner, 1792×1024
No text, no logos, no faces
```

Save to: `~/Downloads/dislatalk/{post-slug}/header.png`

Deliver the exact prompt used so Jonathan can regenerate variants.

---

## Output

```markdown
---
title: [Post Title]
slug: {post-slug}
date: [today's date]
readTime: [X min read]
wordCount: [N words]
---

[Polished essay, markdown-ready]
```

```
Header image: ~/Downloads/dislatalk/{post-slug}/header.png
Prompt used: [exact Art prompt]
```
