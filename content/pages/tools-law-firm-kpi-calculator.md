---
title: Law Firm KPI Calculator for Utilization and Realization
seo_title: Law Firm KPI Calculator for Utilization and Realization
description: Calculate law firm KPIs from your own totals: utilization, realization, collection, billing yield, profit margin, revenue per lawyer, and intake costs.
slug: /tools/law-firm-kpi-calculator/
type: page
schema: WebPage
tool: law-firm-kpi
breadcrumb: true
parent: /tools/
parent_label: Tools
draft: false
modified: 2026-10-28
---

# Law Firm KPI Calculator for Utilization and Realization

Enter totals for one period, such as a year or a quarter, and see twelve law firm KPIs with the formula behind each. The calculator covers time, billing, profitability, and intake, and it works with whichever figures you have.

```tool
law-firm-kpi
```

## How the Calculator Works

Each section asks for a few aggregate figures and calculates the metrics that depend on them. Results update as you type. A metric that is missing a figure shows **Not available** and names what to add, rather than guessing. Billable hours appear in two sections and stay in sync.

Use figures from the same period and the same scope. Mixing a full year of hours with one quarter of collections, or one office's revenue with the whole firm's headcount, produces numbers that look precise but mean little.

## Definitions and Formulas

Firms define some of these metrics differently. These are the definitions the calculator uses.

### Time and Capacity

- **Utilization rate:** billable hours ÷ total work hours × 100. The share of working time recorded as billable.

### Billing and Collections

- **Realization rate:** billed value ÷ standard value × 100. Standard value is billable hours at standard rates, before write-downs.
- **Collection rate:** collected value ÷ billed value × 100.
- **Overall billing yield:** collected value ÷ standard value × 100. This combines realization and collection.
- **Effective collected rate:** collected value ÷ billable hours. The cash collected for each billable hour recorded.

### Profitability

- **Operating profit:** revenue − operating expenses.
- **Operating profit margin:** operating profit ÷ revenue × 100.
- **Revenue per lawyer or FTE:** revenue ÷ the headcount measure you choose. Use the same measure every time you compare.

### Marketing and Intake

- **Lead-to-consultation rate:** consultations ÷ leads × 100.
- **Consultation-to-client rate:** new matters ÷ consultations × 100.
- **Cost per lead:** marketing spend ÷ leads.
- **Client acquisition cost:** marketing spend ÷ new matters.

## Worked Example

A hypothetical four-lawyer firm records these totals for one year:

- 2,000 total work hours and 1,500 billable hours.
- $525,000 of time at standard rates, $483,000 billed, and $458,850 collected.
- $1,200,000 revenue and $780,000 operating expenses.
- 400 leads, 120 consultations, 48 new matters, and $36,000 of marketing spend.

The results are 75% utilization, 92% realization, 95% collection, an 87.4% overall billing yield, and an effective collected rate of $305.90 per billable hour. Operating profit is $420,000, a 35% margin, and revenue is $300,000 per lawyer. On intake, 30% of leads become consultations, 40% of consultations become clients, each lead costs $90, and each new client costs $750 to acquire.

These figures are invented to show the arithmetic. They are not benchmarks or typical results.

## No Good or Bad Ratings

The calculator does not grade results, because a useful benchmark depends on practice area, firm size, billing model, and region. Compare a result with your own earlier periods, or with a published survey whose definitions match yours. Billing and collection figures from industry surveys are collected in [law firm billing statistics](/law-firms/law-firm-billing-statistics/).

To work out the billable hours that feed these metrics, use the [billable hours calculator](/tools/billable-hours-calculator/).

## Frequently Asked Questions

### What Is a Good Utilization Rate for a Law Firm?

It depends on the role and the firm. A partner who manages the firm will record fewer billable hours than an associate. Compare like roles over the same period, and use a published benchmark only if it defines utilization the same way.

### What Is the Difference Between Realization and Collection?

Realization measures how much of the value of recorded time is billed. Collection measures how much of what was billed is paid. A firm can bill nearly all its time and still collect poorly, or the reverse.

### Should Owner Pay Count as an Operating Expense?

Firms handle it differently. Counting owner pay as an expense shows profit after paying the owners; leaving it out shows what is available to pay them. Pick one approach and use it consistently.

### Does the Calculator Store My Figures?

No. The calculator runs in your browser and does not send, save, or log your figures. It has no share link, because firm financial figures should not travel in a URL.

## Methodology

The formulas are standard ratios, written out in full above, and each is tested against the worked example in the calculator's automated tests. The calculator returns no result when a figure is missing or a divisor is zero.
