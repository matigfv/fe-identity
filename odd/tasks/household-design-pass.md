# household-design-pass

Objective: apply the /impeccable critique of /household (22/40) in order. Scope: HouseholdTree.tsx, AddHouseholdMemberModal.tsx, NavHeader.tsx (user approved touching it). UI copy stays Rioplatense Spanish; code in English.

Delivery: ~400 authored-line heuristic; one commit per task on feat/household-design-pass. Route: delegated writer (2+ non-trivial files). No runnable RED (no test runner in package.json); checks: `pnpm exec tsc -b`, `pnpm lint`, `pnpm build`.

## Tasks
- [x] T1 clarify: level legend, "Nivel N · más poder" caption, drop duplicate Tag, lock + Tooltip on non-manageable members, consequence-aware remove confirm, Reintentar on load error
- [x] T2 harden: NavHeader focus-visible + keyboard-operable profile menu/tiles/avatar/logo, larger action buttons with Tooltips and 8px gap, InputNumber max, callerLevel fallback, Popover level reset + Cancel
- [x] T3 adapt: fluid cards at 390px, Tooltip on truncated names
- [x] T4 onboard: purposeful empty state, first-member nudge when alone
- [ ] T5 shape: restrained tier identity (header band/connector), light+dark safe
- [ ] T6 polish: final pass

## Evidence
(commit ids and check results recorded as tasks close)

- T1: tsc -b OK, lint OK commit d35d6c1
- T2: tsc -b OK, lint OK
- T2 commit 7a76adb
- T3: tsc -b OK, lint OK
- T3 commit 4fd128e
- T4: tsc -b OK, lint OK
