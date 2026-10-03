# Deployment

Create protected GitHub environments named `staging` and `production`. Require human reviewers for production.

Keep staging crawlable so page-level `noindex` can be read, but protect it with Hostinger access control or HTTP authentication. Do not rely on `robots.txt` as access control.

Environment variables:

- `STAGING_URL` for staging.
- `DEPLOY_PORT` for both environments: `65002` for the SSH account shown in the Hostinger screenshot. The scripts default to `65002`, validate the range, and use the same port for SSH, rsync, and rollback.
- `SITE_URL` for the canonical production URL (also expose it to staging smoke tests).

Environment secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_ROOT`, an isolated release root containing `releases/` and the `current` symlink
- `DEPLOY_SSH_KEY`
- `SSH_KNOWN_HOSTS`, pinned from an independently verified host key

Production uses the atomic release script and therefore expects the web server to serve `DEPLOY_ROOT/current`. Do not configure production until that layout or an equivalent production-safe document-root strategy is verified.

Hostinger staging uses `scripts/deploy-document-root.sh` because hPanel serves the fixed document root directly. The verified staging root is `/home/u285869133/domains/verdictpoint.org/public_html/staging`, exposed as `https://staging.verdictpoint.org`. This script uploads only the built `dist/` output and verifies the deployed `index.html`; it does not upload the repository source. The verified production document root is `/home/u285869133/domains/verdictpoint.org/public_html`, which currently contains a raw Git checkout from hPanel's Git deployment. Preserve production until staging review and a production backup/rollback strategy are complete.

## Hostinger Screenshot Findings

The October 2 screenshots show active SSH on port 65002. The Git deployment log selected `dependabot/github_actions/actions/checkout-7.0.1` rather than an approved deployment branch, and ran Composer with no Node build step. That log does not demonstrate a successful build of this repository: its deployable HTML is generated into `dist/` by `npm run build`, while the source repository has no root `index.html`. A source clone is not the build output. The preview shows HTTP 403; missing index/build output is a likely cause, but root mapping and permissions still need inspection.

Use one validated deployment path. The GitHub Actions path builds, verifies, checks release approvals, and transfers only `dist/`. A separate hPanel Git webhook that copies source files can bypass those gates and should not be pointed at production as a substitute.

To complete configuration, inspect the hosting plan, actual production and staging document roots, SSH public-key authentication, the independently verified SSH host key, and rsync/symlink availability. GitHub environment configuration is separate from workflow YAML. Neither secrets nor approvals have been provisioned by committing these files.

Production additionally runs `npm run release:check`. Complete `data/release.json` with named, dated approvals for the verified contact address, privacy policy, staging review, and production change. The contact page must contain the approved `mailto:` address and the privacy page must contain the approved effective date.

## Launch Policy

`data/release.json` (schema version 2) defines the launch in `launch_policy`. The release gate passes when:

- Every page in `required_pages` exists, is not a draft, and has no prelaunch language. Every navigation and footer page must be listed there, and every page in `legal_pages` must be complete.
- At least `minimum_published_blogs` (currently 1) blogs are published, and every published article or blog maps to exactly one tracker record.
- `npm run check:research` and `npm run check:content` pass. The gate runs both itself, so any published item that fails research, citation, content, SEO, or AI-language validation blocks the deploy.
- The production build (`BUILD_ENV=production npm run verify`) contains no draft page, link, listing, sitemap or RSS entry, or structured-data reference. Links to unpublished drafts render as plain text until that item publishes.

The original 10 articles and 10 blogs in `data/launch-content-plan.json` remain the editorial backlog. They are not a launch requirement, and drafts never block a release.

After launch, publish up to three completed articles or blogs per day, alternating articles and blogs: set `draft: false` with a verified author and dates, move its research record to `verified` with fact-check and research-QA sign-offs, then release through staging and production. Staging and local builds keep drafts and stay `noindex`; only a production build with `launch_status: ready` is indexable.
