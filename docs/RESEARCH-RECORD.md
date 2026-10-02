# Research record

Every launch draft has a JSON sidecar in `content/research/`. Normal verification checks every sidecar, including work attached to draft content.

Use the stages in order:

- `scaffolded`: generated structure only; blank research values are allowed, but malformed populated values fail.
- `researched`: evidence, keywords, sources, statistics, competitors, gaps, and claims are complete and valid.
- `planned`: researched requirements plus the complete content and link plan.
- `verified`: planned requirements plus valid fact-check and research-QA sign-offs. Publication requires this stage.

## Required evidence

- `research_brief`: purpose, audience, publication year, evidence period, and scope limits.
- `keyword_research`: the exact tracker keyword, live SERP intent check, verified Ahrefs and Ubersuggest retrieval dates, and short-tail, long-tail, commercial, problem, and question queries with volume, difficulty, CPC, intent, ranking URL, tool, and retrieval date.
- `sources`: at least three verified sources with title, publisher, type, dates, scope, method, and limitations.
- `statistics`: each measured claim with its source, true data year, geography, population, sample, denominator, unit, method, limitations, sponsorship, partial-year status, estimate status, and verification state. Use explicit truthful text such as `Not applicable` only when the field genuinely does not apply.
- `competitors`: five intent-matched organic pages with title, URL, publisher, format, date, headings, coverage, sources, data assets, link patterns, trust signals, strengths, and gaps.
- `content_gaps` and `value_add`: the defensible reason the new content deserves to exist.
- `plan`: reader title, SEO fields, search intent, supporting keywords, outline, evidence-to-section map, visuals, exact internal links, external citation opportunities, excluded claims, and drafting cautions.
- `claims`: every material factual claim and its verified source URL.
- `fact_check` and `qa`: named reviewers and ISO review dates.

## Citation rule

Every external URL in a publishable draft must appear in `sources` with `verified: true`. Two or three distinct source links must appear naturally in the body before `## Resources`; additional approved sources belong in Resources. Bare URLs fail because citations need descriptive Markdown anchors. Every verified claim source must be cited in the contextual body. A Resources list alone does not pass.

## Completion

Set the record to `verified` only after the research, competitor analysis, plan, fact check, and research QA are complete. URLs, dates, metric ranges, source relationships, and competitor uniqueness are validated. Do not invent unavailable metrics or mark a pending tool check as verified.
