/** Host-plugin contribution for workflow-core.
 *
 *  Visual automations: triggers (event, schedule, manual) → action
 *  graphs. The engine subscribes to the record event bus, runs cron,
 *  and operates a worker pool for concurrent runs. All wrapped in
 *  `withLeadership("workflow:engine")` so multi-instance clusters
 *  elect a single engine leader. */
import type { HostPlugin } from "@gutu-host/plugin-contract";
import { withLeadership } from "@gutu-host/leader";
import { migrate } from "./db/migrate";
import { workflowRoutes } from "./routes/workflows";
import { startWorkflowEngine, stopWorkflowEngine } from "./lib/workflow/engine";

let stopLeader: (() => void) | null = null;

export const hostPlugin: HostPlugin = {
  id: "workflow-core",
  version: "1.0.0",
  manifest: {
    label: "Workflows",
    description: "Visual automation engine. Triggers (event/cron/manual) → directed action graphs. Concurrent run worker pool. Run history + per-step error capture.",
    icon: "Workflow",
    vendor: "gutu",
    permissions: ["db.read", "db.write", "audit.write", "events.subscribe", "events.publish", "net.outbound"],
  },
  dependsOn: [],
  consumes: ["notifications.dispatch"],
  migrate,
  routes: [
    { mountPath: "/workflows", router: workflowRoutes },
  ],
  start: (ctx) => {
    // Cache the notification dispatch capability looked up via the
    // cross-plugin registry. The engine's `notify` action steps use
    // this instead of a hard import — swap notifications-core for any
    // other plugin that registers `notifications.dispatch.default` and
    // workflows keep working unchanged.
    const dispatch = ctx.registries.ns<{
      send(args: { tenantId: string; channel: "in-app" | "email" | "webhook" | "sms"; subject?: string; body: string; recipient?: string }): Promise<void>;
    }>("notifications.dispatch").lookup("default");
    if (dispatch) {
      // Make available to engine internals; the engine's notify action
      // resolves it from the global registry on demand. Nothing here
      // assumes a fixed import — the contract is "registered or not".
      (globalThis as any).__GUTU_NOTIFY__ = dispatch;
    }
    stopLeader = withLeadership("workflow:engine", () => {
      startWorkflowEngine();
      return () => stopWorkflowEngine();
    });
  },
  stop: () => { stopLeader?.(); stopLeader = null; },
  health: async () => ({ ok: true }),
};

export * from "./lib";
