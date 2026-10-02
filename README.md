# Verdict Point static website

Recovered source upload: 20 editorial drafts, 20 research sidecars, and 45 approved Google Drive source snapshots are included. These drafts are not publication-approved. Read `docs/RECOVERY-STATUS.md` for the recovery limits and `docs/GOOGLE-DRIVE-SYNC.md` to activate daily source updates.

Complete, tracker-driven repository for https://verdictpoint.org. The attached five-site tracker is preserved as structured data, and its brand identity, navigation, content plan, launch silo, and URLs are enforced by validation.

## Start

1. Read `CLAUDE.md`, `docs/GUIDELINES.md`, and `docs/SOURCE-OF-TRUTH.md`.
2. Run `npm ci` and `npm run verify`.
3. Run `npm run dev` for a local preview.
4. Scaffold only an approved tracker item with `npm run new:content -- article 1` or `npm run new:content -- blog 1`.

## Branch flow

Use `feature/*` → `staging` → `main`. Direct pushes to protected branches are blocked locally and in the documented GitHub rules. Staging deploys automatically; production requires the protected environment.
