---
title: Configuring Filevine Legal Software Around Case Types
seo_title: Configuring Filevine Legal Software Around Case Types
description: Evaluate Filevine legal software by mapping case types, fields, stages, billing settings, migration work, acceptance tests, and quote requirements.
slug: /legal-tech/filevine-legal-software-case-types/
type: blog
schema: BlogPosting
draft: false
tracker_id: Blog:3
primary_keyword: filevine legal software
secondary_keywords: Filevine workflows; Filevine implementation
cluster: Legal Tech
launch_silo: Practice Management Software
silo_role: Commercial Support
approved_internal_links: /legal-tech/legal-technology-statistics/; /law-firms/law-firm-billing-statistics/; /legal-tech/smokeball-legal-software-time-capture/; /legal-tech/litify-legal-software-implementation/
research_record: content/research/blog-3.json
source_document: https://docs.google.com/document/d/1Z7Ell8DAGCywhHVFy9vxA8CuV9MaERPznpKXSF6jfMM/edit?usp=drivesdk
image: /assets/images/posts/filevine-legal-software-case-types/case-file-index-tabs-1600.jpg
image_alt: Rust-red case file with navy, red, and gold index tabs on a marble desk
author: Darlene Aberin
published: 2026-10-03
modified: 2026-10-03
---

# Configuring Filevine Legal Software Around Case Types

A case-management system cannot decide how a firm handles a matter. It can only reflect the fields, stages, deadlines, permissions, and billing rules the firm defines. That makes Filevine legal software hard to judge from a feature list.

Filevine does not publish a price. Its pricing page says every package is custom built, and implementation runs through Certified Implementation Partners. A buyer therefore needs two documents before signing: a written quote and a case-type configuration plan. This guide draws on Filevine's public pricing page and help center as of October 3, 2026. It is desk research, not a hands-on review or a record of a completed implementation.

## Key Takeaways

The decisions that matter most come before anyone builds a template or moves a live matter.

- **Pricing Requires a Quote:** Filevine lists no per-user rate, so the firm needs a written scope covering products, users, implementation, training, and renewal terms.
- **Case Types Should Drive Configuration:** Different matters need different fields, stages, owners, deadlines, documents, and reports.
- **Organization Settings and Project Templates Differ:** Billing is configured for the whole organization, then added to each project template as a section.
- **One Billing Change Cannot Be Undone:** Filevine warns that applying new billing defaults to existing projects overrides project-specific settings permanently.
- **Migration Needs Reconciliation:** An import is not finished until counts, links, balances, and permissions have been checked against the source.
- **Acceptance Tests Need Real Scenarios:** Test one workflow from intake to export, including an exception, before wider rollout.

## Why Filevine Pricing Starts With a Quote

