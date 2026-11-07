---
title: eDiscovery Cost Calculator: Per-GB, Per-User, and Per-Case Pricing
seo_title: eDiscovery Cost Calculator: Compare Per-GB and Per-User Pricing
description: Compare eDiscovery pricing for one matter by hosted gigabytes, reviewer seats, or a per-case tier. Add processing fees and culling to see the total cost.
slug: /tools/ediscovery-cost-calculator/
type: page
schema: WebPage
tool: ediscovery-cost
breadcrumb: true
parent: /tools/
parent_label: Tools
draft: false
modified: 2026-11-07
---

# eDiscovery Cost Calculator: Per-GB, Per-User, and Per-Case Pricing

Enter your data size, how long the matter stays hosted, and how many people will review it. Then add the rates from each quote. The calculator shows which pricing model costs least for this matter and how much culling saves.

```tool
ediscovery-cost
```

## How the Calculator Works

eDiscovery vendors usually price in one of three ways. Per-GB pricing charges for the data you host each month, often with a processing charge when data first loads. Per-user pricing charges for each reviewer seat, often with no hosting charge. Per-case tier pricing charges a set monthly price for a data tier.

The same matter can cost very different amounts under each model. A small team with a lot of data may do better per user, while a short, small matter may do better on a tier.

Culling matters most in the per-GB model. The calculator lets you remove a share of the data after the first month, as you would after early case assessment.

## Formulas

- **Per GB:** starting data × hosting rate for month 1, then culled data × hosting rate for each later month, plus starting data × processing rate.
- **Per user:** price per user × reviewers × months.
- **Per-case tier:** tier price × months.
- **Cost per GB:** total cost ÷ starting data.

## Worked Example

A hypothetical matter starts with 50 GB, stays hosted for six months, and needs three reviewers. The team culls 40% of the data after month one. These rates are invented to show the arithmetic.

| Model | Rates | Total |
| --- | --- | --- |
| Per GB | $15 per GB per month, $25 per GB processing | $4,250 |
| Per user | $300 per user per month | $5,400 |
| Per-case tier | $600 per month | $3,600 |

Under per-GB pricing, month one hosts 50 GB for $750 and months two to six host 30 GB for $450 each, or $2,250. Processing adds $1,250. Without culling, the per-GB total would rise to $5,750.

## Reading the Results

Run the matter you have now, then rerun it with more data or more months. The cheapest model often flips as a matter grows or drags on.

Ask each vendor what the quote leaves out. Exports, extra processing, AI features, and long-term storage can sit outside the base rate.

## Limits of the Model

- One culling step happens after month one. Real matters may add and remove data several times.
- The per-user model assumes the same reviewer count every month.
- Professional services, productions, and project management fees are not included.
- Tier prices assume your data stays inside the tier for the whole period.

## Frequently Asked Questions

### Which eDiscovery Pricing Model Is Cheapest?

It depends on the matter. Per-GB pricing favors small data sets and aggressive culling, per-user pricing favors steady teams with large data, and tiers favor small, predictable cases.

### How Much Does Culling Save?

In a per-GB model, every gigabyte removed stops costing hosting fees from the next month. The calculator shows the effect when you enter a culling share.

### Does the Calculator Store My Figures?

No. It runs in your browser and does not send, save, or log what you enter.

## Methodology

The formulas are written out above, and the worked example is checked in the calculator's automated tests. Results that would divide by zero show Not available instead of a number.
