---
title: Planning a Harvey Legal AI Pilot
seo_title: Planning a Harvey Legal AI Pilot
description: Run a Harvey Legal AI pilot with fixed tasks, lawyer review, security gates, and pass criteria that separate a strong demo from proven value.
slug: /legal-tech/harvey-legal-ai-pilot/
type: blog
schema: Article
draft: true
tracker_id: Blog:9
primary_keyword: harvey legal ai
cluster: Legal Tech
launch_silo: Legal AI
silo_role: Commercial Support
approved_internal_links: /legal-tech/ai-in-law-firms-statistics/; /legal-tech/legal-technology-statistics/; /legal-tech/lexisnexis-legal-ai-source-checking/; /legal-tech/everlaw-ediscovery-document-review/
research_record: content/research/blog-9.json
source_document: https://docs.google.com/document/d/1U3d8b3dK0kwf0BAIubbOa1l9bsKAJXyMwoprNdCw9SM/edit?usp=drivesdk
author: 
published: 
modified: 
---

# How to Run a Harvey Legal AI Pilot That Produces a Clear Decision

A Harvey Legal AI pilot should answer one practical question. Can the product improve a defined legal workflow without creating unacceptable risk or review work? A polished demo cannot answer that. The firm needs its own tasks, baseline results, reviewers, failure rules, and security limits.

Public research can inform the design, but it cannot predict a firm’s outcome. Harvey publishes benchmark and security information that helps buyers ask better questions. The firm must still test its workflow under approved conditions. This guide provides a 30-day structure for that work.

## Key Takeaways

A credible pilot starts before anyone submits a prompt. Agree on the job, evidence, and decision rule first.

* **Test one bounded workflow.** A broad trial produces opinions instead of comparable evidence.  
* **Build a baseline.** Experienced lawyers should complete or score the same task set.  
* **Use holdout tasks.** Keep some tasks unseen until the formal test begins.  
* **Track correction time.** Fast output has limited value when review and repair consume the gain.  
* **Define critical failures.** Fabricated authority, missed issues, and confidentiality errors may require an automatic stop.  
* **Review security documents.** Product pages do not replace the contract, DPA, subprocessors, and internal approval.  
* **Decide with several measures.** Avoid one blended score that hides a serious weakness.

## A Demo Is Not a Pilot

A demo shows selected capabilities under favorable conditions. A pilot tests repeatable work under agreed controls. That difference changes the evidence a buying team collects.

A demo may use a clean document and a skilled presenter. A firm pilot should include realistic instructions, imperfect source files, and normal review steps. It should also record failures, retries, and manual corrections.

Use this comparison before the project starts.

| Question | Product Demo | Controlled Pilot |
| :---- | :---- | :---- |
| **Who selects the tasks?** | Usually the vendor | The firm and reviewers |
| **What data is used?** | Prepared examples | Synthetic or authorized material |
| **Is there a baseline?** | Usually no | Yes, set before testing |
| **Are failures recorded?** | Selected examples may dominate | Every scored output is retained |
| **Is review time measured?** | Rarely | Yes, by task and reviewer |
| **Is security tested?** | Explained at a high level | Checked against firm requirements |
| **What does the result support?** | Product understanding | A scoped go, revise, or stop decision |

⟧

