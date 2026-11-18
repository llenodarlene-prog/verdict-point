# Tools Roadmap (from the 40-tool brief, 18 November 2026)

Source: owner brief `VerdictPoint_40_Calculator_Research_and_Build_Brief.md` and `VerdictPoint_40_Tool_Keyword_Research_2026-11-18.csv` (Ubersuggest, US).
One tool per branch and PR. Each tool ships only after its own research, rule verification, tests, and `npm run verify`.

## How every tool is built

Each new calculator follows the existing pattern (`src/scripts/calculators/<id>-core.js` + `<id>-ui.js`, a partial, a page in `content/pages/tools-<id>.md`, a `toolSpecs` entry in `scripts/build.mjs`, a `data/tools.json` card, and `tests/<id>.test.mjs`).

Per tool:

1. **Keyword check:** Ubersuggest exact keyword plus 3 to 5 variants, and the top 10 SERP (do standalone calculators rank?).
2. **Rule sourcing:** every formula, table, cap, or rate traced to an official primary source opened live (statute, court, agency, LSAC). Record URL, effective date, review date in the page's Sources and Methodology and a `RULES_VERSION` constant.
3. **Core logic:** pure functions in `-core.js`, unit tests for normal, edge, and invalid inputs.
4. **UI:** client-side only, accessible output text, keyboard and mobile, print and copy, shareable URL state, no data sent anywhere.
5. **Page:** H1, how it works, worked example, limits, FAQ, sources; two contextual internal links; no fabricated ratings; WebApplication schema only with supported properties.
6. **No predictions:** settlement tools show itemized, illustrative ranges from the user's own numbers. No fixed pain-and-suffering multiplier, no "typical payout" values without valid data.
7. **Release:** feature branch, PR to staging, merge on green, release to main.

## Build order

### Lane 1: build first

| Order | # | Tool | Keyword (vol / SD) | Type | Key blocker to clear first |
|---:|---:|---|---|---|---|
| 1 | 2 | Court date calculator upgrade | court date calculator (3,600 / 11) | Upgrade `/tools/legal-deadline-calculator/` | Add court-date framing, multiple deadlines from one trigger, printable audit trail. Backward counting, weekends, and holidays already exist. |
| 2 | 1 | LSAT score calculator | lsat score calculator (8,100 / 15) | New | LSAC publishes conversion tables only for released PrepTests. Tool must use form-specific published tables, or show a clearly labelled range. Confirm on lsac.org first. |
| 3 | 5 | Wrongful termination settlement calculator | 720 / 11 | New | Back pay, front pay, mitigation offsets; federal damages caps (42 U.S.C. 1981a) cited; no outcome prediction. |
| 4 | 4 | Car accident settlement calculator | 1,000 / 12 | New, under `/tools/settlement-calculators/` hub | Itemized economic losses, user-entered non-economic range, fee and lien deductions. Links to the existing contingency fee calculator. |
| 5 | 9 | App privacy policy generator | 480 / 9 | New generator | Questionnaire drafted from FTC and state-law disclosure topics; editable output; strong "not legal advice" notice. |
| 6 | 21 | Permanent partial disability calculator | 590 / 20 | New, state-scoped | Only states whose PPD schedules we verify from the state agency; shared workers' comp engine with #6 and #23. |

### Lane 2: settlement expansion (after the hub exists)

#7 personal injury (hub tool), #6 workers' comp, #3 alimony (only states with published formulas), #8 dog bite, #10 EEOC (federal caps), #11 wrongful death, #22 knee injury (mode inside #7), #23 MMI (shares the #21 engine).

### Lane 3: legal business (mostly upgrades)

- #29, #30, #31, #33: add lead conversion, utilization, realization, and revenue-per-lawyer to the existing Law Firm KPI Calculator. No new URLs.
- #36: add ROI to the existing Legal Software Cost Calculator.
- #25: add an injury-attorney mode to the existing Contingency Fee Calculator.
- #12 probate attorney fee (with #24 California mode under Probate Code 10810), #15 law firm name generator, #14 NDA generator.
- Experiments, built only if SERP checks show room: #27 CAC, #28 marketing budget, #32 break-even, #34 legal AI savings.

### Lane 4: backlog

#13, #16, #17, #18, #19, #20, #26 (reframed as an eligibility and source tracker, no payout estimate), #35, #37, #38, #39, #40.

## Not built as separate URLs

#2 (upgrade), #22 (mode of #7), #24 (mode of #12), #25 (mode of contingency fee), #29, #30, #31, #33 (KPI calculator), #36 (software cost calculator).

## Keyword caveat

Rows 27 to 40 in the brief use generic proxy keywords. Their volumes are not forecasts for the law-specific tools and must not be summed.
