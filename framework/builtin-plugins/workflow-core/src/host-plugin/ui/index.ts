/** Workflow-core admin UI: list + detail + nav + commands. */
import { defineAdminUi } from "@gutu-host/plugin-ui-contract";
import { WorkflowsPage } from "./pages/WorkflowsPage";
import { WorkflowDetailPage } from "./pages/WorkflowDetailPage";

export const adminUi = defineAdminUi({
  id: "workflow-core",
  pages: [
    {
      id: "workflow-core.workflows",
      path: "/settings/workflows",
      title: "Workflows",
      description: "Visual automations — triggers + graphs of actions.",
      Component: WorkflowsPage,
      icon: "Workflow",
    },
    {
      id: "workflow-core.workflow-detail",
      path: "/admin/workflow",
      title: "Workflow",
      description: "Workflow detail: builder, runs, settings.",
      Component: WorkflowDetailPage,
      icon: "Workflow",
    },
  ],
  navEntries: [
    {
      id: "workflow-core.nav.workflows",
      label: "Workflows",
      icon: "Workflow",
      path: "/settings/workflows",
      section: "settings",
      order: 6,
    },
  ],
  commands: [
    {
      id: "workflow-core.cmd.workflows",
      label: "Open Workflows",
      icon: "Workflow",
      keywords: ["workflow", "automation", "trigger", "schedule"],
      run: () => { window.location.hash = "/settings/workflows"; },
    },
  ],
});

export { WorkflowsPage } from "./pages/WorkflowsPage";
export { WorkflowDetailPage } from "./pages/WorkflowDetailPage";
