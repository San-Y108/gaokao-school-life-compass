# Analyze Comments API Plan

## Current status
- `/api/analyze-comments` is now connected to a real SCNet model through OpenAI Node SDK.
- The route still keeps the same request shape and response contract used by the frontend debug panel.
- The API is specialized for comment analysis, not a generic chat assistant.
- School detail page has formal module-level analysis entry (not only debug panel).
- Each module can trigger analysis on demand and display stable result/status UI.

## Runtime environment variables
Required:
- `SCNET_API_KEY`
- `SCNET_MODEL`

Optional:
- `SCNET_BASE_URL` (default: `https://api.scnet.cn/api/llm/v1`)

## Local development setup
1. Create `.env.local` in project root.
2. Configure:
   - `SCNET_API_KEY=...`
   - `SCNET_MODEL=...`
   - `SCNET_BASE_URL=https://api.scnet.cn/api/llm/v1` (or your provider-required variant)
3. Start app normally (`npm run dev`).

## Vercel deployment setup
1. In Vercel Project Settings -> Environment Variables, add:
   - `SCNET_API_KEY`
   - `SCNET_MODEL`
   - `SCNET_BASE_URL` (recommended explicit value)
2. Redeploy after saving variables.

## BaseURL path troubleshooting (OpenAI SDK + SCNet)
Default implementation uses:
- `baseURL = https://api.scnet.cn/api/llm/v1`

If API returns 404/405 or path mismatch errors:
1. Keep SDK call as `chat.completions.create(...)`.
2. Adjust only `SCNET_BASE_URL`:
   - Try `https://api.scnet.cn/api/llm/v1`
   - If provider already appends `/v1`, try `https://api.scnet.cn/api/llm`
3. Do not hardcode paths in source code; use env config for compatibility.

## Prompt and contract constraints
System/User prompt enforce:
- focus on student lived experience and制度体感
- do not shift focus to保研率/就业率/学科排名
- return strict JSON only
- selected evidence must be directly quoted from input comments

The response contract remains:
- `moduleSummary`
- `sentiment`
- `keyInsights`
- `suitableFor`
- `notSuitableFor`
- `selectedEvidence`
- `confidence`

## Detail page formal flow
1. User opens a school detail page and reads static module evidence first.
2. For a module, user clicks `生成分析` to call `POST /api/analyze-comments`.
3. Frontend renders states explicitly: empty / loading / success / error / retry.
4. On success, the module shows:
   - summary + sentiment + confidence
   - key insights
   - suitable / not suitable audience hints
   - selected evidence list
5. Existing debug panel is kept as a collapsed secondary entry for dev verification.

## Frontend cache strategy
- Cache layer: `sessionStorage` only (lightweight, per browser session).
- Cache key:
  - `school-comment-analysis:v1:${schoolId}:${moduleType}`
- Cache payload includes:
  - `commentsSignature` (derived from module evidence quotes)
  - `updatedAt`
  - `result` (full API response)
- If module evidence changed and signature mismatch happens, cached result is ignored.

## When users should re-run analysis
- A module result is old and user wants a fresh run after new comments are added.
- User sees low confidence (`level = low` or low score).
- Evidence matching hint shows partial mismatch (possible drift in generated quotes).
- Previous refresh failed and page is showing last cached successful result.

## Low-confidence explanation
- Low confidence usually means one or more of:
  - comment sample is too small
  - positive/negative signals are highly conflicting
  - evidence coverage is weak
- UI should explicitly mark low-confidence result as reference-only, not final judgment.

## Where to switch model in future
Only these knobs are needed:
1. `SCNET_MODEL` value
2. `SCNET_BASE_URL` value (if provider gateway changes)
3. Internal prompt wording in `src/app/api/analyze-comments/route.ts`

Frontend call path (`/api/analyze-comments`) can stay unchanged.

## Why analyze-comments before recommend-schools
1. Recommendation quality depends on stable evidence extraction.
2. Analyze layer gives explainable outputs (summary, evidence, confidence).
3. Doing recommendation first risks weak explainability and schema drift.
