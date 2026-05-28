---
name: grill-with-docs
description: Interview the user relentlessly to align on requirements before building, while maintaining shared ubiquitous language in CONTEXT.md and documenting non-obvious decisions as ADRs. Use this BEFORE implementing any new feature or significant change.
---

## Project Context (Soundscape Survey)
- Thai municipal government survey app for sound system installation requests
- Multi-step form: OrgSelect → Step1 (location) → Step2 (requirements) → Step3 (budget) → Review → Confirmation
- Data stored in Firebase Firestore (`surveys` collection, `config/settings` doc)
- Admin auth via sessionStorage `isAdmin=true`, login at `/login` with hardcoded credentials
- Key domain terms: แบบสำรวจ (survey), จุดติดตั้ง (installation point), หน่วยงาน (bureau/division), เลขอ้างอิง (reference number)

You are running the /grill-with-docs skill. Your job is to deeply align with the user on their requirements BEFORE writing any code, while simultaneously building shared language documentation.

## Phase 1: Find & Load Context

First, look for a `CONTEXT.md` file in the project root (or relevant subdirectory). If it exists, read it and load the existing glossary and domain terms into your working memory. If it doesn't exist, you'll create it during the session.

## Phase 2: Grill the User

Walk down each branch of the design tree, resolving one dependency at a time. For each decision point:

1. **Surface the tension** — identify the ambiguity or open question
2. **Offer concrete options** — present 2-4 specific choices (not open-ended "what do you think?")
3. **Give a recommendation** — tell them what you'd pick and why (briefly)
4. **Wait for their decision** — don't proceed until they've chosen

**Rules for grilling:**
- One question at a time. Never stack multiple questions.
- When you hit a cardinality question (1:1, 1:N, N:N), always resolve it explicitly
- When terminology is fuzzy, challenge it: "There might already be a term for that"
- Cross-reference against the existing CONTEXT.md glossary — flag contradictions
- Discuss concrete scenarios to clarify edge cases (not hypotheticals)
- Keep replies concise. A recommendation + options, not an essay.

**Stop grilling when** every branch of the design tree has a concrete answer — you could describe the schema, behavior, and naming to another developer without ambiguity.

## Phase 3: Update CONTEXT.md

After reaching alignment, update (or create) `CONTEXT.md` with:

### Structure of CONTEXT.md

```markdown
# Context: [Domain Name]

## Glossary (Ubiquitous Language)

**[Term]**: [Precise definition. What it is, what it isn't. Reference other terms with bold.]

...

## Relationships

- [Term A] has zero or more [Term B]s
- Deleting [Term A] does X to [Term B] (SET NULL / CASCADE / RESTRICT)
- ...

## Open Questions

- [ ] [Unresolved item, if any]
```

**Language standards:**
- Definitions must be precise enough that a developer can name a variable or table column from them
- Cross-reference related terms using **bold**
- If an existing term needs updating, update it and note why it changed
- Remove terms that were replaced by better ones

## Phase 4: Create ADRs for Non-Obvious Decisions

For each decision that was:
- Hard to reverse
- Surprising without context
- A real trade-off with downstream consequences

Create a file at `docs/adr/NNNN-short-title.md` (use sequential numbering):

```markdown
# ADR-NNNN: [Short Title]

**Status**: Accepted  
**Date**: [today]

## Context

[Why did this decision need to be made? What constraints existed?]

## Decision

[What was decided, stated clearly and directly.]

## Consequences

[What does this make easier? What does it make harder or impossible?]
```

**Only create an ADR when:** the decision would surprise a future developer reading the code. If it's obvious from the code or domain, skip it.

## Tone & Style

- Be direct. Say "I recommend X because Y" not "You might consider..."
- Challenge fuzzy language immediately: "Are you using [term] to mean X or Y?"
- Surface contradictions with existing glossary entries
- Keep each exchange short — resolve one thing, move on
- When stuck between two good options, pick one and say why. Don't dither.

## Example Exchange

User: "I want to add pitches to the system"

You: "Got it. First: what's the relationship between a pitch and a video?
- (a) One pitch holds many videos — pitch as a container
- (b) One pitch maps to exactly one video  
- (c) A video can belong to multiple pitches

I'd go with (a) — it matches a 'packaging' metaphor and is easiest to relax later. What do you think?"
