---
title: Configuring Filevine Legal Software Around Case Types
seo_title: Configuring Filevine Legal Software Around Case Types
description: Evaluate Filevine legal software by mapping case types, fields, stages, billing settings, migration work, acceptance tests, and quote requirements.
slug: /legal-tech/filevine-legal-software-case-types/
type: blog
schema: Article
draft: true
tracker_id: Blog:3
primary_keyword: filevine legal software
cluster: Legal Tech
launch_silo: Practice Management Software
silo_role: Commercial Support
approved_internal_links: /legal-tech/legal-technology-statistics/; /law-firms/law-firm-billing-statistics/; /legal-tech/smokeball-legal-software-time-capture/; /legal-tech/litify-legal-software-implementation/
research_record: content/research/blog-3.json
source_document: https://docs.google.com/document/d/1Z7Ell8DAGCywhHVFy9vxA8CuV9MaERPznpKXSF6jfMM/edit?usp=drivesdk
author: 
published: 
modified: 
---

# Filevine Legal Software: Configure the Case Type Before the Platform

A case-management system cannot decide how a firm handles a matter. It can only reflect the fields, stages, deadlines, permissions, billing rules, and exceptions that the implementation team defines.

That makes Filevine legal software difficult to evaluate from a feature list alone. Filevine provides organization-tailored quotes, and implementation can involve Filevine, a Certified Implementation Partner, and the firm’s own project owners. The buying decision therefore needs two documents: a commercial quote and a case-type configuration plan.

This guide uses public product and support documentation. It does not claim hands-on testing or a completed Filevine implementation. The goal is to help a firm define what must be demonstrated, configured, migrated, and accepted before rollout.

## Key Takeaways

The most important decisions happen before the team starts building templates or moving live matters.

- \*\*Pricing Requires a Quote:\*\* Filevine does not publish one universal per-user rate, so the firm needs a written scope covering products, users, implementation work, training, support, and recurring terms.  
- \*\*Case Types Should Drive Configuration:\*\* A personal-injury matter, litigation file, or other workflow may require different fields, stages, owners, deadlines, documents, and reports.  
- \*\*Organization Settings and Project Templates Are Different:\*\* Billing is enabled and configured at the organization level, while the Billing built-in section is added to a project template through the Customs Editor.  
- \*\*Default Changes Need Care:\*\* Filevine’s billing documentation warns that applying new defaults to existing projects overrides project-specific defaults and cannot be undone.  
- \*\*Migration Needs Reconciliation:\*\* Moving data is not finished when records import. The firm still needs to check field mapping, duplicates, relationships, balances, permissions, documents, and totals.  
- \*\*Acceptance Tests Should Use Realistic Scenarios:\*\* A configured workflow should be tested from intake through matter opening, task creation, billing, reporting, and export before wider rollout.

## Begin With One Case Type, Not the Entire Firm

