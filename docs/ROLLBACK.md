# Rollback

Identify a known-good directory under `DEPLOY_ROOT/releases/`, verify its build manifest, then atomically repoint `DEPLOY_ROOT/current` to that release through an approved production workflow. Do not rewrite Git history or delete the failed release during incident response.

After restoration, open a corrective pull request and record the failure cause, affected release, restored release, checks, and follow-up owner.
