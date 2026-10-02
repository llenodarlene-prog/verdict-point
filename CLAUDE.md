# CLAUDE.md — Verdict Point

This is the source-of-truth repository for Verdict Point. Implement approved work without inventing brand facts, content evidence, publication dates, authors, or deployment credentials.

## Authority order

1. The current task packet.
2. The exact master, research, keyword, and drafting guidelines linked in `docs/GUIDELINES.md`.
3. `data/tracker-provenance.json` and tracker-derived files in `data/`.
4. `data/site.json`, `data/navigation.json`, and `data/site-architecture.json`.
5. Approved sources recorded in each content research record and `data/claims.json`.
6. Repository implementation docs.

If sources conflict, stop and report the exact conflict. The tracker controls title, primary keyword, cluster, status, URL slug, launch links, silo, SEO title, and meta description.

## Required sequence

1. Inspect the tracker record and status. Do not draft `Hold / SERP Review` or `Backlog` items without approval.
2. Confirm the exact URL, keyword, content type, evidence plan, silo role, and approved link targets.
3. Create a `feature/*` branch. Never push directly to `staging` or `main`.
4. Research before drafting. Complete every field in `docs/RESEARCH-RECORD.md`, including Ubersuggest retrievals (the required SEO platform; preserve historical Ahrefs data with its original attribution, but do not require new Ahrefs access), five competitor maps, statistics methodology, content gaps, value-add, and section-level evidence planning.
5. Use `npm run new:content -- <article|blog> <1-10>` for launch content. Do not hand-invent paths.
6. Keep `draft: true` until evidence, links, metadata, dates, images, disclosures, and all checks are complete.
7. Run `npm run verify`; do not weaken a failing check.
8. Review generated drift with `git diff --exit-code` after a clean build.
9. Open a PR into `staging`. Production requires human approval.

## Editorial rules

- Publishable pieces are 2,000–2,500 words; never exceed 2,600 without approval.
- Use the exact primary keyword in SEO title, meta description, H1, slug, introduction, and body. Use eight exact occurrences when the project rule applies.
- Articles place `Key Statistics and Data` immediately after the introduction. Blogs place `Key Takeaways` there and use `Frequently Asked Questions` before Resources.
- Use every approved launch target naturally and no unrelated launch-set links. Avoid mechanical anchors such as “click here,” “learn more,” “our guide,” “our page,” or “deep dive.”
- Use two or three reputable external links contextually before Resources. Put additional approved sources in Resources. Every cited URL must match a verified research source; Resources never substitutes for body citations.
- Preserve the real evidence year. Label estimates, forecasts, calculations, partial-year data, and sponsored studies.
- Never fabricate anecdotes, experience, testimonials, results, authors, credentials, contacts, prices, or claims.
- No em dashes. Target clear Grade 8–9 prose, short paragraphs, active voice, and varied sentence rhythm.
- High- and medium-severity repository AI kill-list entries are enforced. If a flagged term is technically necessary, add the exact term to the semicolon-separated `ai_exceptions` field and explain it in `ai_exception_reason`.

## Technical and deployment rules

- Canonical URL and `og:url` must exactly equal the production URL plus approved slug.
- Published articles require truthful `published` and `modified` ISO dates, Article schema, and a verified author.
- Every informative image requires a tracked asset, local file, dimensions, rights status, and useful alt text.
- Never commit secrets or generate SSH host keys dynamically. Use the pinned `SSH_KNOWN_HOSTS` environment secret.
- Do not edit `dist/`; it is deterministic output. Do not deploy around staging, checks, or production approval.
- Production requires the complete 20-item launch set plus every structured approval in `data/release.json`. Never replace approvals with prose edits or booleans alone.

## Completion report

Return: outcome; branch/commit; files and URLs changed; tracker record; research/evidence; checks and results; staging review; unresolved items; rollback ref; PR link.
