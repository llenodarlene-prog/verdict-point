---
title: Smokeball Legal Software and Automatic Time Capture
seo_title: Smokeball Legal Software and Automatic Time Capture
description: Evaluate Smokeball legal software AutoTime by tracking activities, generated entries, billing review, exceptions, invoices, and collected fees.
slug: /legal-tech/smokeball-legal-software-time-capture/
type: blog
schema: Article
draft: true
tracker_id: Blog:4
primary_keyword: smokeball legal software
cluster: Legal Tech
launch_silo: Practice Management & Billing
silo_role: Commercial Support
approved_internal_links: /legal-tech/legal-technology-statistics/; /law-firms/law-firm-billing-statistics/; /legal-tech/clio-legal-software-total-cost/; /legal-tech/lawpay-legal-payments-fees/
research_record: content/research/blog-4.json
source_document: https://docs.google.com/document/d/1UwetlznTs9joZMvBZT0xDHUtS--8xAnKKTP81wtcRJ4/edit?usp=drivesdk
author: 
published: 
modified: 
---

# Smokeball Legal Software: Does AutoTime Capture Billable Work?

Time-entry software can record more activity without improving a firm’s revenue. The difference depends on what the system detects, which records become time entries, what reviewers approve, what reaches an invoice, and what clients ultimately pay.

Smokeball legal software approaches this problem through Activity records and AutoTime. According to Smokeball’s support documentation, AutoTime uses supported Activity records to create time entries during nightly processing. The feature must be enabled for each user, and generated entries can be reviewed and edited. They are not automatically billed.

That workflow makes AutoTime measurable. Instead of accepting a broad time-saving claim, a firm can run a controlled pilot that follows work from recorded activity through approved time, invoices, and collected fees.

## Key Takeaways

These points define what AutoTime does and where human review remains necessary.

- \*\*Activity Comes First:\*\* AutoTime relies on supported Activity records; it does not turn every action performed by every user into billable time.  
- \*\*Processing Happens Nightly:\*\* Eligible activity is converted into time entries during nightly processing rather than appearing as a final invoice immediately.  
- \*\*Enablement Is Per User:\*\* The feature must be enabled for each intended user, so a firm should confirm its pilot population.  
- \*\*Generated Entries Remain Editable:\*\* Users can review and edit time entries before billing, but editing an entry does not change the underlying Activity record.  
- \*\*Several Exceptions Can Block Creation:\*\* Missing matters, zero duration, ignored activity types, leads, some closed matters, and excluded pending fees may prevent an entry.  
- \*\*Captured Time Is Not Collected Revenue:\*\* Created, approved, invoiced, and collected amounts are separate measures.

## Follow the Workflow From Activity to Cash

The most useful way to evaluate AutoTime is to separate each stage. A higher number at the beginning can shrink as duplicates, nonbillable work, narrative problems, client rules, write-downs, and collection delays are addressed.

| Stage | What It Represents | Main Review Question |  
| --- | --- | --- |  
| Activity | Supported work recorded by the system | Was the work tied to the right user and matter? |  
| Generated Time Entry | Entry created by nightly AutoTime processing | Was the duration and activity type handled correctly? |  
| Approved Billable Time | Entry accepted after human review | Is it billable, clear, accurate, and permitted? |  
| Invoiced Time | Approved value placed on a client bill | Did billing rules or write-downs change it? |  
| Collected Fees | Cash received from the client | Was the invoiced amount paid and retained? |

This chain prevents a common measurement error. If generated entries rise by 20%, the firm cannot conclude that revenue rose by 20%. The additional entries may include work that is nonbillable, duplicated, adjusted, excluded from an invoice, or never collected.

