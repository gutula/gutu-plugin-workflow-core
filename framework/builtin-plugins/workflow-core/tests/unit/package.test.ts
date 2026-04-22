import { describe, expect, it } from "bun:test";
import { executeAction } from "@platform/schema";
import manifest from "../../package";
import { transitionWorkflowInstanceAction } from "../../src/actions/default.action";
import { transitionWorkflowInstance } from "../../src/services/main.service";
import { workflowDefinitionKeys } from "../../src/workflows/catalog";

describe("plugin manifest", () => {
  it("keeps a stable package id and primary capability", () => {
    expect(manifest.id).toBe("workflow-core");
    expect(manifest.providesCapabilities).toContain("workflow.instances");
  });

  it("publishes explicit workflow definitions", () => {
    expect(workflowDefinitionKeys).toEqual([
      "access-review",
      "content-publication",
      "invoice-approval",
      "ai-run-lifecycle",
      "ai-run-approval",
      "company-work-intake"
    ]);
  });

  it("transitions approval workflows with audited side effects", () => {
    expect(
      transitionWorkflowInstance({
        instanceId: "7c9fb1b9-c9ff-4f4d-b255-9baf6850f7c2",
        tenantId: "7a85aa4d-96e0-4b9a-b4db-6d11ebce2786",
        definitionKey: "invoice-approval",
        currentState: "draft",
        transition: "submit",
        actorRole: "requester",
        reason: "submit for review"
      })
    ).toEqual({
      ok: true,
      nextState: "pending_approval",
      approvalStatus: "pending",
      auditEventType: "workflow.instance.submit",
      sideEffects: ["notify-approver"]
    });
  });

  it("rejects approval-only transitions from requester actors", async () => {
    let errorMessage = "";
    try {
      await executeAction(transitionWorkflowInstanceAction, {
        instanceId: "7c9fb1b9-c9ff-4f4d-b255-9baf6850f7c2",
        tenantId: "7a85aa4d-96e0-4b9a-b4db-6d11ebce2786",
        definitionKey: "invoice-approval",
        currentState: "pending_approval",
        transition: "approve",
        actorRole: "requester",
        reason: "approve without authority"
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }

    expect(errorMessage).toContain("cannot execute transition");
  });

  it("supports governed AI approval workflows with reminder side effects", () => {
    expect(
      transitionWorkflowInstance({
        instanceId: "7c9fb1b9-c9ff-4f4d-b255-9baf6850f7c2",
        tenantId: "7a85aa4d-96e0-4b9a-b4db-6d11ebce2786",
        definitionKey: "ai-run-approval",
        currentState: "intake",
        transition: "request_approval",
        actorRole: "system",
        reason: "approval packet assembled"
      })
    ).toEqual({
      ok: true,
      nextState: "approval_pending",
      approvalStatus: "pending",
      auditEventType: "workflow.instance.request_approval",
      sideEffects: ["notify-approver", "queue-reminder"]
    });
  });

  it("routes company work rejections into recovery side effects", () => {
    expect(
      transitionWorkflowInstance({
        instanceId: "company-workflow:recovery-test",
        tenantId: "7a85aa4d-96e0-4b9a-b4db-6d11ebce2786",
        definitionKey: "company-work-intake",
        currentState: "in_progress",
        transition: "reject",
        actorRole: "ai-operator",
        reason: "knowledge freshness degraded"
      })
    ).toEqual({
      ok: true,
      nextState: "recovery",
      approvalStatus: "not-required",
      auditEventType: "workflow.instance.reject",
      sideEffects: ["queue-recovery"]
    });
  });
});
