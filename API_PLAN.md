# Analyze Comments API Plan

## Current status
- `/api/analyze-comments` is now connected to a real SCNet model through OpenAI Node SDK.
- The route still keeps the same request shape and response contract used by the frontend debug panel.
- The API is specialized for comment analysis, not a generic chat assistant.

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