The same principle applies when comparing \[billing realization and collection\](https://verdictpoint.org/law-firms/law-firm-billing-statistics/). Time capture is an input. Realization, invoicing, payment timing, and collection are later financial stages.

## How AutoTime Creates Time Entries

Smokeball’s \[AutoTime Basics documentation\](https://support.smokeball.com/hc/en-us/articles/5860708227863-AutoTime-Basics) states that the feature uses tracked Activity and creates time entries nightly. It also makes clear that AutoTime must be enabled for each user.

That creates four setup questions before a pilot begins:

1. \*\*Who Is Included?\*\* Name the users, roles, and practice group covered by the pilot.  
2. \*\*Which Activity Types Count?\*\* Confirm the activities that can create entries and any activity types the firm ignores.  
3. \*\*Which Matters Qualify?\*\* Define how leads, active matters, closed matters, and administrative work should be handled.  
4. \*\*Who Reviews Entries?\*\* Assign responsibility for checking matter, duration, narrative, rate, duplicates, and billability.

Nightly creation is only one step. Reviewers still need enough context to decide whether an entry belongs on a client bill. A technically valid entry may be inaccurate under the engagement, billing guidelines, or the firm’s professional judgment.

\> Workflow Box  
\> Supported Activity → Nightly AutoTime Entry → Human Review → Billing Approval → Invoice → Collection

Smokeball’s separate \[billing guidance\](https://support.smokeball.com/hc/en-us/articles/5986448662167-How-Should-I-Bill-With-Smokeball) also recognizes manual time tracking alongside AutoTime. A firm may therefore need rules for when automated capture is preferred, when manual entry is appropriate, and how duplicates between the two are found.

## Identify the Work AutoTime May Miss

An automatic system can be useful precisely because it applies rules consistently. Those rules also create exclusions. The AutoTime support page identifies conditions that can prevent time-entry creation.

### Missing or Ineligible Matter Selection

If supported work is not connected to an eligible matter, the system may not have the information needed to create the intended entry. The pilot should therefore test how users select matters and what happens when that step is omitted.

### Zero Duration or Ignored Activity Types

An Activity record with zero duration cannot support a meaningful time entry. The firm should also verify its ignored activity types so that excluded work is intentional rather than an unnoticed setup choice.

### Leads and Closed Matters

Leads do not necessarily follow the same billing workflow as open matters. Closed-matter behavior can depend on settings. The firm should use sample records to confirm what happens instead of assuming all historical or intake activity is captured.

### Excluded Pending Fees

The support guidance notes that excluded pending fees can affect entry creation. Billing administrators should document how this setting interacts with review, invoicing, and any existing matter-specific rules.

| Exception | Pilot Test | Required Decision |  
| --- | --- | --- |  
| No matter selected | Create supported activity without a matter | Correct, reject, or route for review |  
| Zero duration | Create a zero-duration activity | Confirm exclusion and user guidance |  
| Ignored activity type | Use an excluded activity | Confirm the exclusion is intentional |  
| Lead record | Record work against a lead | Decide whether and how intake work is tracked |  
| Closed matter | Record a permitted test activity | Confirm setting-dependent behavior |  
| Manual and automatic overlap | Enter time manually for captured work | Define duplicate-detection process |

## Review Every Entry Before It Reaches an Invoice

Smokeball legal software allows generated time entries to be reviewed and edited. The support documentation also states that editing the time entry does not change the underlying Activity record.

That distinction matters for audit and troubleshooting. If the Activity shows one duration and the approved entry shows another, the firm should be able to explain why. The difference may be appropriate, but it should not be invisible.

Reviewers should check several fields in a consistent order:

- \*\*Matter:\*\* Confirm that the entry belongs to the correct client and matter.  
- \*\*User:\*\* Verify the person credited with performing the work.  
- \*\*Duration:\*\* Compare the generated duration with the work and billing rules.  
- \*\*Narrative:\*\* Rewrite system wording when necessary so the client can understand the service.  
- \*\*Activity Type:\*\* Confirm that the category supports the correct rate and reporting.  
- \*\*Billability:\*\* Exclude administrative, duplicated, nonbillable, or otherwise ineligible work.  
- \*\*Rate and Value:\*\* Check the applicable fee arrangement and matter-specific terms.

Review time is part of the operating cost. A pilot that captures more entries but creates an unmanageable review queue may need different settings, narrower scope, or clearer approval rules.

## Measure a Pilot With a Reconciliation Log

A controlled pilot should use anonymized or approved sample matters and compare a baseline period with an AutoTime period. The firm should keep the same users, practice area, and measurement definitions where practical.

| Pilot Measure | Definition | Why It Matters |  
| --- | --- | --- |  
| Activity Minutes | Duration recorded in eligible Activity records | Starting volume available to the process |  
| Generated Entry Minutes | Time created by AutoTime | Shows rule-based capture |  
| Rejected or Duplicate Minutes | Generated time removed during review | Identifies noise or overlap |  
| Approved Billable Minutes | Time accepted for billing | Measures usable capture |  
| Invoiced Value | Approved value placed on bills | Reflects billing rules and write-downs |  
| Collected Value | Cash received for invoiced work | Connects capture with financial results |  
| Review Time | Staff time spent checking entries | Shows operating cost of the process |

The pilot should also record exception reasons. A simple “rejected” total will not show whether the problem came from duplicates, wrong matters, narratives, nonbillable work, or settings.

When evaluating \[profitability measures\](https://verdictpoint.org/law-firms/law-firm-profitability-statistics/), the firm should subtract relevant subscription, implementation, training, and review costs rather than treating additional captured value as pure profit.

## Treat Performance Percentages as Vendor Claims

The AutoTime page states that users bill 10% to 30% more. Smokeball’s \[Family Law Billing page\](https://support.smokeball.com/hc/en-us/articles/5962336205591-Family-Law-Billing) separately says AutoTime clients capture an average of 34% more time than manual users.

These claims refer to different measures. “Bill more” is not identical to “capture more time,” and neither phrase establishes collected revenue, contribution margin, or profit. The public materials reviewed here do not provide an independent study that allows either figure to become a universal forecast.

A firm may retain the claims as questions for the vendor:

- \*\*Population:\*\* Which customers, users, practice areas, and periods were included?  
- \*\*Comparison:\*\* Was the change measured against the same users before adoption or against a different group?  
- \*\*Metric:\*\* Did the analysis use captured minutes, approved time, invoiced value, or collected cash?  
- \*\*Exclusions:\*\* How were duplicates, write-downs, nonbillable work, and incomplete matters handled?

The firm’s own pilot should remain the decision source. If results differ from the marketing claim, the internal evidence is more relevant to that firm’s purchase.

## Include AutoTime in the Full Software Cost

No universal price was confirmed by the approved support sources. The firm should request current pricing and identify which plan, users, configuration services, training, support, and integrations are included.

The evaluation should follow the same categories used in \[practice-management cost planning\](https://verdictpoint.org/legal-tech/clio-legal-software-total-cost/): recurring subscriptions, optional products, implementation, migration, integrations, training, and internal staff time.

For AutoTime specifically, include the cost of setup, exception review, billing approval, user training, and ongoing audits. An automated capture feature can still require meaningful operational work.

A Smokeball legal software proposal should also identify the users covered by AutoTime, any plan or configuration dependency, onboarding responsibilities, support boundaries, contract term, renewal treatment, and the process for exporting time and billing records. Those details allow the firm to compare the price with the work the system is expected to replace or improve.

Before approving the purchase, assign an owner for quarterly sampling. That person can compare Activity records with generated entries, check rejected and edited items, and review whether exception rates are improving. A control that works during a short pilot can weaken later if users change, matter-selection habits drift, or billing rules are revised.

## Is Smokeball AutoTime Worth Testing?

AutoTime is worth testing when a firm suspects that supported work is being missed and can define how captured activity should move through review, billing, and collection. The test should begin with a limited group rather than a firm-wide promise.

The pilot should also have a documented end date and decision owner.

The strongest outcome is not simply “more time entries.” It is more accurate approved time, acceptable review effort, clearer invoices, and better collection without weakening matter controls or client trust.

## Frequently Asked Questions

These answers summarize the main setup and measurement points for a controlled evaluation.

### Does AutoTime Automatically Bill Clients?

No. Smokeball says AutoTime creates time entries from supported Activity records, but the entries are not automatically placed on a client bill.

### Does AutoTime Need to Be Enabled for Every User?

Yes. The support documentation says AutoTime is enabled per user, so firms should confirm exactly who belongs in the pilot.

### Can Users Edit AutoTime Entries?

Yes. Generated entries can be reviewed and edited. Editing an entry does not change the underlying Activity record used to create it.

### Can AutoTime Miss Recorded Work?

Yes. Missing matter selection, zero duration, ignored activities, leads, closed-matter settings, and excluded pending fees can prevent entry creation.

### Does Capturing More Time Guarantee More Revenue?

No. Captured time must still be approved, invoiced, and collected. Review costs, write-downs, and nonbillable work can change the result.

### Is This a Hands-On Smokeball Review?

No. This guide is based on public support documentation and an editorial pilot framework. Firms should test the product under their own workflow.

## Resources

- \*\*Smokeball AutoTime Basics:\*\* https://support.smokeball.com/hc/en-us/articles/5860708227863-AutoTime-Basics  
- \*\*How Should I Bill With Smokeball:\*\* https://support.smokeball.com/hc/en-us/articles/5986448662167-How-Should-I-Bill-With-Smokeball  
- \*\*Smokeball Family Law Billing:\*\* https://support.smokeball.com/hc/en-us/articles/5962336205591-Family-Law-Billing

FACT CHECK / PUBLISHING NOTES

RECHECK BEFORE PUBLICATION:  
- Confirm current AutoTime setup, nightly processing, supported activities, and exception behavior.  
- Keep the 10–30% and 34% figures clearly attributed as separate vendor claims.  
- Do not equate captured time with invoiced or collected value.  
- Confirm current pricing directly; do not add a universal price without verified terms.  
- Confirm all internal-link destinations.
