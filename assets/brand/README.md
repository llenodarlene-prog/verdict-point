# Brand assets

Store only approved logo masters, favicons, and licensed font files here. Record every deployable derivative in `data/assets.json`. Do not redraw or invent a logo.

This README is source documentation. The build does not copy it, or any other `.md`, `.txt`, or `.docx` file, into `dist/assets/`.

## Approved masters

These PNG masters were copied unchanged from the local `Verdict Point Files/05 Assets/` source folder. That raw folder is ignored by Git and is never published. Each file is registered in `data/assets.json`.

| File | Source file | Size (px) | Intended use |
| --- | --- | --- | --- |
| `verdict-point-horizontal.png` | `Horizontal Logo.png` | 1672 x 941 | Website header logo. |
| `verdict-point-vertical.png` | `Vertical logo.png` | 1122 x 1402 | Centered layouts, such as hero blocks, footers, and stacked cards. |
| `verdict-point-icon.png` | `Icon.png` | 1254 x 1254 | Favicon and app icon source. Export smaller favicon sizes from this file. |
| `verdict-point-social.png` | `Socials Logo.png` | 1254 x 1254 | Profile image for social media accounts. |

## Not stored here

- `Brand Guidelines.png` is the visual reference for logo, color, and type usage. It lives at `docs/brand/verdict-point-brand-guidelines.png` and is not deployed.
- `Brand book.docx` stays only in the ignored raw-source folder. Do not copy it into `assets/`, `docs/`, or any other path.