The [Filevine pricing page](https://www.filevine.com/pricing/) states that all packages are custom built for each team. Its pricing answer says the company will tailor a plan for each organization. No per-user price appears on the page.

That sets Filevine apart from two platforms that publish at least some rates.

```chart
practice-management-published-prices
```

The comparison is about transparency, not value. A published price is easier to budget, while a quote can fit an unusual firm more closely. Either way, a quote-only vendor shifts work to the buyer, who must define the scope before a number means anything.

Table: What Filevine's pricing page states, and what it leaves to the quote {.compare}
| Topic | Stated on the Pricing Page | Left to the Quote |
| --- | --- | --- |
| Price | Packages are custom built | Per-user rate, modules, and total |
| Onboarding | Certified Implementation Partners help set up and customize | Partner fees, scope, and timeline |
| Support | Customer Success and Support teams give ongoing help | Service levels and exclusions |
| Free trial | A free tier exists for the LOIS AI product | Trial terms for case management |

## Begin With One Case Type, Not the Whole Firm

A firm may eventually run several practice areas in Filevine legal software. Designing all of them at once hides important differences and makes review harder. Start with one case type that represents real work but is small enough to test.

The team should be able to explain how that matter begins, which facts are required, who owns each stage, what triggers a deadline, how billing works, and what management needs to see at the end.

Table: Configuration areas to settle for the first case type {.cost}
| Configuration Area | Question to Resolve | Evidence Needed for Acceptance |
| --- | --- | --- |
| Intake | Which facts decide whether the matter proceeds? | Required fields and routing test |
| Matter opening | What must exist before work begins? | Complete sample matter record |
| Stages | Which event moves the matter forward? | Stage rules and owner alerts |
| Tasks and deadlines | What creates each action and due date? | Sample task chain with owners |
| Documents | Which templates and approvals are required? | Generated and stored sample |
| Billing | Which rates, codes, and invoice rules apply? | Sample invoice and reconciliation |
| Reporting | Which fields support management decisions? | Report matched to source records |
| Closing | What must be complete, kept, or exported? | Closed-matter checklist and export |

Once the first case type works, the firm can decide which parts are reusable. Shared fields and controls may belong at a wider level, while practice-specific stages and documents can stay separate. This keeps adoption concrete. Broad [legal technology statistics](/legal-tech/legal-technology-statistics/) show how many firms license modern systems, but an implementation succeeds or fails at the level of one defined workflow.

## Map Fields, Stages, Owners, and Exceptions

A project template should hold the information the firm needs to do the work, supervise risk, bill correctly, and report accurately. More fields are not better. Every required field creates work and should support a decision or a later step.

### Define the Minimum Required Record

Start with what is needed to identify the client, describe the matter, check conflicts, assign responsibility, and trigger the first action. Separate what must be captured at intake from what can wait. For each field, record its type, who enters it, who reviews it, and where it is used. A field that never feeds a workflow, document, or report may not need to be mandatory.

### Make Stage Changes Meaningful

A stage should mark a real change in the matter. Moving from intake to accepted, for example, may require approval, a signed engagement, an assigned team, and a completed opening checklist. Define what permits the change, what becomes due next, who is notified, and what happens when the normal path does not apply.

### Assign Owners and Backups

Every time-sensitive action needs an owner and a backup. That matters most for exceptions. Missing documents, rejected invoices, and migrated records that do not reconcile need a clear review queue, not an informal message thread.

## Separate Organization Settings From Project Templates

Configuration levels matter because a change at the organization level can affect many matters at once. Document which decisions apply everywhere and which belong to one case type.

Filevine's [Billing Setup help article](https://support.filevine.com/hc/en-us/articles/360032734652-Billing-Setup) shows how this works. Billing is configured at the organization level in the Billing Setup tool. To use timekeeping and billing in a matter, the built-in Billing section must then be added to a project template in the Customs Editor.

That split raises practical questions for anyone setting up Filevine legal software: which rates and codes are shared, which differ by client or matter, and who is allowed to change them. The same article explains how defaults behave. By default, changes apply to newly created projects only, and project admins can override them for a single project. To push new defaults to existing projects, an admin must choose to apply them.

> **Irreversible Change Warning**
> Filevine's help article says applying billing defaults to existing projects "cannot be undone" and "overrides all project-specific default settings." Record current settings, test on sample data, and get approval first.

This does not mean the option should never be used. It means a bulk setting deserves change control, not a quick click during setup. Billing rules also shape revenue, so the firm's own rates and collection patterns, of the kind tracked in [law firm billing statistics](/law-firms/law-firm-billing-statistics/), should inform how defaults are set.

## Treat Migration as a Data-Reconciliation Project

Migration has three parts: extracting data from the current system, reshaping it for the new structure, and proving the result is complete. A successful upload finishes only the second part.

Before migrating, list every data source and decide where each record type will live. Then plan how the team will find and fix problems.

Table: Migration checks to run before going live {.checklist}
| Check | What to Compare |
| --- | --- |
| Missing records | Source and destination counts by record type |
| Duplicate contacts or matters | Matching rules and a process for uncertain cases |
| Field conversion | Dates, currency, selections, and empty values |
| Broken relationships | Links between clients, matters, documents, and invoices |
| Financial reconciliation | Sample balances, invoices, and payments against the source |
| Permission review | Access for each role, including restricted matters |
| Document retrieval | Names, dates, versions, and matter placement |

Include active, closed, simple, and complex records in the sample. A random sample alone can miss rare structures that matter. Scope is the usual surprise on enterprise platforms, as the review of a [Litify implementation](/legal-tech/litify-legal-software-implementation/) also found.

## Build the Quote Around the Implementation Scope

Because Filevine legal software is sold by quote, the proposal is where cost becomes visible. Ask the vendor to separate each element so nothing hides inside one total.

Table: What to request in writing in a Filevine quote {.data}
| Cost Area | Details to Request |
| --- | --- |
| Subscription | Products, modules, users, term, and renewal basis |
| Configuration | Included templates, fields, workflows, and revision rounds |
| Migration | Source systems, record types, documents, and validation |
| Integrations | Connector, data direction, owner, and recurring charge |
| Training | Audiences, sessions, materials, and follow-up |
| Partner services | Named partner, deliverables, rates, and change process |
| Support | Coverage, channels, escalation, and exclusions |

The comparison should also count the internal time of lawyers, operations, billing, and IT staff. That time never appears on the vendor invoice, but it is part of the decision. Feature claims deserve the same scrutiny. If automatic time tracking is on the wish list, compare how each platform handles it, as covered in the look at [Smokeball automatic time capture](/legal-tech/smokeball-legal-software-time-capture/).

## Run Acceptance Tests Before Wider Rollout

Acceptance testing checks whether the configured system performs the approved workflow with the right data, permissions, and results. It is not the same as asking users whether they like the interface.

![Two legal professionals checking documents on a large screen against a printed binder](/assets/images/posts/filevine-legal-software-case-types/workflow-acceptance-review-1600.jpg "Check each configured step against the firm's approved workflow before go-live.")

Write the test cases before configuration finishes. Each one should state the starting record, the action, the expected result, the actual result, and who owns the fix.

1. **Create a Sample Intake:** Confirm required fields, duplicate handling, assignment, and alerts.
2. **Open the Matter:** Test approvals, project creation, permissions, and first tasks.
3. **Advance Each Stage:** Confirm that owners, deadlines, and documents appear as designed.
4. **Apply Billing Rules:** Produce a sample invoice and reconcile it to the fee agreement.
5. **Test a Change to Existing Projects:** Use controlled data before touching live matters.
6. **Review Role Access:** Confirm what attorneys, staff, and restricted users can see and change.
7. **Run Management Reports:** Trace totals back to individual matters.
8. **Export a Matter:** Confirm the firm can retrieve its data and documents in a usable form.

Every failed result needs an owner and a decision: fix the configuration, change the workflow, accept a documented limit, or delay rollout.

## What Makes a Filevine Implementation Ready?

Filevine legal software is ready for wider use when the firm can run one approved case type from start to finish, not when accounts exist and data has been imported.

The evidence includes a signed configuration, reconciled migration results, tested permissions, accepted reports, trained users, and a support path. The contract should match that scope and state which work belongs to Filevine, an implementation partner, or the firm. Starting with one case type lets the firm correct the design before repeating it across the rest of Filevine legal software.

## Frequently Asked Questions

These answers cover the Filevine legal software pricing and setup questions buyers ask most often.

### Does Filevine Publish a Per-User Price?

No. Filevine's pricing page says all packages are custom built and directs buyers to request a quote. Any figure seen elsewhere should be confirmed in a written proposal.

### Who Handles Filevine Implementation?

Filevine's pricing page says its Certified Implementation Partners help firms set up and customize the platform, with ongoing help from its Customer Success and Support teams.

### Can New Billing Defaults Be Applied to Existing Projects?

Yes, but Filevine's help center warns that the action cannot be undone and overrides all project-specific default settings.

### Is Migration Complete Once Records Are Imported?

No. The firm still needs to reconcile record counts, field mapping, relationships, documents, financial data, and permissions.

## Resources

These official pages were checked on October 3, 2026. Recheck them before any purchase decision.

- **Filevine Pricing:** [Filevine Pricing](https://www.filevine.com/pricing/)
- **Filevine Billing Setup:** [Billing Setup, Filevine Help Center](https://support.filevine.com/hc/en-us/articles/360032734652-Billing-Setup)
- **Comparison Price, Clio:** [Clio Pricing and Plans](https://www.clio.com/pricing/)
- **Comparison Price, MyCase:** [MyCase Plans and Pricing](https://www.mycase.com/pricing/)
