# Evaluation plan

The system has three failure surfaces: **wrong numbers** (bad SQL / bad join / bad metric choice),
**wrong words** (narrative not supported by the data) and **wrong behaviour** (unsafe, slow, or brittle under bad input).
Each is tested differently.

## 1. Accuracy of AI-generated insights

### 1.1 Golden set — execution accuracy
`evals/golden_set.json` holds questions, a hand-written **reference SQL**, and **expected values computed independently
with pandas** from `sample_data/`. For each question:

1. Call `POST /chat` (fresh conversation; for multi-turn items replay `conversation`).
2. Execute the returned `sql` and the `reference_sql` on the same Parquet files.
3. Compare result sets: same columns (by meaning, not alias), same rows, order-insensitive unless the question asks for a
   ranking, numeric tolerance 1e‑6 relative / 0.01 absolute for money.
4. Score: **EX** (exact match rate), **valid-SQL rate on first attempt**, **repair rate** (`meta.sql_attempts > 1`), refusal correctness.

Grow the set to 100+ questions covering: scalar, group-by, top‑N, joins across 2–4 tables, relative time, text filters on
exact category values, ratios/percentages, ambiguous metrics ("revenue"), follow-ups, and **unanswerable** questions.

### 1.2 Metric ambiguity
"Revenue" can be `orders.total_price`, `sum(quantity*price)`, or completed payments only. The planner must state its choice in
`assumptions`. Test that (a) the assumption is present and (b) the number matches *one* defensible reference. Track the
disagreement rate across paraphrases of the same question (consistency).

### 1.3 Narrative faithfulness
Automatically extract every number from `answer`; each must appear in the result rows (after rounding/formatting) or be
derivable by simple arithmetic (sum, share, difference). Anything else is a hallucination. Spot-check with an LLM judge
given `{question, rows, answer}` and verify the judge itself against ~50 human-labelled examples.

### 1.4 Chart correctness
Validate the `ChartPayload`: x/y keys exist, y numeric, time axis sorted, series ≤ cap, pie ≤ 8 slices; chart type fits intent
(trend → line/area, ranking → bar). Visual regression (Playwright screenshots) on a fixed set.

### 1.5 Regression gating
Run the golden set in CI against a pinned model and temperature 0; fail the build if EX drops more than 2 points. Re-run on
every prompt/model change and keep per-question history to see *which* questions flip.

## 2. Performance on large datasets

| Test | Method | Target (4 vCPU / 8 GB) |
|---|---|---|
| Ingestion throughput | Synthetic CSVs of 1M, 10M, 100M rows × 20 cols; time `processing → ready` | ≥ 1M rows/s per worker; peak RSS < `DUCKDB_MEMORY_LIMIT` + 500 MB |
| Upload | 500 MB file; verify streaming (flat memory in API) | no API memory growth |
| Query latency | 50 representative queries on the 100M-row table; p50/p95 of DuckDB time and of end-to-end `/chat` | DuckDB p95 < 5 s; end-to-end dominated by LLM |
| Concurrency | Locust/k6: 50 users, mixed uploads + chats; watch Redis/worker queue depth | no 5xx; rate limiter returns 429 cleanly |
| Cache | Repeat identical questions | second answer skips DuckDB (`meta.cached`) |
| Scaling | `--scale worker=1,2,4` | ingestion time scales ≈ linearly |
| Timeouts | Cross-join query | killed at `QUERY_TIMEOUT_SECONDS`, user sees a clear error |

## 3. Edge cases and robustness

**Data**: UTF‑8 BOM, UTF‑16, Latin‑1; `;` / tab / pipe delimiters; ragged rows; duplicate and blank headers; header-only and empty
files; all-null columns; mixed-type columns (95 % threshold behaviour); leading-zero IDs; currency/thousand separators;
ambiguous dates; very wide tables (500 cols); tables with no key; same file name twice; reserved-word table names (`order.csv`).

**Relationships**: orphan foreign keys (low `match_rate`), composite keys (not detected → LLM must be told via question), one-to-one tables.

**Security**: SQL-guard matrix (DDL/DML, `COPY`, `read_csv('/etc/passwd')`, `'file.csv'` literals, schema-qualified names,
multi-statement); **prompt injection inside CSV cells** ("ignore previous instructions…" — only category values and four samples
reach the prompt, and the guard is the real defence); oversized question; path traversal in filenames and ids.

**LLM failure modes**: invalid JSON, empty reply, hallucinated tables/columns (repair loop), refusal text, timeouts, provider 5xx
(`LLMError` → 502), narrator failure (answer degrades to table + chart).

**Infrastructure**: Redis down (`/health/ready` → 503), Kafka down (requests succeed, events dropped, logged), worker crash mid-ingestion
(task redelivered, output overwritten atomically), dataset expiry mid-conversation (UI resets cleanly), duplicate/parallel uploads.

**Multi-turn**: follow-up edits prior SQL; topic switch; follow-up after cache hit; conversation from another dataset is not reused.

## 4. Online monitoring
`chat.answered` / `chat.failed` events (Kafka → `/stats`) give: latency, repair rate, chart rate, cache-hit rate, failure codes.
Add a thumbs up/down in the UI keyed by `message_id`; every thumbs-down plus its SQL becomes a candidate golden-set item.
