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

The production gate requires the structured approvals and `launch_policy` in `data/release.json`: complete core and legal pages plus at least one published blog. The 20 launch IDs are the editorial backlog and publish up to two per day after launch; each must pass every check before it goes live. Removing warning copy cannot satisfy that gate. See `docs/DEPLOYMENT.md` for the full launch policy.

## Scheduling posts

1. Finish the post as usual: verified research record, named fact-check and QA sign-off, featured image, and `npm run verify`.
2. Set `draft: false` and set `published` and `modified` to the go-live date (`YYYY-MM-DD`).
3. Merge through `staging` into `main` with production approval. Staging previews the post right away; production hides it until its date.
4. The production deploy runs every day at 06:05 Asia/Manila (`launch_policy.publish_timezone` in `data/release.json`) and publishes every post whose date has arrived. It can also be run by hand from the Actions tab.
5. `check-content` fails if two articles or two blogs share a date on or after `launch_policy.cadence_start_date`, so the queue keeps to one article and one blog per day.

To preview what production will show on a given day, run `PUBLISH_DATE=2026-10-20 BUILD_ENV=production npm run build`.
