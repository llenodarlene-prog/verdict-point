---
title: Payment Processing Fee Calculator for Law Firms
seo_title: Law Firm Payment Processing Fee Calculator: Cards and eCheck
description: Estimate what card and eCheck payments cost your law firm each month, find your effective rate, and see the saving if more clients pay by bank transfer.
slug: /tools/payment-processing-fee-calculator/
type: page
schema: WebPage
tool: payment-processing-fee
breadcrumb: true
parent: /tools/
parent_label: Tools
draft: false
modified: 2026-11-07
---

# Payment Processing Fee Calculator for Law Firms

Enter how much your clients pay by card and by eCheck, the rates in your processor agreement, and any monthly platform fee. The calculator shows your monthly and yearly cost, your effective rate, and what changes if more clients pay by bank transfer.

```tool
payment-processing-fee
```

## How the Calculator Works

Card processing usually has two parts: a percentage of each payment and a small fixed fee per transaction. eCheck pricing is often lower and may be a flat percentage. Many payment platforms also charge a monthly account fee.

The calculator applies your rates to your monthly volume. It then tests a shift: if a share of your card volume moved to eCheck, what would the month cost?

Use the rates in your own agreement. The calculator does not supply processor rates, and rates vary by plan, card type, and contract.

## Formulas

- **Card fees:** card volume × card rate + number of card payments × fixed fee.
- **eCheck fees:** eCheck volume × eCheck rate + number of eCheck payments × fixed fee.
- **Total monthly cost:** card fees + eCheck fees + monthly platform fee.
- **Effective rate:** total monthly cost ÷ total money collected × 100.
- **Shift scenario:** moves the chosen share of card volume and card payments to eCheck pricing.

## Worked Example

A hypothetical firm collects $12,000 a month across 40 card payments and $8,000 by eCheck. Its agreement charges 2.99% plus $0.30 per card payment, 1% per eCheck, and $19 a month for the platform.

| Item | Calculation | Amount |
| --- | --- | --- |
| Card fees | $12,000 × 2.99% + 40 × $0.30 | $370.80 |
| eCheck fees | $8,000 × 1% | $80.00 |
| Platform fee | Flat | $19.00 |
| Total per month | Sum | $469.80 |

The effective rate is about 2.35% of the $20,000 collected. If a quarter of card volume moved to eCheck, the month would cost $407.10, a saving of $62.70, or about $752 a year. These figures are invented to show the arithmetic.

## Reading the Results

Card fees are usually the largest line, often many times the platform fee. That means a cheaper subscription matters less than how your clients choose to pay.

The effective rate is the cleanest single number for comparing processors. Run the calculator once for each quote, with the same volumes, and compare the totals.

To see how payment costs sit next to software licenses, use the [legal software cost calculator](/tools/legal-software-cost-calculator/).

## Limits of the Model

- One card rate covers every card. Real pricing can differ for rewards, business, and international cards.
- Chargebacks, refunds, and pass-through network fees are not included unless you add them to a rate.
- Volume stays the same every month. Enter an average month, or run separate busy and quiet months.
- Who may pay a processing fee, and from which account, depends on trust accounting rules in your state. Check them before you change how fees are charged.

## Frequently Asked Questions

### How Do I Find My Effective Processing Rate?

Divide everything you paid in processing and platform fees for a month by the total you collected that month, then multiply by 100. The calculator does this for you.

### Why Do eCheck Payments Cost Less?

Bank transfers usually carry lower processing charges than card payments. Check your own agreement, because pricing varies by provider.

### Does the Calculator Store My Figures?

No. It runs in your browser and does not send, save, or log what you enter.

## Methodology

The formulas are written out above, and the worked example is checked in the calculator's automated tests. Results that would divide by zero show Not available instead of a number.
