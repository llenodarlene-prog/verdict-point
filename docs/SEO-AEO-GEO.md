# SEO, AEO, and GEO on Verdict Point

This file applies Darlene Aberin's "SEO, AEO & GEO Site SOP" (October 18, 2026) to this repository. Where the SOP and a repository rule differ, the repository rule is listed and wins until the owner changes it.

## Silo Model

Topic hubs are the category pages (`/legal/`, `/law-firms/`, `/legal-tech/`, `/legal-marketing/`, `/legal-business/`). Each post's silo, role, pillar, and approved link targets live in `data/interlinking-plan.json` (`launch_silo`, `silo_role`, `primary_silo_hub`, `approved_outbound_targets`).

| Pillar (role: Hub) | Spokes |
| --- | --- |
| `/legal-marketing/law-firm-marketing-statistics/` | Website, SEO, social, client acquisition, and Blogs 11, 13–20 |
| `/legal-tech/legal-technology-statistics/` | AI in law firms, vendor blogs, firm-size bridge, Blog 12 |
| `/law-firms/law-firm-profitability-statistics/` (draft) | Billing statistics, LawPay |

Only body links count. Hub cards, menus, and Resources lists are navigation.

## Automated Checks

| SOP rule | Where it is enforced |
| --- | --- |
| Spoke links up to its pillar; pillar links down to every published or scheduled spoke; every post has at least 2 inbound body links | `npm run check:silos` (`scripts/check-silos.mjs`) |
| Exact approved internal links per post | `check-content.mjs` and `check-research.mjs`, against `approved_outbound_targets` |
| One H1, no skipped heading levels | `check-discoverability.mjs` |
| Organization, WebSite, WebPage, BreadcrumbList on every article; no orphaned article | `check-discoverability.mjs` |
| HTTPS, canonical, noindex rules, sitemap, broken internal links | `build.mjs` and `check.mjs` |
| Images: registered asset, dimensions, alt text | `check-content.mjs` against `data/assets.json` |

## Schema

The build writes one connected JSON-LD `@graph` per page from front matter:

- **Article or blog:** Article or BlogPosting, WebPage (`isPartOf` the site and its topic hub), BreadcrumbList, FAQPage built from the FAQ section, Organization, WebSite. The author is the verified Person recorded in front matter.
- **Topic hub:** CollectionPage with `hasPart` listing every live post in the silo, BreadcrumbList, Organization, WebSite. Scheduled posts join on their publish date.
- **Other pages:** WebPage, BreadcrumbList, Organization, WebSite.

After any template change, test one article and one hub in Google's Rich Results Test.

## AEO and GEO

- `/llms.txt` is generated from the same live set as the sitemap, grouped by topic hub, with each post's title, URL, and meta description.
- `robots.txt` names the sitemap in production; staging disallows crawling.
- Writing rules (answer first, question-shaped FAQs, tables for comparisons, cited facts) follow the SOP and `CLAUDE.md`.

## Where the Repository Differs From the SOP

| SOP | Repository rule |
| --- | --- |
| At least 3 external links | `CLAUDE.md`: two or three contextual external links before Resources |
| Publish dates in UTC, nightly run at 00:07 UTC | Dates in Asia/Manila (`launch_policy.publish_timezone`); the scheduled publish runs at 22:05 UTC (06:05 Manila) |
| Meta description 160 characters or fewer | Tracker-controlled. Article 4's approved description is 169 characters, which the owner can shorten in the tracker |
