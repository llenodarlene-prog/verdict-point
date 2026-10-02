# Local file import comparison

Run on 2026-10-02 on branch `local-file-import` (HEAD `954a317`). Source: the ignored local folder `Verdict Point Files/` (45 DOCX documents, not counting `Brand book.docx`). No repository content was overwritten.

## Method

- Each DOCX was paired with a repository file by its exact title in `data/google-drive-sources.json`. All 45 titles matched exactly one entry, and all 45 manifest entries matched a DOCX.
- Text from `word/document.xml` was compared word by word against the matching `sources/google-drive/*.md` file. Articles and blogs were also compared against `content/posts/`.
- Formatting that the two formats store differently was ignored: Markdown markup, list auto-numbering, bullets, table pipes, and link syntax.
- Every remaining difference was then sorted by cause. Any URL that the DOCX showed as plain text was checked against the repository file to confirm the same link target is there.
- Research briefs were checked against `content/research/*.json` for their record status and the tracker keyword.

## Summary

| Result | Count |
| --- | --- |
| Wording matches `sources/google-drive/` exactly | 45 of 45 |
| Real wording differences | 0 |
| DOCX files that look newer by content | 0 |
| DOCX files with no matching repository file | 0 |
| Duplicates (DOCX, `sources/google-drive/`, `content/`) | 0 |

**Timestamps.** Every DOCX has internal zip timestamps of `2026-10-02 05:29` and no `docProps/core.xml`. That means they are Google Docs exports from today, so their file dates show when they were exported, not when they were edited. The Drive `modified_time` values in the manifest run from 2026-09-22 to 2026-09-23. Because the wording matches, no DOCX contains newer content.

## Per-document results

### Strategy and website copy (5)

| DOCX | Repository file | Result |
| --- | --- | --- |
| First 10 Articles + 10 Blogs URL & Internal Linking Plan | `sources/google-drive/1c9N3u…` | Exact match |
| First 20 Research & Content Planning Index | `sources/google-drive/1yqreH…` | Exact match |
| SEO GEO AEO Editorial Brief | `sources/google-drive/1XqjdW…` | Exact match |
| Terms and Conditions Page | `sources/google-drive/1pGbMr…` | Exact wording. The Markdown version has 21 explicit section numbers that the DOCX stores as auto-numbering. **There is no matching page in `content/pages/`** (no `terms.md`). |
| Website Copy + Section Layout - Final | `sources/google-drive/1fsvwC…` | Exact match. It is the source copy for the 10 files in `content/pages/`, which are adapted from it rather than verbatim sections. |

### Article final drafts (10)

| DOCX | Against `sources/google-drive/` | Against `content/posts/` |
| --- | --- | --- |
| Article 01 | Exact | Post drops the DOCX header block, the in-document research notes (SERP map, content gap, source reconciliation; about 1,350 words), and the end marker. The body text is identical. |
| Article 02, 03 | Exact wording. The DOCX shows 6 link URLs as visible text; the same targets are Markdown links in the repo file. | Same link formatting, plus the header and end marker removed. The body text is identical. |
| Article 04–10 | Exact | Exact |

### Blog final drafts (10)

| DOCX | Against `sources/google-drive/` | Against `content/posts/` |
| --- | --- | --- |
| Blog 01 | Exact | Post drops the DOCX header, the planning notes (search intent, cost freshness, review-site notes; about 1,020 words), and the end marker. The body text is identical. |
| Blog 02–07 | Exact wording. The DOCX shows 5 to 8 link URLs as visible text, and every one is a Markdown link target in the repo file. | Same link formatting, plus the header and end marker removed. The body text is identical. |
| Blog 08–10 | Exact | Post moves the SEO title, meta, and slug header into front matter. The body text is identical. |

### Research briefs (20: A01–A10, B01–B10)

All 20 have exact wording against `sources/google-drive/`. The only difference is 7 section numbers each, which the DOCX stores as auto-numbering.

Each brief matches a file in `content/research/` (`article-N.json`, `blog-N.json`). Each brief contains its record's tracker primary keyword. All 20 JSON records are still `scaffolded`, so the brief's evidence has **not** yet been transferred into the structured research records. That is pending work, not a conflict.

## Not compared

- `Brand book.docx` was excluded as instructed and stays only in the ignored folder.
- The 5 PNG files are covered in `assets/brand/README.md`. The four deployable logos are in `assets/brand/`; the brand-guidelines reference image is in `docs/brand/` and is not deployed.
