# Workflow Core TODO

**Maturity Tier:** `Hardened`

## Shipped Now

- Exports 1 governed action: `workflow.instances.transition`.
- Owns 1 resource contract: `workflow.instances`.
- Publishes 6 workflow definitions with state-machine descriptions, approval side effects, and recovery paths.
- Registers a bounded UI surface that can be hosted by the surrounding admin or portal shell.
- Defines a durable data schema contract even though no explicit SQL helper module is exported.

## Current Gaps

- No dedicated integration test lane is exported in this repo today; validation currently leans on build, lint, typecheck, and test lanes.
- The plugin owns durable data state, but it does not yet ship a dedicated migration verification lane in this repo.
- The plugin exposes a UI surface, but not a richer admin workspace contribution module.

## Recommended Next

- Add targeted integration coverage for AI approvals, escalations, and company-work recovery paths.
- Add explicit migration or rollback coverage if workflow instance state becomes more operationally sensitive.
- Add richer execution-state and replay guidance if more plugins adopt workflow-driven orchestration.
- Add stronger operator-facing reconciliation and observability surfaces where runtime state matters.
- Broaden the admin entry surface only if operators need more than the current embedded view or resource listing.

## Later / Optional

- Visual editors or migration helpers for workflow definitions once the current state-machine contract hardens.
- Dedicated federation or external identity/provider adapters once the core contracts are stable.
