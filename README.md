# ATC Workspace — Shelter Indonesia

Shared activity dashboard for Accounting, Tax and Compliance. Indonesian UI; three parallel division columns; authenticated D1 storage; 15-second foreground polling; server-side division permissions; comments, calendar, audit history, reversible archive, and CSV export.

## Access

New deployment is owner-private. Open it as the owner first to initialize the application administrator. Add members by their ChatGPT account email, name and division in **Anggota tim**, then grant those same addresses access through the Site's platform sharing settings. Registering an application member alone does not invite or grant platform access. All members see all divisions; members edit their own division and comment across divisions; viewers can only read. Admin can edit all divisions and manage members. Member deactivation immediately blocks application API access.

## Data

D1 binding: `DB`. Schema: `db/schema.ts`; initial schema-only migration: `drizzle/0000_deep_shockwave.sql`. No operational or demo seed records are deployed. Empty workspaces can display a clearly labelled, read-only example board, replaced by the first actual record. Browser storage is not used for shared records.

Updates use optimistic versions and return HTTP 409 on stale saves. Updates and audit entries share atomic database batches. No task hard-delete endpoint is provided. Evidence is an external HTTP(S) link, whose source-document access must be managed separately.

Accurate Online and Coretax are not integrated in this version; they remain the ledger and tax system respectively. This app tracks work, progress and evidence references.

## Validation

`node node_modules/typescript/bin/tsc --noEmit` and the supported Sites build helper. Backend integration checks use the built Worker and an isolated ephemeral Miniflare database with fixture identities; no test records or test authentication bypass is added to production. Nineteen checks passed covering authentication, invitations, division authorization, validation, comments, optimistic conflict handling, archive/restore, atomic audit and deactivation. Browser QA covered desktop layout, status filtering, task detail and calendar navigation. Mobile uses a horizontally scrollable board and collapsible navigation.

Publishing and migration handling use the supported Sites workflow; preserve `.openai/hosting.json`, hosted project identity and current access policy.
