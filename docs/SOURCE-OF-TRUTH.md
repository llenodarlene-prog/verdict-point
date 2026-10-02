# Source of truth

The workbook snapshot is identified by `data/tracker-provenance.json`. Its complete brand slice is in `data/source/tracker-brand.json`; global source tabs used by the workflow are also retained in `data/source/`.

Operational files:

- `data/site.json`: public identity, domain, fonts, palette, and provenance hash.
- `data/site-architecture.json` and `data/navigation.json`: exact approved public pages and menu placement.
- `data/content-plan.json`: all 100 brand records.
- `data/launch-content-plan.json`: the first 10 articles and first 10 blogs.
- `data/interlinking-plan.json`: the 20-record launch silo plan.
- `data/release.json`: exact required launch IDs and structured contact, privacy, staging, and production approvals.
- `data/brand-strategy.json`, `data/ai-kill-list.json`, and `data/research-summary.json`: voice and research constraints.

Do not silently edit tracker-derived values. Refresh the extraction from the current workbook, inspect the diff, regenerate, and run the complete verifier.
