---
title: Smokeball Legal Software and Automatic Time Capture
seo_title: Smokeball Legal Software and Automatic Time Capture
description: How Smokeball legal software turns tracked activity into time entries with AutoTime, which plan includes it, when it creates no entry, and how to test it.
slug: /legal-tech/smokeball-legal-software-time-capture/
type: blog
schema: BlogPosting
draft: false
tracker_id: Blog:4
primary_keyword: smokeball legal software
secondary_keywords: Smokeball time tracking; Smokeball billing
cluster: Legal Tech
launch_silo: Practice Management & Billing
silo_role: Commercial Support
approved_internal_links: /legal-tech/legal-technology-statistics/; /law-firms/law-firm-billing-statistics/; /legal-tech/clio-legal-software-total-cost/; /legal-tech/lawpay-legal-payments-fees/
research_record: content/research/blog-4.json
source_document: https://docs.google.com/document/d/1UwetlznTs9joZMvBZT0xDHUtS--8xAnKKTP81wtcRJ4/edit?usp=drivesdk
image: /assets/images/posts/smokeball-legal-software-time-capture/rust-red-case-file-marble-desk-1600.jpg
image_alt: Closed rust-red case file with tabbed pages on a marble desk in a high-rise office
author: Darlene Aberin
published: 2026-10-04
modified: 2026-10-04
---

# Smokeball Legal Software and Automatic Time Capture

Time-entry software can record more activity without improving a firm's revenue. What matters is what the system detects, which records become time entries, what a reviewer approves, what reaches an invoice, and what the client pays.

Smokeball legal software handles this through a feature called AutoTime. It reads the work a user has done and writes time entries overnight. That makes the feature easy to describe and harder to judge, because a longer list of entries is not the same as more collected fees.

This guide draws on Smokeball's pricing page and Support Hub as of October 3, 2026. It is desk research, not a hands-on review or a record of a completed pilot. Smokeball publishes no prices, so none are stated here.

## Key Takeaways

These points cover what AutoTime does and where a person still has to decide.

- **AutoTime Is Not in Every Plan:** Smokeball's pricing page says it is included with Prosper+ and sold as an add-on for Grow. The Bill and Boost plans list manual time tracking.
- **Entries Are Created Overnight:** AutoTime turns the previous day's tracked activity into time entries each night.
- **Settings Are Per User:** Each user's AutoTime options are set under Staff and Users, so a pilot needs a named group.
- **Nine Situations Create No Entry:** A missing matter, zero duration, leads, closed matters, and several settings can stop an entry from appearing.
- **Entries Are Not Billed Automatically:** They can be edited or deleted before an invoice is created.
- **The 10% to 30% Figure Is a Vendor Claim:** Smokeball states it without a published method, so a firm should measure its own result.

## What AutoTime Does and Which Plans Include It

