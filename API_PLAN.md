# Comment Analyze API Plan

## Current status (this round)
- `POST /api/analyze-comments` is implemented with mock logic.
- Input and output contracts are already stable enough for model replacement.
- Frontend debug call path is wired in school detail page.

## What to replace for real model integration
1. Keep `src/app/api/analyze-comments/route.ts` as the API entry.
2. Replace only the internal mock analyzer function (`analyzeCommentsMock`) with a real LLM caller.
3. Keep request validation and response shape unchanged to avoid frontend rewrites.

## Suggested environment variables (future)
- `OPENAI_API_KEY`: model provider key.
- `OPENAI_BASE_URL` (optional): custom gateway or proxy endpoint.
- `ANALYZE_COMMENTS_MODEL`: model id for comment analysis.
- `ANALYZE_COMMENTS_TIMEOUT_MS` (optional): request timeout budget.

## Frontend impact
- Current frontend only calls `/api/analyze-comments`.
- After model integration, frontend call layer can remain unchanged unless:
  - you add streaming responses,
  - you add async job mode,
  - or you split analysis into multi-step review endpoints.

## Why analyze-comments first, then recommend-schools
1. `analyze-comments` creates the core evidence layer (summary, sentiment, insights, evidence selection, confidence).
2. Recommendation quality depends on evidence quality and taxonomy consistency.
3. Building recommendation first risks “opinion-first, evidence-later” drift and weak explainability.

## Guardrails before real model
- Keep `moduleType` and `taxonomyKey` mapping one-to-one.
- Keep `structuredFacts.key` stable across schools.
- If model proposes new keys, return them as warnings first instead of writing directly into production data.
