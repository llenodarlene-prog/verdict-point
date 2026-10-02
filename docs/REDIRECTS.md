# Redirect Governance

Internal redirect destinations must resolve to a generated route. Missing targets, cycles, self-redirects, duplicate sources, unsafe paths, and collisions fail the build.

External redirects are denied unless the redirect record contains an `external_approval` object:

```json
{
  "from": "/old-partner-page/",
  "to": "https://approved.example/new-page/",
  "status": 301,
  "external_approval": {
    "approved": true,
    "host": "approved.example",
    "purpose": "Documented migration reason",
    "reviewer": "Named reviewer",
    "reviewed_at": "2026-09-23"
  }
}
```

The approved host must exactly match the destination host. The review date must be a valid, non-future ISO date. Do not use an approval record to bypass editorial or security review.
