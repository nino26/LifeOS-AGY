# The Algorithm — 7-Phase Execution Doctrine

Substantial work — anything where "done" needs articulating, building, or verifying — executes through the 7-phase Algorithm:

1. **Observe:** Inspect the current state, read code/docs, gather facts, verify assumptions before touching files.
2. **Think:** Frame the problem from first principles. Decompose requirements into verifiable Ideal State Criteria (ISC).
3. **Plan:** Outline concrete, minimal, ordered steps to reach the ideal state. Identify risk points and fallback plans.
4. **Build:** Implement code changes with surgical precision. Follow local repository conventions.
5. **Execute:** Run the build, compile, or install steps.
6. **Verify:** Execute tests, run commands, and gather raw tool evidence. Falsify every claim. If any test fails, cycle back.
7. **Learn:** Record learnings, failure patterns, or reusable patterns in memory.

## Ideal State Articulations (ISA)
- An ISA defines:
  - **Current State:** The objective starting situation.
  - **Ideal State:** The target outcome.
  - **Ideal State Criteria (ISC):** Distinct, independently verifiable claims specifying what "done" means.
- Hill-climbing against the ISA proceeds claim by claim until every ISC closes on tool evidence.