Smokeball legal software is sold in four plans: Bill, Boost, Grow, and Prosper+. The [Smokeball pricing page](https://www.smokeball.com/pricing) shows a "Get Pricing" button for each one and no dollar figure. Its own answer on cost says pricing depends on the number of users, the plan, the contract term, and any optional products or services.

The same page is clear about where automatic capture sits. Its comparison table lists time tracking as manual for Bill, Boost, and Grow, and automatic for Prosper+. Its FAQ adds that AutoTime is included with Prosper+ and that Grow users can buy it as an add-on.

Table: Where AutoTime sits in Smokeball's four plans {.compare}
| Plan | Time Tracking Listed | AutoTime | Published Price |
| --- | --- | --- | --- |
| Bill | Manual | Not listed | None, quote required |
| Boost | Manual | Not listed | None, quote required |
| Grow | Manual | Paid add-on | None, quote required |
| Prosper+ | Automatic | Included | None, quote required |

This matters before any demo. A firm that wants automatic capture is comparing Prosper+ against Grow plus an add-on, not against the entry plan. Third-party directories list per-user prices for Smokeball, and they do not agree with one another. The only figure that counts is the one in a written quote.

Adoption figures do not help much here either. Broad [legal technology statistics](/legal-tech/legal-technology-statistics/) show that most firms use cloud tools, but they say nothing about which plan tier a firm bought or which features it switched on.

## How Activity Becomes a Time Entry

Smokeball's [AutoTime Basics article](https://support.smokeball.com/hc/en-us/articles/5860708227863-AutoTime-Basics) explains the sequence. As a user works, a feature called Activity tracks time spent on eight kinds of work: matter administration, events, documents, emails, Communicate messages, memos, RingCentral calls, and tasks.

Every night, AutoTime takes the recorded activity and creates time entries for it. The article says the run covers activities performed the previous day. A user can also run it manually from the Smokeball home screen for activity that was not recorded earlier. When the run finishes, the user gets an email sorted by matter, with each entry's duration and amount.

The behavior is controlled by settings on each user's profile. The article lists eleven, and several change what the firm will see on an invoice.

- **Automatic Creation:** Whether entries are created at all for that user.
- **Grouping:** Whether activities are grouped into one time entry, and whether email entries are grouped by subject line.
- **Billable by Default:** Whether new entries are marked billable.
- **Included Activity Types:** Whether matter administration, memos, and internal Communicate messages count.
- **Closed Matters:** Whether entries are created on closed matters.
- **First Email Read:** Whether a billable entry is created only the first time an email is read.
- **Units:** Whether time is entered as units.

These are firm policy decisions. Two users with different settings will produce different entries from the same work, so record the settings chosen for each person.

> **The Workflow in One Line**
> Tracked activity, then a nightly AutoTime entry, then human review, then billing approval, then the invoice, then collection. Each step can reduce the number that came before it.

## When AutoTime Creates No Entry

An automatic system applies its rules the same way every time. Those rules include exclusions. The AutoTime Basics article lists nine situations in which tracked activity does not become a time entry.

Table: Nine situations where AutoTime creates no entry, and how to test each {.checklist}
| Situation Listed by Smokeball | What to Test in a Pilot |
| --- | --- |
| AutoTime is not turned on for the user | Confirm every pilot user is enabled |
| No matter is selected | Create a calendar event with no matter |
| The activity has zero duration | Record a zero-duration activity |
| The activity type is set to be ignored | Check matter administration and internal message settings |
| The activity was marked non-billable while editing a document or email | Mark one item non-billable and check the result |
| The matter uses UTBMS codes and AutoTime is not enabled for them | Run one activity on a coded matter |
| The matter is a lead | Record work against a lead |
| The matter is closed and closed-matter entries are off | Record work on a closed matter |
| The pending fee was marked as excluded | Exclude a pending fee and rerun |

Each line is a place where real work can drop out without an error message. A calendar event with no matter attached produces nothing, however long the meeting ran.

## Email Time Depends on the Outlook Version

Email is one of the largest sources of small time entries, so the way reading time is measured matters. Smokeball's article says the method differs between two versions of Microsoft Outlook.

### Classic Outlook Records Time After the User Moves On

In Classic Outlook, reading time reflects overall engagement with an email across the day. The article says it checks periodically and records time once the user has moved on, with a 10-second minimum before anything is logged. Smokeball describes this as better suited to an end-of-day summary than a live tracker.

### New Outlook Logs One Minute per View

New Outlook works differently. The article says that every time a user opens an email and views it for 10 seconds or more, a 1-minute entry is logged. Returning to the same email later counts as a new view and adds another minute.

```chart
smokeball-new-outlook-logged-minutes
```

The chart applies that rule to one email opened one, three, and five times. Five short views can log five minutes when the reading time was under one. Smokeball says so directly: logged time in New Outlook may run higher than in Classic Outlook, and it is exploring improvements. Drafting time is tracked the same way in both versions.

For a firm that runs Smokeball legal software and bills in small increments, this is a review issue, not a reason to reject the feature. The "first email read" setting and grouping by subject line both exist to control it. A pilot should record which Outlook version each user runs.

## Review Every Entry Before It Reaches an Invoice

Smokeball states that AutoTime entries are not automatically billed. They appear as pending entries and can be edited on the Time and Expenses page before an invoice is created. A reviewer can change the date, description, duration, rate, and amount. Entries can also be deleted.

One detail matters for audits. Edits to a time entry are not reflected in Activity. If the tracked activity shows one duration and the approved entry shows another, the firm should be able to explain the difference. It may be entirely proper, but it should not be invisible.

![Open law book with a red ribbon marker on a marble desk in front of dark bookshelves](/assets/images/posts/smokeball-legal-software-time-capture/open-law-book-red-ribbon-1600.jpg "Captured time still needs a reviewer before it reaches an invoice.")

Reviewers should check the same fields in the same order each time.

1. **Matter:** Confirm the entry belongs to the right client and matter.
2. **User:** Confirm who performed the work.
3. **Duration:** Compare the generated time with the work and the billing increment.
4. **Narrative:** Rewrite system wording so the client can understand the service.
5. **Billability:** Remove administrative, duplicated, or excluded work.
6. **Rate and Amount:** Check the fee arrangement and any matter-specific terms.

Review time is part of the cost. A pilot that floods the review queue may need grouping turned on or fewer activity types.

AutoTime is also not the only route. Smokeball's guide on [how to bill with Smokeball](https://support.smokeball.com/hc/en-us/articles/5986448662167-How-Should-I-Bill-With-Smokeball) says users can keep tracking time manually, use a timer and activity codes, or use a tool called Time Finder to look for missed billable time. A firm that mixes methods needs a rule for spotting the same work entered twice.

## Treat the 10% to 30% Figure as a Vendor Claim

Both support articles repeat one number. AutoTime Basics says AutoTime users bill 10% to 30% more. The billing guide says firms using Activity Intelligence or AutoTime bill 10% to 30% more and increase profitability.

```chart
smokeball-autotime-vendor-claim-range
```

Neither article gives a sample, a period, a comparison group, or a definition of "bill." The billing guide was last updated two years ago. That does not make the claim false. It means the figure cannot be used as a forecast for a specific firm.

To bill more is also not the same as to collect more. A firm can turn the claim into four questions for the vendor.

- **Population:** Which customers, practice areas, and periods were measured?
- **Comparison:** Were the same users measured before and after, or was a different group used?
- **Metric:** Was it captured minutes, approved time, invoiced value, or cash received?
- **Exclusions:** How were duplicates, write-downs, and non-billable work handled?

Benchmarks help set expectations. Published [law firm billing statistics](/law-firms/law-firm-billing-statistics/) on utilization, realization, and collection show how much value is usually lost between hours worked and cash received. Capture is only the first of those stages.

## Measure a Pilot From Activity to Collected Fees

A controlled pilot of Smokeball legal software compares a baseline period with an AutoTime period for the same users and the same kind of work. Use approved sample matters, and keep the definitions fixed.

Table: Measures to record in an AutoTime pilot {.data}
| Measure | Definition | Why It Matters |
| --- | --- | --- |
| Activity minutes | Duration recorded in tracked activity | The volume available to the process |
| Generated entry minutes | Time created by the nightly run | Shows rule-based capture |
| Removed minutes | Generated time deleted or reduced in review | Shows noise, overlap, or over-logging |
| Approved billable minutes | Time accepted for billing | Measures usable capture |
| Invoiced value | Approved value placed on bills | Reflects billing rules and write-downs |
| Collected value | Cash received for that work | Connects capture to financial results |
| Review time | Staff time spent checking entries | The operating cost of the feature |

Record the reason for every removal. A single "rejected" total will not show whether the problem was duplicates, wrong matters, repeated email views, or non-billable work. If generated entries rise by a fifth, the firm cannot conclude that revenue rose by a fifth.

Set an end date and a decision owner before the pilot starts.

## Include AutoTime in the Full Software Cost

Because the product is sold by quote, the proposal is where cost becomes visible. The pricing page says training is tailored to the plan and that migration services and related costs are confirmed in the quote. It also marks online payments, trust management, and e-filing with the note "Fees apply."

Ask for each element in writing.

- **Plan and Add-Ons:** The plan, the AutoTime add-on if the plan is Grow, and any other add-ons such as Intake or Workflows.
- **Users and Term:** The number of users, the contract term, and what happens at renewal.
- **Onboarding:** Training sessions, migration scope, and who does which part.
- **Fees That Apply:** Payment processing, trust management, and e-filing charges.
- **Accounting:** The billing guide says Smokeball integrates with QuickBooks Online and does not handle payroll or the general ledger.
- **Exit:** How time and billing records can be exported. The billing guide says activity and time data can be exported to a CSV file.

The same categories apply to any practice-management purchase. The breakdown of [Clio's total cost](/legal-tech/clio-legal-software-total-cost/) shows how subscription, payment fees, and add-ons combine, and it makes a useful template for reading a quote for Smokeball legal software. Payment charges deserve their own line. The review of [LawPay fees](/legal-tech/lawpay-legal-payments-fees/) explains what to check in a processor's rates before assuming they are small.

## Is Smokeball AutoTime Worth Testing?

AutoTime is worth testing when a firm suspects that tracked work is going unbilled and can define how captured activity should move through review, billing, and collection. Start with a small group, not a firm-wide promise.

The strongest result is not more time entries. It is more accurate approved time, a review workload the team can sustain, clearer invoices, and better collection. Smokeball legal software gives a firm the settings to shape that outcome. The firm still has to choose them, test them, and check the entries.

## Frequently Asked Questions

These answers cover the questions buyers ask most often about Smokeball legal software and AutoTime.

### Which Smokeball Plan Includes AutoTime?

Smokeball's pricing page says AutoTime is included with the Prosper+ plan and that Grow users can buy it as an add-on. Bill and Boost list manual time tracking.

### Does AutoTime Automatically Bill Clients?

No. Smokeball says AutoTime entries are not automatically billed. They are pending entries that can be edited or deleted before an invoice is created.

### Does Smokeball Publish Its Prices?

No. Each plan on the pricing page shows a "Get Pricing" button. Smokeball says cost depends on users, plan, contract term, and optional products.

### Can AutoTime Log More Time Than Was Spent?

It can for email reading in New Outlook. Smokeball says each view of 10 seconds or more logs one minute, so repeated views of one email add up.

## Resources

These official pages were checked on October 3, 2026. Recheck them before any purchase decision.

- **Smokeball Pricing:** [Smokeball Pricing Plans](https://www.smokeball.com/pricing)
- **AutoTime Documentation:** [AutoTime Basics, Smokeball Support Hub](https://support.smokeball.com/hc/en-us/articles/5860708227863-AutoTime-Basics)
- **Billing Methods:** [How Should I Bill With Smokeball?, Smokeball Support Hub](https://support.smokeball.com/hc/en-us/articles/5986448662167-How-Should-I-Bill-With-Smokeball)
