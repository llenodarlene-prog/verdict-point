---
title: Contingency Fee Calculator: Attorney Fee and Client Net
seo_title: Contingency Fee Calculator: Attorney Fee, Costs, and Client Net
description: Break a settlement into the attorney's contingency fee, case costs, liens, and the client's net, with costs taken out before or after the fee is calculated.
slug: /tools/contingency-fee-calculator/
type: page
schema: WebPage
tool: contingency-fee
breadcrumb: true
parent: /tools/
parent_label: Tools
draft: false
modified: 2026-11-07
---

# Contingency Fee Calculator: Attorney Fee and Client Net

Enter the gross settlement, the fee percentage, case costs, and any liens. The calculator shows the attorney fee, what is repaid from the recovery, and the estimated amount left for the client. It also shows how much the order of deductions changes the result.

```tool
contingency-fee
```

## How the Calculator Works

In a contingency arrangement, the lawyer is paid a percentage of what the client recovers. Case costs that the firm advanced, such as filing fees and expert charges, are usually repaid from the recovery too.

The order matters. If costs come out before the fee is calculated, the fee is a percentage of a smaller amount. If costs come out after, the fee is a percentage of the full recovery. Your fee agreement should say which method applies.

Liens, such as medical liens, are paid from the recovery as well. The calculator subtracts them last.

## Formulas

- **Fee base:** gross recovery minus case costs when costs come out first, or the full gross when they come out after.
- **Attorney fee:** fee base × fee percentage.
- **Net to client:** gross recovery − attorney fee − case costs − liens.
- **Client share:** net to client ÷ gross recovery × 100.

## Worked Example

A hypothetical case settles for $100,000. The fee agreement sets a 33.33% fee, the firm advanced $5,000 in costs, and a $10,000 medical lien must be paid. These figures are invented to show the arithmetic.

| Item | Costs out first | Costs out after |
| --- | --- | --- |
| Fee base | $95,000.00 | $100,000.00 |
| Attorney fee | $31,663.50 | $33,330.00 |
| Case costs | $5,000.00 | $5,000.00 |
| Liens | $10,000.00 | $10,000.00 |
| Net to client | $53,336.50 | $51,670.00 |

Taking costs out first leaves the client $1,666.50 more in this example.

## Reading the Results

Treat the result as an estimate. Liens can sometimes be negotiated down, and the final settlement statement controls what is actually paid.

If your agreement uses a different percentage at different stages, such as before and after a lawsuit is filed, run the calculator once with each percentage.

## Limits of the Model

- One fee percentage applies to the whole recovery. Tiered or sliding scales need separate runs.
- Taxes are not included. Ask a tax professional how a recovery is treated.
- Fee rules vary. Some case types and jurisdictions limit contingency fees, so check your fee agreement and your state's rules.
- This is arithmetic, not legal advice. Your lawyer's settlement statement is the authoritative breakdown.

## Frequently Asked Questions

### How Is a Contingency Fee Calculated?

Multiply the fee base by the percentage in your fee agreement. The fee base is either the full recovery or the recovery minus case costs, depending on what the agreement says.

### Are Case Costs Part of the Attorney Fee?

No. Costs are separate from the fee. They repay money the firm spent on the case, and they are usually taken from the recovery.

### Does the Calculator Store My Figures?

No. It runs in your browser and does not send, save, or log what you enter.

## Methodology

The formulas are written out above, and the worked example is checked in the calculator's automated tests. Results that would divide by zero show Not available instead of a number.
