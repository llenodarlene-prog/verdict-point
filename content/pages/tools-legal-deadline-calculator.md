---
title: Legal Deadline Calculator for Court Dates and Business Days
seo_title: Legal Deadline Calculator for Court Dates and Business Days
description: Count calendar or business days from a trigger date, skip weekends and federal holidays, and see each step of the count behind the deadline.
slug: /tools/legal-deadline-calculator/
type: page
schema: WebPage
tool: legal-deadline
breadcrumb: true
parent: /tools/
parent_label: Tools
draft: false
modified: 2026-10-28
---

# Legal Deadline Calculator for Court Dates and Business Days

Enter a start date and a number of days, then choose calendar or business days. The calculator finds the date, skips weekends and federal holidays where you choose, and shows every step of the count.

```tool
legal-deadline
```

## How the Calculator Works

This legal deadline calculator does date arithmetic. You supply the period from the rule, order, or statute that governs your matter, and the calculator counts it. It does not choose the rule for you, and it does not know about extensions, service methods, or local court closures unless you add them.

The default settings follow the general counting method in [Federal Rule of Civil Procedure 6(a)(1)](https://www.law.cornell.edu/rules/frcp/rule_6) for periods stated in days:

- Exclude the day of the event that triggers the period.
- Count every day, including intermediate Saturdays, Sundays, and legal holidays.
- Include the last day of the period. If the last day is a Saturday, Sunday, or legal holiday, the period continues to the next day that is not.

Rule 6(a)(5) says the "next day" is found by counting forward for periods measured after an event and backward for periods measured before an event. The calculator follows that direction when it moves a deadline off a weekend or holiday.

## Calendar Days and Business Days

**Calendar days** count every day on the calendar. Weekends and holidays in the middle of the period still count. Only the last day can move.

**Business days** skip Saturdays, Sundays, federal holidays, and any dates you add. Some court rules, contracts, and agency regulations count this way. Check the wording of the rule you are applying, because a business-day count usually ends later than a calendar-day count of the same number.

The **Count the start date as day 1** option is off by default because Rule 6(a)(1)(A) excludes the trigger day. Turn it on only when your rule or agreement counts the first day.

## Federal Holidays Used

The calculator treats the federal legal public holidays listed in [5 U.S.C. 6103](https://www.law.cornell.edu/uscode/text/5/6103) as non-business days. When a holiday falls on a Saturday, the Friday before is observed. When it falls on a Sunday, the Monday after is observed. The calculator uses those observed dates.

Table: Federal holidays in 2026, with observed dates
| Holiday | Date | Observed |
| --- | --- | --- |
| New Year's Day | Thursday, January 1 | Thursday, January 1 |
| Birthday of Martin Luther King, Jr. | Monday, January 19 | Monday, January 19 |
| Washington's Birthday | Monday, February 16 | Monday, February 16 |
| Memorial Day | Monday, May 25 | Monday, May 25 |
| Juneteenth National Independence Day | Friday, June 19 | Friday, June 19 |
| Independence Day | Saturday, July 4 | Friday, July 3 |
| Labor Day | Monday, September 7 | Monday, September 7 |
| Columbus Day | Monday, October 12 | Monday, October 12 |
| Veterans Day | Wednesday, November 11 | Wednesday, November 11 |
| Thanksgiving Day | Thursday, November 26 | Thursday, November 26 |
| Christmas Day | Friday, December 25 | Friday, December 25 |

Table: Federal holidays in 2027, with observed dates
| Holiday | Date | Observed |
| --- | --- | --- |
| New Year's Day | Friday, January 1 | Friday, January 1 |
| Birthday of Martin Luther King, Jr. | Monday, January 18 | Monday, January 18 |
| Washington's Birthday | Monday, February 15 | Monday, February 15 |
| Memorial Day | Monday, May 31 | Monday, May 31 |
| Juneteenth National Independence Day | Saturday, June 19 | Friday, June 18 |
| Independence Day | Sunday, July 4 | Monday, July 5 |
| Labor Day | Monday, September 6 | Monday, September 6 |
| Columbus Day | Monday, October 11 | Monday, October 11 |
| Veterans Day | Thursday, November 11 | Thursday, November 11 |
| Thanksgiving Day | Thursday, November 25 | Thursday, November 25 |
| Christmas Day | Saturday, December 25 | Friday, December 24 |

New Year's Day 2028 falls on a Saturday, so Friday, December 31, 2027 is also an observed federal holiday. The calculator includes it.

Rule 6(a)(6) also treats days declared a holiday by the President or Congress as legal holidays, and for periods measured after an event, holidays declared by the state where the district court sits. Those days are not built in. Add them with **Other dates to exclude**.

## Worked Examples

**Calendar days with a holiday at the end.** A 29-day period starts on Wednesday, October 28, 2026. Day 29 is Thursday, November 26, which is Thanksgiving. Under the default settings, the deadline moves to Friday, November 27, 2026.

**Business days across a holiday.** Five business days after Friday, November 20, 2026 are November 23, 24, and 25, then November 27 and 30. Thanksgiving is skipped, so the result is Monday, November 30, 2026.

**Counting backward.** A deadline 10 calendar days before Tuesday, July 14, 2026 first lands on Saturday, July 4. Friday, July 3 is the observed Independence Day holiday, so the date moves back to Thursday, July 2, 2026.

These examples show how the counting works. They are not statements about the deadline in any real case.

## Limits of the Calculator

A court deadline can depend on the jurisdiction, the type of filing, the method of service, court orders, local rules, and emergency closures. This tool does not apply those rules automatically. It does not add the three days that some service methods allow, it does not count periods stated in hours, and it does not know when a clerk's office is inaccessible.

Use the result as a check on your own count, and confirm it against the governing rule, any court order, and the local rules before you rely on it.

## Frequently Asked Questions

### How Do You Count Days for a Court Deadline?

Under the federal method in Rule 6(a)(1), you exclude the trigger day, count every following day including weekends and holidays, and include the last day. If the last day is a Saturday, Sunday, or legal holiday, the deadline moves to the next day that is not. State courts and other rules can differ.

### Does the Calculator Count Weekends?

In calendar-day mode, weekends in the middle of the period count, and only a deadline that lands on a weekend moves. In business-day mode, weekends are skipped while counting.

### Which Holidays Does It Skip?

It skips the federal legal public holidays in 5 U.S.C. 6103, using their observed dates. You can turn holidays off, or add state holidays and court closures as excluded dates.

### Can I Count Backward from a Hearing Date?

Yes. Choose **Before the start date**. If the count lands on a weekend or holiday, the calculator moves the date earlier, following Rule 6(a)(5).

### Does the Calculator Store My Dates?

No. The calculator runs in your browser and does not send, save, or log the dates you enter. A shared link contains only the dates and settings you chose.

## Sources and Methodology

The counting method and holiday list come from the sources below, opened and checked on October 28, 2026. Holiday dates are calculated from the statutory rules, not copied from a list, and are tested against the dates shown above.

- [Federal Rule of Civil Procedure 6, Computing and Extending Time](https://www.law.cornell.edu/rules/frcp/rule_6), Legal Information Institute, Cornell Law School
- [5 U.S.C. 6103, Holidays](https://www.law.cornell.edu/uscode/text/5/6103), Legal Information Institute, Cornell Law School, including the note on Executive Order 11582 for Sunday holidays
