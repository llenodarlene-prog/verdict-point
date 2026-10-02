# Google Drive Source Sync

Source folder: https://drive.google.com/drive/folders/1KRh53FoFv8_nX3fBqYl84YGyZVjqD127

The manifest in `data/google-drive-sources.json` pins 45 current documents: 20 drafts, 20 research briefs, three planning documents, website copy, and the terms template. The folder now contains one more document than the previously described 44-file inventory.

The daily workflow runs at 06:17 UTC (2:17 PM Philippine time), or manually. It exports the approved documents as Markdown, imports draft bodies with exact tracker metadata, runs verification, and proposes a PR into main. It never merges, changes publication status, approves research, or supplies author identities. Existing publishable posts are protected from import overwrites. New documents require an explicit manifest update.

Activation requires a Google service account with the Drive API enabled and Viewer access to the exact folder. Store its JSON as the repository Actions secret `GOOGLE_SERVICE_ACCOUNT_JSON`. Enable the repository setting allowing GitHub Actions to create pull requests. No credentials have been supplied or committed; live automated synchronization has not been tested.

Run locally from the repository root: `node scripts/sync-google-drive.mjs`, then `node scripts/import-drive-drafts.mjs` and `npm run verify`.

Raw documents remain in `sources/google-drive`. Imported posts remain drafts and the structured evidence records remain scaffolded until their fields are reconciled against the research briefs and signed off. Import success is not editorial publication approval.
