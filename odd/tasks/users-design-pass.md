# users-design-pass

Objective: apply the /impeccable critique of /users (20/40), P1 + P2, replacing the faked 24-column list with a real antd Table. Scope: src/components/users/AdminUsersList.tsx (and src/routes/_authenticated/users.tsx only if a heading change needs it). UI copy Rioplatense Spanish; code in English. Branch stacked on feat/household-design-pass.

Route: delegated writer. No test runner; checks: `pnpm exec tsc -b`, `pnpm lint`, `pnpm build`. ~400 authored-line planning heuristic per task.

## Tasks
- [x] U1 harden+adapt: replace Card/Row/Col rows with antd Table (expandable rows with built-in keyboard/aria, sticky header, responsive: hide secondary columns below md, no 390px overflow), semantic h1, search aria-label, fix formatDate RangeError on invalid dates, fix name display (givenName null + familyName set), email not shown twice, ellipsis + title on long values (done; tsc + lint clean; 07adc44)
- [x] U2 layout: result count ("N de M"), sort (name, createdAt), filters (tipo, rol, sin workspace, onboarding pendiente), accent- and case-insensitive search incl. surname, pagination, clear-search action in empty state (done; tsc + lint clean)
- [ ] U3 clarify: Spanish labels (Propietario etc., Personal/Empresa), humanized api names, error Alert with Reintentar and no internal service name, explain "Tour" states
- [ ] U4 quieter: remove per-row hover shadow, muted header via Table, inline first two workspace names + "+N"

## Evidence
