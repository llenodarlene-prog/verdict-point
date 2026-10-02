# Deployment

Create protected GitHub environments named `staging` and `production`. Require human reviewers for production.

Keep staging crawlable so page-level `noindex` can be read, but protect it with Hostinger access control or HTTP authentication. Do not rely on `robots.txt` as access control.

Environment variables:

- `STAGING_URL` for staging.
- `SITE_URL` for the canonical production URL (also expose it to staging smoke tests).

Environment secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_ROOT`, an isolated release root containing `releases/` and the `current` symlink
- `DEPLOY_SSH_KEY`
- `SSH_KNOWN_HOSTS`, pinned from an independently verified host key

Configure the Hostinger document root to point to `DEPLOY_ROOT/current`. Deployment uploads a new release directory, validates `index.html`, and atomically changes the symlink. It never runs `ssh-keyscan` in CI. Confirm symlink support on the hosting plan before first launch.

Production additionally runs `npm run release:check`. Set `data/site.json` to `launch_status: ready` only after all 20 required launch items pass content QA. Complete `data/release.json` with named, dated approvals for the verified contact address, privacy policy, staging review, and production change. The contact page must contain the approved `mailto:` address and the privacy page must contain the approved effective date.
