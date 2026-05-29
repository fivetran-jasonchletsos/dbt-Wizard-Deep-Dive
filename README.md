# dbt Wizard — Deep Dive

A Sales Engineer field reference for **dbt Wizard**, the AI agent for dbt projects built by Fivetran that operates on dbt Labs' dbt.

Unlike a general AI coding agent that reads files and greps text, dbt Wizard operates on a live, queryable DAG graph (models, columns, tests, edges) plus the warehouse as one unified graph, via structured MCP tool calls backed by a local DuckDB index.

## What's inside

One page per set of functionality, each with the concrete capabilities, the `mcp__dbt_index__*` tools it calls, the natural-language prompts that invoke it, and a full prompt-to-response interaction transcript you can read statically or play back animated.

The 11 pages are grouped into five sections:

- **Start Here** — Why dbt Wizard Is Different
- **Graph & Index Intelligence** — DAG-Aware Intelligence, Live Project Index, Business Context
- **Warehouse & dbt Operations** — Warehouse Integration, dbt-Native Operations, Semantic Layer & Metrics
- **Autonomy & Guardrails** — Validation Pipeline, Agent Architecture, Skills System
- **Reference** — MCP Tool Reference (all 16 tools)

## Stack

Vite, React 19, React Router 7, Tailwind 4. Content is authored as JSON under `public/data/pages/` and rendered by a single page template plus a shared interaction player.

## Develop

```
npm install
npm run dev
npm run build
```

Deploys to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`.

---

An internal Fivetran SE enablement artifact. dbt Wizard is built by Fivetran and operates on dbt Labs' dbt.
