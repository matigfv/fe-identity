# household-design-pass

Objective: apply the /impeccable critique of /household (22/40) in order. Scope: HouseholdTree.tsx, AddHouseholdMemberModal.tsx, NavHeader.tsx (user approved touching it). UI copy stays Rioplatense Spanish; code in English.

Delivery: ~400 authored-line heuristic; one commit per task on feat/household-design-pass. Route: delegated writer (2+ non-trivial files). No runnable RED (no test runner in package.json); checks: `pnpm exec tsc -b`, `pnpm lint`, `pnpm build`.

## Tasks
- [x] T1 clarify: level legend, "Nivel N · más poder" caption, drop duplicate Tag, lock + Tooltip on non-manageable members, consequence-aware remove confirm, Reintentar on load error
- [x] T2 harden: NavHeader focus-visible + keyboard-operable profile menu/tiles/avatar/logo, larger action buttons with Tooltips and 8px gap, InputNumber max, callerLevel fallback, Popover level reset + Cancel
- [x] T3 adapt: fluid cards at 390px, Tooltip on truncated names
- [x] T4 onboard: purposeful empty state, first-member nudge when alone
- [x] T5 shape: restrained tier identity (header band/connector), light+dark safe
- [x] T6 polish: final pass

## Evidence
(commit ids and check results recorded as tasks close)

- T1: tsc -b OK, lint OK commit d35d6c1
- T2: tsc -b OK, lint OK
- T2 commit 7a76adb
- T3: tsc -b OK, lint OK
- T3 commit 4fd128e
- T4: tsc -b OK, lint OK
- T4 commit 563cd90
- T5: tsc -b OK, lint OK
- T5 commit 053ce60
- T6: tsc -b OK, lint OK, build OK (hash in git log: polish commit)

## Round 2 (critique 24/40)
- [x] T7 clarify: no lock on the self card; per-case lock reason; visible fallback when callerLevel is missing
- [ ] T8 adapt: lock reason visible on touch (short visible label or tap Popover)
- [ ] T9 harden: keyboard-reachable "Próximamente" on disabled profile tile (aria-disabled), InputNumber autoFocus + inline save error in level Popover, no Tooltip/Popover/Popconfirm stacking
