# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Platform admins who manage users, workspaces and audit trails across the ecosystem (fe-movements, fe-keep and sibling apps), plus end users who manage their own household and workspaces.

## Product Purpose

Identity Admin is the front end of a central identity service (Keycloak-backed auth). It lets admins browse users and workspaces, invite members, change roles, transfer ownership and read audit logs, and lets end users create and run a household. Success: access and hierarchy changes are done quickly, correctly and with a visible trail.

## Positioning

One shared place for identity, workspaces and roles that sibling apps consume, plus hierarchical households where power is tiered by level.

## Operating Context

- Authenticated via Keycloak; name and email come from the token (no /me endpoint yet).
- Routes: Usuarios, Workspaces, Household. Settings is a disabled placeholder.
- Household levels: a higher number means less power; a member can only be managed by someone with a strictly lower level. Members can be "supervised".

## Capabilities and Constraints

- Create/join household, add members by email at a level above the caller's, change level, remove members.
- Workspace flows: create, invite, change role, transfer ownership, audit log.
- Household model has no parent-child edges, only levels (tiers), so the tree cannot show who reports to whom.
- Stack is fixed: React 19, Vite, antd 6, TanStack Router.

## Brand Commitments

- Visual and navigation consistency with fe-movements (same sticky navbar pattern).
- UI copy in Rioplatense Spanish (voseo).
- Light and dark themes always supported.

## Evidence on Hand

Working implementation only. No testimonials, metrics or external brand assets.

## Product Principles

- Permission boundaries are always legible: users see what they can and cannot manage.
- Destructive or hierarchy-changing actions are explicit and confirmed.
- Consistency with sibling apps beats local novelty.
- Admin and end-user tasks share one product; neither should feel like a leftover.

## Accessibility & Inclusion

WCAG AA as the baseline: contrast, full keyboard operation, screen-reader labels.
