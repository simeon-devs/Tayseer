# Tayseer Reusable Claude Code Prompts

Save every prompt that works well here. Before starting any task check this file to see if a working prompt already exists. Copy, adjust, and use. Never retype prompts from scratch.

---

## How to Use This File

Copy the prompt text, adjust the module letter and name at the top to match your current module, paste into Claude Code. Every prompt starts with a context reminder because Claude Code sessions start fresh.

---

## Prompt Template: Start a New Module

Use this as the opening of every module prompt. Replace the placeholders.

```
I am building Tayseer, a sovereign AI housing arrears rescheduling system for a UAE government hackathon. Read CLAUDE.md, docs/ARCHITECTURE.md, docs/API_CONTRACTS.md, and PROGRESS.md before writing any code. Follow every rule in CLAUDE.md without exception.

I am now working on module [MODULE_ID] - [MODULE_NAME].

The module specification is in docs/TECHNICAL_SPEC.md under the section for [MODULE_ID].

Before writing any code confirm you have read all four documents above and summarise in two sentences what this module needs to deliver.
```

---

## Prompt: Debug a Failing Endpoint

```
I am working on Tayseer module [MODULE_ID]. Read CLAUDE.md before responding.

The following endpoint is failing. Here is the error:

[paste error here]

Here is the relevant code:

[paste code here]

Do not suggest changing the technology stack or the Pydantic schemas defined in docs/API_CONTRACTS.md. Fix the bug within the existing architecture.
```

---

## Prompt: Write Tests for a Module

```
I am working on Tayseer module [MODULE_ID]. Read CLAUDE.md before responding.

Write pytest tests for the following function or endpoint:

[paste function or endpoint here]

Requirements:
Use pytest with pytest-asyncio for async endpoints.
Test the happy path first.
Test at least two error cases.
Test at least one edge case.
Use the synthetic test data from data/cases.json where relevant.
Do not mock the database unless absolutely necessary. Use a test database with the same schema.
All test functions must have docstrings explaining what they test.
```

---

## Prompt: Review Module Code Before Marking Complete

```
I am finishing module [MODULE_ID] on Tayseer. Read CLAUDE.md before responding.

Review the following code for:
Compliance with the coding conventions in CLAUDE.md.
Correct use of the Pydantic schemas from docs/API_CONTRACTS.md.
Correct audit_log writes on every database mutation.
Missing error handling.
Any hardcoded values that should be environment variables.
Any calls to external APIs that would violate the sovereignty constraint.
Functions without type hints or docstrings.

Code to review:

[paste code here]

Do not suggest changing the technology stack. Only flag real issues.
```

---

## Prompt: Update PROGRESS.md After a Session

```
I just completed a work session on Tayseer module [MODULE_ID]. Update PROGRESS.md with the following information:

What was completed: [describe]
What was not completed: [describe]
Known issues found: [describe or none]
Next immediate task: [describe]

Also update the module status line in CLAUDE.md from [old status] to [new status].

Make sure the commit uses author simeon-devs and email simw4380@gmail.com.
```

---

## Prompt: Generate Synthetic Test Data

```
I am working on Tayseer module A1. Read CLAUDE.md before responding.

Generate [NUMBER] additional synthetic citizen rescheduling cases for data/cases.json. Each case must use realistic UAE Arabic names, realistic AED financial figures, and the exact JSON schema defined in the existing cases.json file.

Ensure the new cases include:
[describe the scenarios you need]

Do not duplicate any Emirates ID numbers from the existing cases.
```

---

## Prompt: Fix Arabic RTL Rendering

```
I am working on Tayseer module [MODULE_ID]. Read CLAUDE.md before responding.

The following Arabic text is not rendering correctly in [describe where: PDF template / Next.js page / etc].

Current behaviour: [describe]
Expected behaviour: RTL text aligned right, reading right to left, using Geeza Pro font on macOS.

Here is the current code:

[paste code here]

Fix the rendering using WeasyPrint with native HTML CSS direction rtl. Do not use arabic-reshaper or python-bidi in PDF templates. This is confirmed in DECISIONS.md.
```

---

## Prompt: Implement a New RAG Query

```
I am working on Tayseer module A2 or B2. Read CLAUDE.md and docs/ARCHITECTURE.md before responding.

I need to add a new query to the RAG pipeline. The query is:

[describe what you need to retrieve]

Use the existing retrieve_rules function pattern in backend/rag/retrieval.py as a template. Use LlamaIndex with the existing ChromaDB collection governance_rules. Use BGE-M3 embeddings via sentence-transformers. Return a list of strings.

Do not suggest changing the RAG stack. DECISIONS.md confirms ChromaDB and LlamaIndex are locked.
```

---

## Prompt: Add a New Hard Escalation Trigger

```
I am working on Tayseer module B2. Read CLAUDE.md and docs/ARCHITECTURE.md before responding.

I need to add a new hard escalation trigger to the decision engine. The trigger is:

[describe the condition]

Add this to the hard escalation checks in backend/engine/decision.py. This check must run before the LLM is called. If triggered it must set escalate_flag to true, set escalation_reason to a clear English explanation, write to the database, write to audit_log, and return the DecisionOutput immediately without calling the LLM.

Follow the existing pattern for the other hard escalation triggers in the same file.
```

---

## Prompt: Create a New Next.js Page

```
I am working on Tayseer module [C1 / C2 / C3]. Read CLAUDE.md and docs/API_CONTRACTS.md before responding.

Create a new Next.js page at the route [route]. This page is part of the [citizen portal / staff dashboard].

The page must:
[describe what it shows]
[describe what API calls it makes, use exact endpoint names from API_CONTRACTS.md]
[describe the bilingual behaviour]
[describe any mobile responsiveness requirements]

Use Tailwind CSS for styling. Do not use any CSS framework other than Tailwind.
Do not call any external APIs. All API calls go to NEXT_PUBLIC_API_URL.
Both Arabic and English modes must work correctly including RTL layout for Arabic.
```

---

## Prompt: Switch Inference from Local to RunPod

Use this prompt to prepare for the demo day switch.

```
I am preparing Tayseer for the live demo. Read CLAUDE.md before responding.

Help me verify and document the RunPod inference switch. I need:

1. The exact command to set OLLAMA_URL to the RunPod endpoint in the .env file.
2. The exact docker-compose command to restart only the backend container.
3. A test prompt I can run via curl to verify the RunPod model is responding correctly.
4. The reverse procedure to switch back to local Ollama if RunPod fails during the demo.

Format this as a numbered checklist I can follow under time pressure during the demo.
```

---

## Prompts That Worked Well

Add prompts here as you discover they produce good results. Include the date and what module they were used for.

[Add prompts here as the build progresses]