The \[Filevine platform overview\](https://www.filevine.com/) presents a broad legal-work platform. A firm may eventually want several practice areas, departments, or matter types inside it. Trying to design all of them at once can hide important differences and make review harder.

Start with one case type that is important enough to represent real work but controlled enough to test. The team should be able to explain how that matter begins, which facts are required, who owns each stage, what creates a deadline, how billing works, and what information management needs at the end.

| Configuration Area | Question to Resolve | Evidence Needed for Acceptance |  
| --- | --- | --- |  
| Intake | Which facts determine whether the matter proceeds? | Required fields and routing test |  
| Matter opening | What must exist before work begins? | Complete sample matter record |  
| Stages | Which event moves the matter forward? | Stage-change rules and owner alerts |  
| Tasks and deadlines | What creates each action and due date? | Sample task chain with responsible users |  
| Documents | Which templates and approvals are required? | Generated, reviewed, and stored sample |  
| Billing | Which rates, codes, invoice rules, and payments apply? | Sample invoice and reconciliation check |  
| Reporting | Which fields support management decisions? | Report matched to source records |  
| Closing | What must be complete, retained, or exported? | Closed-matter checklist and export test |

Once the first case type works, the firm can decide which parts are reusable. Shared fields and controls may belong at a wider level, while practice-specific stages and documents may remain separate.

This sequence also prevents adoption from becoming a vague goal. Broader \[legal technology adoption\](https://verdictpoint.org/legal-tech/legal-technology-statistics/) can show that firms use modern systems, but implementation succeeds or fails at the level of a defined workflow.

## Map Fields, Stages, Owners, and Exceptions

A project template should capture the information the firm needs to perform work, supervise risk, communicate with the client, bill correctly, and report accurately. More fields are not automatically better. Every required field creates work and should support a clear decision or downstream action.

### Define the Minimum Required Record

Begin with the information needed to identify the client, describe the matter, check eligibility or conflicts, assign responsibility, and trigger the first action. Separate information that must be available at intake from details that can be completed later.

For each field, record the data type, whether it is required, who enters it, who reviews it, and where it will be used. A field that never appears in a workflow, document, report, search, or decision may not need to be mandatory.

### Make Stage Changes Meaningful

A stage should represent a real change in the matter. Moving from intake to accepted, for example, may require approval, an engagement document, assigned personnel, and a completed opening checklist.

The implementation team should define what permits the change, what becomes due afterward, which users are notified, and what happens when the normal path does not apply. That produces a workflow rather than a set of labels.

### Assign Owners and Backups

Every time-sensitive action needs an owner. The design should also state what happens when that person is absent, leaves the firm, or changes roles.

Ownership is especially important for exceptions. Missing documents, disputed data, rejected invoices, failed integrations, or migrated records that do not reconcile should have a clear review queue rather than disappearing into informal messages.

## Use a Hypothetical Configuration to Test the Design

The following example is an editorial design exercise, not a tested Filevine build. Its purpose is to show the level of detail a firm should bring to a demonstration or implementation workshop.

| Workflow Step | Proposed Record or Action | Owner | Acceptance Question |  
| --- | --- | --- | --- |  
| New inquiry | Intake record with source, contact, matter type, and conflict status | Intake team | Are required fields and routing correct? |  
| Matter accepted | Project created after approval and engagement requirements | Attorney or administrator | Can incomplete matters be prevented from advancing? |  
| Work begins | Stage change creates named tasks and deadlines | Matter team | Are owners, due dates, and backups correct? |  
| Billing prepared | Applicable billing settings and codes become available | Billing team | Does the sample invoice match the approved terms? |  
| Management review | Reporting fields feed a case-type dashboard | Operations | Do report totals match the source matters? |  
| Matter closed | Final checklist, permissions review, and export | Matter owner | Can the complete record be retrieved and reconciled? |

The sample should include at least one normal matter and one exception. An exception might contain a missing field, alternate fee arrangement, reassignment, or imported record. Testing only the ideal path can leave the most expensive problems undiscovered.

\> Editorial Design Note  
\> This workflow is a planning example. It does not represent a standard Filevine template, a vendor recommendation, or proof that every step is available under every commercial package.

## Separate Organization Settings From Project Templates

Configuration levels matter because a change at the organization level can affect many users or matters. The firm should document which decisions apply everywhere and which belong to one case type.

Filevine’s \[Billing Setup documentation\](https://support.filevine.com/hc/en-us/articles/360032734652-Billing-Setup) provides a useful example. Billing must first be enabled for the organization. The setup area covers rates, invoices, payments, email, codes, and related settings. The Billing built-in section is then added to a project template through the Customs Editor.

That structure creates several review questions. The firm needs to know which rates or codes are common, which differ by client or matter, who can change the settings, and how a template inherits or overrides a default.

The same documentation states that new default settings apply to newly created projects unless they are explicitly applied to existing projects. Applying them to existing projects overrides project-specific defaults, and the help page warns that the action cannot be undone.

\> Irreversible-Change Warning  
\> Before applying new billing defaults to existing projects, document the affected matters, export or record current settings, test the change outside live work where possible, obtain approval, and prepare a correction plan. Filevine’s help page states that the override itself cannot be undone.

This does not mean the change should never be used. It means a bulk setting deserves change control rather than an informal click during configuration.

## Treat Migration as a Data-Reconciliation Project

Migration has at least three parts: extracting information from the current system, transforming it into the new structure, and proving that the result is complete and usable. A successful upload does not complete the third part.

Before migration, the firm should inventory data sources and define the destination for each record type. The map should cover contacts, matters, custom fields, stages, tasks, deadlines, notes, documents, billing records, payments, users, permissions, and relationships between records.

The validation plan should explain how the team will detect and resolve problems:

- \*\*Missing Records:\*\* Compare source and destination counts by record type and case group.  
- \*\*Duplicate Contacts or Matters:\*\* Define matching rules and a process for uncertain results.  
- \*\*Field Conversion:\*\* Check dates, currency, selections, free text, identifiers, and empty values.  
- \*\*Broken Relationships:\*\* Confirm that clients, matters, documents, invoices, and payments remain linked correctly.  
- \*\*Financial Reconciliation:\*\* Match sample balances, invoices, payments, rates, and totals to the source.  
- \*\*Permission Review:\*\* Test access for representative roles, including restricted matters.  
- \*\*Document Retrieval:\*\* Open a sample of migrated files and confirm names, dates, versions, and matter placement.

The sample should include active, closed, simple, complex, and exception records. A random sample alone can miss rare but important structures.

## Build the Quote Around the Implementation Scope

The \[Filevine pricing page\](https://www.filevine.com/pricing/) uses organization-tailored quotes and describes Certified Implementation Partners together with ongoing Customer Success and Support. A Filevine legal software quote therefore needs more than a recurring subscription total.

Ask the vendor to separate products or modules, paid users, implementation services, partner work, migration, integrations, training, support, contract term, renewal treatment, and any usage-based charges. Older package lists should not be treated as current commitments unless they appear in the written proposal.

| Cost Area | What to Request in Writing |  
| --- | --- |  
| Subscription | Products, modules, users, term, billing frequency, and renewal basis |  
| Configuration | Included templates, fields, workflows, reports, and revision rounds |  
| Migration | Source systems, record types, document scope, transformations, and validation |  
| Integrations | Connector, direction of data flow, implementation owner, and recurring charge |  
| Training | Audiences, sessions, materials, recordings, and follow-up support |  
| Partner Services | Named provider, responsibilities, deliverables, rates, and change process |  
| Support | Coverage, channels, escalation path, and services excluded from support |

The full comparison should also include the internal time of subject-matter experts, operations, billing, IT, and project leadership. These costs may not appear on the vendor invoice, but they are part of the decision.

Using the same \[software total-cost components\](https://verdictpoint.org/legal-tech/clio-legal-software-total-cost/) across vendors helps prevent one proposal from looking cheaper simply because implementation or third-party work sits outside its headline price.

## Run Acceptance Tests Before Wider Rollout

Acceptance testing should determine whether the configured system performs the approved workflow with the right data, permissions, notices, and results. It is not the same as asking users whether they like the interface.

Prepare test cases before configuration finishes. Each case should state the starting record, action, expected result, actual result, evidence, owner, and resolution. Include tests for the normal path, exceptions, permissions, migration, reports, and integrations.

1. \*\*Create a Sample Intake:\*\* Confirm required fields, duplicates, assignment, and notifications.  
2. \*\*Open the Matter:\*\* Test approvals, project creation, permissions, and initial tasks.  
3. \*\*Advance Each Stage:\*\* Confirm that the expected owners, deadlines, and documents appear.  
4. \*\*Apply Billing Rules:\*\* Produce a sample invoice and reconcile it to the approved arrangement.  
5. \*\*Test an Existing-Project Change:\*\* Use controlled data and verify the effect before touching live matters.  
6. \*\*Review Role Access:\*\* Confirm what attorneys, staff, administrators, and restricted users can see and change.  
7. \*\*Run Management Reports:\*\* Trace totals and statuses back to individual source records.  
8. \*\*Export a Matter:\*\* Confirm that the firm can retrieve the expected data and documents in a usable form.

Every failed or partial result needs an owner and decision. The team may correct the configuration, change the workflow, obtain clarification, accept a documented limitation, or delay rollout.

## What Makes a Filevine Implementation Ready?

Filevine legal software is ready for broader use when the firm can demonstrate an approved case type from beginning to end, not merely when accounts exist and data has been imported.

The required evidence includes a signed configuration, reconciled migration results, tested permissions, accepted reports, trained users, documented exceptions, and a support path. The commercial agreement should match that operating scope and identify which work belongs to Filevine, an implementation partner, or the firm.

Starting with one case type creates a controlled way to learn. The firm can correct the design before repeating it, then extend only the parts that genuinely belong across other workflows.

## Frequently Asked Questions

These questions cover the pricing and configuration issues that buyers commonly need to settle before implementation.

### Does Filevine Publish a Standard Per-User Price?

No universal public rate was verified. Filevine provides organization-tailored quotes, so firms should request complete written pricing for their proposed scope.

### Does Filevine Configure Every Case Type the Same Way?

No. Firms should define fields, stages, tasks, documents, billing rules, permissions, reports, and exceptions for each case type they plan to deploy.

### Can New Billing Defaults Be Applied to Existing Projects?

Filevine’s billing documentation says they can be applied explicitly, but doing so overrides project-specific defaults and the action cannot be undone.

### Is Data Migration Complete Once Records Are Imported?

No. The firm still needs to reconcile record counts, field mappings, relationships, documents, financial data, permissions, and representative exception cases.

### What Should a Filevine Quote Include?

It should identify subscriptions, users, products, implementation services, migration, integrations, training, support, partner responsibilities, contract terms, and renewal treatment.

### Is This a Hands-On Filevine Review?

No. This guide is based on public documentation and an editorial implementation framework. Product behavior and commercial terms must be confirmed directly.

## Resources

The following official pages support the pricing, implementation, and billing-configuration information used in this guide.

- \*\*Filevine Pricing:\*\* https://www.filevine.com/pricing/  
- \*\*Filevine Platform Overview:\*\* https://www.filevine.com/  
- \*\*Filevine Billing Setup:\*\* https://support.filevine.com/hc/en-us/articles/360032734652-Billing-Setup

FACT CHECK / PUBLISHING NOTES

RECHECK BEFORE PUBLICATION:  
- Confirm that pricing remains organization-tailored and no universal rate has been published.  
- Confirm current products, modules, implementation-partner language, and support structure.  
- Recheck the Billing Setup page, including organization enablement and template configuration.  
- Confirm the warning about applying new defaults to existing projects.  
- Do not reuse historical package labels unless they appear in the current written quote.  
- Do not state a universal implementation duration.  
- Confirm that each planned internal-link destination exists at the approved slug.  
- Retain the disclosure that the workflow is an editorial example, not a tested Filevine build.
