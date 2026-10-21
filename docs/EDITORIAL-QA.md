# Editorial QA SOP

Owner standard (Darlene Aberin, 2026-10-21) for Verdict Point, Fin Loom, Stack Row, Arizona Direct, and Wellness Signal. Applies to website blogs, articles, PR blogs, and every platform version. US English.

**Core standard:** every article answers the reader's question, provides verified information, and adds useful value beyond existing coverage. Style, formatting, and keyword placement cannot compensate for missing substance.

## Checks

1. **Assignment:** reader question, audience and intent, article type, essential information, primary keyword, brand requirements, link targets, and the article's contribution beyond existing coverage. The draft must not drift to another topic.
2. **Direct answer:** the central answer in the opening paragraph or first substantive section (normally within 100 words). Each section opens with the answer its heading promises, roughly 40 to 60 words where helpful, understandable on its own.
3. **Title promise:** statistics pieces present verified figures with context; research pieces present findings and limits; explanations define and distinguish; how-tos give usable steps; comparisons use consistent criteria; reviews separate documented specifications from hands-on experience; news separates confirmed from unconfirmed.
4. **Evidence:** for each material claim, the original source and passage, date and period, population, sample, geography, units, denominator, definitions, method, limits, and claim type (finding, survey response, estimate, forecast, calculation, interpretation). Primary sources first. AI answers, search snippets, and competitor summaries are never verification.
5. **Interpretation:** percent change versus percentage points, revenue versus profit, access versus outcomes, association versus causation. Compare only compatible figures. Show inputs and formulas. Label forecasts, estimates, and hypotheticals. Keep qualifications beside the claim.
6. **Added value:** at least one substantial contribution (compatible comparison, clearer mechanism, transparent calculation, resolved conflict, evidence-based framework, or supported example). Identify the passage.
7. **No invention:** no fabricated statistics, studies, quotes, interviews, testing, visits, case studies, clients, outcomes, authors, credentials, or reviews.
8. **Internal links:** written for the explanation first, descriptive anchors, verified destination, a stated reader benefit. No sentence or topic shift exists only to carry a link. No wrappers such as "Verdict Point examines this in," "read our guide," "for a deep dive," or "this breakdown covers." Three-part test: the sentence works without the link, the anchor describes the destination, and the reader benefit is specific.
9. **Verdict Point brand check:** verify jurisdiction and effective dates; distinguish laws, proposals, opinions, and operational advice; never invent attorney review.
10. **Keywords:** primary keyword once in the main heading, twice in the body including the introduction, unless the brand or brief sets a count. Natural placement, never bolded.
11. **Language and structure:** US English, brand voice and banned words, no em dashes or filler, lists for steps, tables for comparisons, FAQs only when useful, heading introductions and list lead-ins kept, and tables, captions, metadata, and alt text matching verified claims.
12. **Status:** PASS (all checks complete), REVISE (correctable problems), HOLD (essential evidence missing, contradicted, or unable to support the angle). Style alone never earns PASS. When drafting or rewriting, fix failures before delivery; for audit-only requests, report without rewriting.

## How It Applies in This Repository

Repository rules in `CLAUDE.md` and the automated checks set stricter or brand-specific values where they apply:

- **Keyword count:** Verdict Point posts use the exact primary keyword at least eight times (checked by `check-content.mjs`), which satisfies the SOP's heading-plus-two minimum.
- **Internal links:** the tracker's approved link set and the hub-and-spoke silo rules (`docs/SEO-AEO-GEO.md`) are the brand-specific instruction that overrides the SOP's default of two internal links.
- **Evidence:** every cited source is opened live and checked claim by claim before sign-off; unverifiable claims are cut or replaced.
