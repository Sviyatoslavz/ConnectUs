# CRM logic

Treat every case as a CRM record, even when the user is just describing a situation in chat.
Reconstruct the record from what they said and ask only for what's genuinely missing.

## Minimum record

| Field | Why it matters |
|---|---|
| Lead source | Tells you which channel to fund and which to kill |
| Contact + role | "Manager" and "owner" are different deals |
| Company + size | Determines cycle length and who else must approve |
| Stage | Must match an observable exit criterion, not a feeling |
| Deal value | Without it, forecasting and prioritization are impossible |
| Probability | Derived from qualification, not optimism |
| Next step + date | A deal without a scheduled next step is not a deal |
| Activity history | What was said, sent, promised |
| Decision maker | Named, or flagged as unknown — never assumed |
| Close date | Realistic, based on the client's own timeline |

## Stage definitions must be behavioral

Bad: "Interested". Good: "Confirmed a specific problem and agreed to a demo on a set date."

Write each stage as something the *client* did, not something the seller feels. This alone
fixes most inflated pipelines.

## Enterprise stage architecture

For longer cycles, tie every stage to an exit criterion and a qualification element. A deal cannot
advance without the evidence — this is what stops pipeline inflation.

| # | Stage | Prob. | Exit criterion | Required evidence |
|---|---|---|---|---|
| 01 | Discovery | 10% | Business pain confirmed by the client, with a number | Identified pain |
| 02 | Validation | 25% | Technical fit approved by the evaluator | Decision criteria |
| 03 | Proposal | 50% | Business case accepted by the economic buyer | Metrics + champion |
| 04 | Negotiation | 75% | Contract in legal review, terms agreed | Economic buyer + paper process |
| 05 | Closed won | 100% | Signed contract and PO | All elements verified |

Enforce this in review: if the evidence isn't there, the deal moves back a stage. Reps will resist
this once and then forecast honestly forever after.

## Qualification scoring

Score 0–2 on each, sum to 20. Below 10 = deprioritize or qualify out.

1. Confirmed pain the client named themselves
2. Quantified cost of the pain (money or time)
3. Budget exists or can be found
4. Decision maker identified
5. Decision maker engaged directly
6. Decision process and timeline known
7. Competition known
8. Urgency has an external driver (deadline, contract expiry, regulation, season)
9. Champion inside the company who wants this to happen
10. Agreed, scheduled next step

## Hygiene rules

- Close dates in the past = the pipeline is fiction. Clean weekly.
- Any deal with no activity in 14 days gets an explicit decision: revive, downgrade, or close-lost.
- Log loss reason on every lost deal, from a fixed list. Free-text loss reasons produce no insight.
- One deal, one next step. If there are three "next steps", none of them will happen.

## Small-team setup (2–10 reps)

You don't need enterprise software. A well-structured spreadsheet or a light CRM with these
columns beats a badly used enterprise system:

Date in | Source | Company | Contact | Role | Stage | Value | Probability | Next step |
Next step date | Last contact | Loss reason

Add automation only where a human is copying data by hand — form/webhook → sheet → notification
to the rep. Automate logging first, reporting second, outreach last.
