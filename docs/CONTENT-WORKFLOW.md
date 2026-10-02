# Content workflow

1. Select an approved tracker row and verify its current status.
2. Read every source in `docs/GUIDELINES.md`, then the research brief and source plan. Record evidence limits before outlining.
3. Scaffold the exact launch record and its research sidecar with `npm run new:content -- <article|blog> <number>`.
4. Complete `docs/RESEARCH-RECORD.md`: primary evidence, full statistic context, Ubersuggest retrievals (historical Ahrefs data kept with its attribution), five ranking competitors, content mapping, gaps, value-add, and the section evidence plan.
5. Draft to the article or blog structure in `CLAUDE.md`.
6. Place only tracker-approved silo links, where the surrounding sentence already supports the anchor. Place two or three verified source links contextually before Resources and put other approved sources in Resources.
7. Move the research record through `scaffolded`, `researched`, `planned`, and `verified`. `npm run check:research` validates every stage even while the article or blog remains a draft.
8. Complete the research sidecar, fact-check every material claim, register all images in `data/assets.json`, complete verified author and date fields, then run `npm run verify`.
9. Review staging before production approval.

Drafts with `draft: true` are excluded from production. “Ready for Source Verification” means the brief is ready, not that its evidence has already been verified.

The production gate requires all 20 launch IDs and the structured approvals in `data/release.json`. Removing warning copy cannot satisfy that gate.