The distinction also helps teams discuss [AI adoption versus performance](https://verdictpoint.org/legal-tech/ai-in-law-firms-statistics/). Broader [legal technology statistics](https://verdictpoint.org/legal-tech/legal-technology-statistics/) can add market context. High use does not prove reliable performance on a specific task.

## Select One Bounded Legal Workflow

The first Harvey Legal AI test should focus on a recurring workflow with clear inputs and outputs. Avoid “general legal research” as the scope. It lacks a stable finish line.

Good candidates have enough volume to justify testing. They also allow experienced lawyers to define acceptable work. Examples may include a first-pass contract issue list, a chronology from approved records, or a research memo with source requirements.

## Define the Task Boundary

Write a task card for every pilot workflow. It should explain what the system may do and what remains human work.

Include these fields:

* **Input:** State the permitted document types, sources, and volume.  
* **Instruction:** Use one approved prompt pattern and record later changes.  
* **Output:** Define the expected format, length, and required citations.  
* **Exclusions:** List decisions the system must not make.  
* **Reviewer:** Name the lawyer accountable for the final assessment.  
* **Failure policy:** State which errors require rejection or escalation.

Keep client-facing advice outside the first pilot unless risk leaders approve it. Internal work creates a safer place to learn how review burden changes.

## Set an Acceptable Failure Policy

Not every error carries equal harm. A formatting defect is different from a false legal authority. Score severity as well as frequency.

Use at least three levels:

1. **Critical:** Fabricated authority, confidentiality breach, missed dispositive issue, or prohibited action.  
2. **Material:** Unsupported conclusion, wrong jurisdiction, incomplete analysis, or major factual error.  
3. **Minor:** Style, organization, citation format, or non-substantive wording issue.

Decide whether any critical failure stops the pilot. Make that choice before the team sees results.

## Build a Lawyer-Reviewed Baseline and Holdout Set

A baseline shows how the current process performs. Without it, the pilot can only measure preference. It cannot support a time, quality, or cost comparison.

Choose 10 to 20 representative tasks. Keep the mix close to actual work. Harvey’s public Legal Agent Benchmark uses far more tasks, but your pilot should stay controlled and reviewable.

## Create the Reference Record

For each task, have qualified lawyers document expected issues and source requirements. The record need not dictate one perfect answer. It should identify the minimum acceptable elements.

Record the following details:

* **Expected issues:** The points a competent output should address.  
* **Allowed sources:** Approved databases, documents, and date limits.  
* **Required authority:** Controlling or preferred sources where applicable.  
* **Known traps:** Ambiguous facts, exceptions, or jurisdiction conflicts.  
* **Baseline time:** Active work and review time under the current process.  
* **Acceptance rule:** Minimum quality plus any automatic failure.

Use de-identified, synthetic, or expressly authorized material. Do not upload live client files simply to make the trial feel realistic.

## Protect the Holdout Tasks

Use part of the set for prompt development. Reserve the rest for the scored test. This reduces the risk of tuning instructions around known answers.

Lock the final prompts, product configuration, model selection, and allowed tools. Record changes if the vendor updates the environment during testing. A changed setup can invalidate comparisons across test days.

## Score Quality and Review Burden Separately

A single pilot score can hide a serious problem. One strong measure may cancel a weak one on paper. Keep legal quality, completion, review time, and usability in separate columns.

The scorecard below supports a clearer decision.

| Dimension | What to Measure | Suggested Evidence |
| :---- | :---- | :---- |
| **Source validity** | Citations exist and match the stated authority | Citation-by-citation review |
| **Completeness** | Required issues and exceptions appear | Baseline checklist |
| **Legal reasoning** | Rules connect correctly to stated facts | Lawyer rating with comments |
| **Factual accuracy** | Statements match approved records | Source comparison |
| **Correction burden** | Minutes spent checking and fixing | Reviewer time log |
| **Task completion** | Output meets every required element | Pass or fail against the task card |
| **Workflow fit** | Users can repeat the process consistently | Observed sessions and error notes |

⟧

Source checking deserves its own procedure. Teams can use the same principle described in [verifying legal AI citations](https://verdictpoint.org/legal-tech/lexisnexis-legal-ai-source-checking/). Review teams should also test how findings move through [collaborative document review](https://verdictpoint.org/legal-tech/everlaw-ediscovery-document-review/). A citation can exist without supporting the generated sentence.

## Measure Net Review Time

Record generation time, active review time, correction time, and rework. Compare their sum with the baseline. Do not count unattended processing as lawyer time.

Use this simple calculation:

Net time change = baseline active time minus pilot active time.

Keep the calculation at task level. An average may hide a workflow that saves time on easy files but loses time on harder ones. Report the distribution and any critical failures beside the time figure.

## Record Reviewer Agreement

Two reviewers may judge the same output differently. Use a short calibration session before scoring. Have reviewers score the same few examples and discuss disagreements.

Do not erase the disagreement. Record it. Low agreement may mean the rubric needs clearer definitions.

## Use Harvey’s Benchmark as Context, Not Proof

Harvey’s [Legal Agent Benchmark](https://www.harvey.ai/blog/introducing-harveys-legal-agent-benchmark) provides useful public context. Harvey describes 1,250 tasks across 24 practice areas and more than 75,000 expert-written rubric criteria. The benchmark uses strict criteria for long-horizon legal-agent tasks.

Harvey’s [initial LAB results](https://www.harvey.ai/blog/legal-agent-benchmark-initial-results) reported less than 10% aggregate end-to-end completion. That result applied to evaluated frontier models under an all-criteria-pass method. It is not Harvey customer accuracy. It also does not state a general hallucination rate.

The benchmark supports two pilot choices. First, score complete task performance rather than impressive fragments. Second, expect results to differ across practice areas and task types.

Do not copy the benchmark’s percentage into an ROI model. Your task set, configuration, instructions, and reviewers will differ.

## Set Security and Procurement Gates

Security review should run beside quality testing. A good output cannot excuse an unacceptable data arrangement. The buyer needs product controls, contract terms, and internal operating rules.

Harvey’s [security page](https://www.harvey.ai/security) describes model-provider zero-data-retention requirements. It also says customer inputs, outputs, and uploaded documents do not train underlying models. The page describes regional options and customer data controls. These are vendor statements that the contract should reflect.

## Check the Proposed Arrangement

Ask the vendor to map its answers to the exact pilot configuration. Product-wide statements may not resolve an account-specific setting.

Review these items before uploading approved material:

* **Permitted data:** Define client, personal, confidential, and privileged data rules.  
* **Processing region:** Confirm storage, processing, backup, and support locations.  
* **Retention:** State defaults, deletion timing, logs, and legal hold handling.  
* **Model providers:** Identify subprocessors and the terms applied to them.  
* **Access controls:** Test SSO, roles, audit logs, and ethical walls.  
* **Incident process:** Confirm notice timing, investigation support, and evidence access.  
* **Bespoke training:** Clarify whether any customer-specific training is requested or allowed.

Harvey announced [ISO 42001 certification](https://www.harvey.ai/blog/governance-iso-42001) in June 2026. Treat that as one governance signal. It does not replace review of scope, certificate details, controls, and contract obligations.

## Run a Controlled 30-Day Pilot

The project needs enough time for setup, scoring, and correction. It does not need an open-ended trial. A four-week schedule keeps the evidence focused.

Use this sequence:

1. **Week 1, design:** Approve scope, task cards, data rules, baseline, rubric, and failure policy.  
2. **Week 2, calibrate:** Test prompts on development tasks and align reviewer scoring.  
3. **Week 3, evaluate:** Run holdout tasks, record every output, and log review time.  
4. **Week 4, decide:** Analyze quality, failures, cost, adoption, and control gaps.

Do not add unrelated workflows during week three. Put new ideas in a later-test list. Scope changes weaken the comparison and delay the decision.

## Make a Go, Revise, or Stop Decision

The final meeting should answer whether one workflow can enter controlled use. It should not decide whether the product is “good” in general.

Use three possible outcomes:

* **Go:** The workflow meets quality, security, time, and ownership thresholds.  
* **Revise:** The evidence supports another bounded test after named changes.  
* **Stop:** Critical failures, poor economics, or unresolved controls outweigh benefits.

For cost analysis, use your own time records and quoted commercial terms. Keep profitability and cost definitions consistent across the business case. Do not count gross time saved as profit.

Name the approval owner and operating owner. Also set review dates for product changes, incidents, and declining performance.

## Preserve the Pilot Evidence

## 

## Store the approved task set, prompt versions, outputs, scores, and reviewer notes together. Include the product configuration and test dates. Future reviewers need that context to understand the result.

## 

## Keep failed outputs as well as successful ones. They show where controls or instructions broke down. They also prevent later teams from repeating an unsafe test.

## 

## Schedule a retest when models, data sources, or major workflow features change. A prior pass supports one tested configuration. It should not become permanent approval for every future version.

## 

## Frequently Asked Questions

These answers address common pilot questions. They do not replace legal, security, or procurement review.

## How Many Tasks Should a Harvey Legal AI Pilot Include?

Ten to 20 representative tasks can support a focused first pilot. Use enough variation to expose workflow risks without overwhelming reviewers.

## Should the Pilot Use Real Client Files?

Use synthetic, de-identified, or expressly authorized material. Follow firm policy, client terms, and approved security controls.

## Does Harvey’s Benchmark Prove Product Accuracy?

No. LAB is Harvey-published research with its own tasks and strict scoring. It does not report customer accuracy for every deployment.

## What Is the Most Useful Pilot Metric?

No single metric is enough. Track source validity, completeness, error severity, review time, and workflow fit separately.

## How Should a Firm Evaluate Harvey Legal AI Pricing?

Use a written quote and the firm’s own workload data. Include seats, services, implementation, review labor, and contract terms.

## Make the Pilot Evidence Worth Keeping

A controlled pilot should leave an audit trail, not a stack of impressions. Keep task cards, prompts, outputs, reviewer notes, time logs, and decision records. That file supports procurement, governance, and later retesting.

Verdict Point helps legal teams compare technology with repeatable methods. Use this scorecard to turn a product trial into a decision leaders can defend.

## Resources

* [Introducing Harvey’s Legal Agent Benchmark](https://www.harvey.ai/blog/introducing-harveys-legal-agent-benchmark)  
* [Legal Agent Benchmark Initial Results](https://www.harvey.ai/blog/legal-agent-benchmark-initial-results)  
* [Harvey Security](https://www.harvey.ai/security)  
* [Harvey ISO 42001 Announcement](https://www.harvey.ai/blog/governance-iso-42001)

**Publication Note:** This guide uses public desk research, not a hands-on Harvey pilot. Recheck pricing, packaging, security claims, model support, and feature availability within seven days of publication.
