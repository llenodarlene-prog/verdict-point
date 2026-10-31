---
title: Post-Judgment Interest Calculator for Federal Judgments
seo_title: Post-Judgment Interest Calculator for Federal Judgments
description: Calculate post-judgment interest on a federal civil judgment under 28 U.S.C. 1961, computed daily and compounded annually, with a year-by-year schedule.
slug: /tools/post-judgment-interest-calculator/
type: page
schema: WebPage
tool: judgment-interest
breadcrumb: true
parent: /tools/
parent_label: Tools
draft: false
modified: 2026-10-28
---

# Post-Judgment Interest Calculator for Federal Judgments

Enter the judgment amount, the post-judgment interest rate, the date the judgment was entered, and the payment date. This post judgment interest calculator applies the federal method in 28 U.S.C. 1961 and shows each year of the calculation.

```tool
judgment-interest
```

## How the Calculator Works

Under [28 U.S.C. 1961](https://www.law.cornell.edu/uscode/text/28/1961), interest is allowed on any money judgment in a civil case recovered in a federal district court. The statute sets three rules that the calculator follows:

- Interest runs from the date the judgment is entered.
- The rate equals the weekly average 1-year constant maturity Treasury yield, as published by the Federal Reserve, for the calendar week before the date of the judgment.
- Interest is computed daily to the date of payment and compounded annually.

The calculator counts days from the day after entry through the payment date. On each anniversary of the judgment, it adds that year's interest to the balance, and the next year's interest is calculated on the new balance. Amounts are rounded to the cent only for display.

## Finding the Right Rate

The rate is fixed by the date of the judgment, so you enter it rather than the calculator looking it up. The [U.S. Courts post-judgment interest rate page](https://www.uscourts.gov/court-programs/fees/post-judgment-interest-rate) explains that the rate is the weekly average 1-year constant maturity Treasury yield published by the Federal Reserve. The Federal Reserve publishes that yield in its [H.15 Selected Interest Rates release](https://www.federalreserve.gov/releases/h15/).

Many judgments and clerk's notices state the rate. Use the rate for the calendar week before the judgment date, and keep a record of where it came from.

The U.S. Courts page notes that a different rate rule applied before December 21, 2000. The calculator accepts judgments entered on or after that date.

## The Daily Rate

Section 1961 says interest is computed daily but does not say how to turn the annual rate into a daily rate. The calculator offers two common conventions:

- **Annual rate ÷ 365:** the same daily rate every day of the year.
- **Annual rate ÷ days in each judgment year:** 366 in a judgment year that contains February 29, otherwise 365.

The two usually differ by a few dollars at most. Use the convention the court, the clerk, or the other side uses, and state it when you share a figure.

## Worked Example

A $100,000 judgment entered on January 1, 2026 carries a 5% rate, and payment is made on February 5, 2027. That is 400 days.

- Year 1, January 1, 2026 to January 1, 2027: 365 days on $100,000 at 5% is $5,000.00. The balance becomes $105,000.00.
- Year 2, January 1, 2027 to February 5, 2027: 35 days on $105,000 at 5%, using the 365-day convention, is $503.42.
- Total interest is $5,503.42, and the total due is $105,503.42.

This example is hypothetical. The 5% rate was chosen to make the arithmetic easy to follow and is not the rate for any real judgment.

## What the Calculator Does Not Cover

- **State court judgments:** state rates and compounding rules differ, and this tool does not apply them.
- **Prejudgment interest:** the law that governs the claim decides whether it applies and how it is calculated.
- **Criminal and condemnation judgments:** the U.S. Courts page lists separate statutes for these, 18 U.S.C. 3612(f)(2) and 40 U.S.C. 3116.
- **Tax cases and claims against the United States:** section 1961 has its own exceptions for these.
- **Partial payments, credits, costs, and fees:** the calculator assumes no payments before the payment date.

Confirm the rate, the dates, and any payments with the judgment and the clerk before relying on a figure.

## Frequently Asked Questions

### How Is Federal Post-Judgment Interest Calculated?

Multiply the judgment by the annual rate, divide by the number of days in the year, and multiply by the days since entry. Add the interest to the balance on each anniversary of the judgment, because section 1961 compounds it annually.

### Where Do I Find the Post-Judgment Interest Rate?

Use the weekly average 1-year constant maturity Treasury yield for the calendar week before the judgment date. The Federal Reserve publishes it in the H.15 release, and the judgment or clerk's notice often states it.

### Does Post-Judgment Interest Compound?

Yes, for federal civil judgments under 28 U.S.C. 1961. Interest is computed daily and compounded annually.

### Does This Calculator Work for State Court Judgments?

No. States set their own rates and rules. Use the statute or court rule for the state where the judgment was entered.

### Does the Calculator Store My Figures?

No. The calculator runs in your browser and does not send, save, or log what you enter. A shared link contains only the numbers and dates you chose.

## Sources and Methodology

The method comes from the statute and the court guidance below, opened and checked on October 28, 2026. The worked example is tested in the calculator's automated tests.

- [28 U.S.C. 1961, Interest](https://www.law.cornell.edu/uscode/text/28/1961), Legal Information Institute, Cornell Law School
- [Post Judgment Interest Rate](https://www.uscourts.gov/court-programs/fees/post-judgment-interest-rate), Administrative Office of the U.S. Courts
- [H.15 Selected Interest Rates](https://www.federalreserve.gov/releases/h15/), Board of Governors of the Federal Reserve System
