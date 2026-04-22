import { defineWorkflow } from "@platform/jobs";

export const workflowDefinitionKeys = [
  "access-review",
  "content-publication",
  "invoice-approval",
  "ai-run-lifecycle",
  "ai-run-approval",
  "company-work-intake"
] as const;

export const workflowDefinitions = {
  "access-review": defineWorkflow({
    id: "access-review",
    description: "Review and grant sensitive access only after security review.",
    businessPurpose: "Protect privileged access changes with explicit security approval and revocation paths.",
    actors: ["requester", "security-reviewer", "admin"],
    invariants: [
      "Access cannot be granted without a security review.",
      "Granted access must remain revocable."
    ],
    mandatorySteps: [
      "Every access request starts in draft and must be submitted for review before approval.",
      "Revocation must remain available after a grant."
    ],
    stateDescriptions: {
      draft: {
        description: "The access request is being prepared by the requester."
      },
      security_review: {
        description: "Security is evaluating the request and its risk posture."
      },
      granted: {
        description: "Access has been granted and is actively in force."
      },
      rejected: {
        description: "The request was denied and may be reopened for correction."
      },
      revoked: {
        description: "Previously granted access has been removed."
      }
    },
    transitionDescriptions: {
      "draft.submit": "Sends the request into security review.",
      "security_review.approve": "Grants the access after review.",
      "security_review.reject": "Rejects the request and closes the review cycle.",
      "granted.revoke": "Removes access after it has been granted.",
      "rejected.reopen": "Returns the request to draft for correction and resubmission."
    },
    initialState: "draft",
    states: {
      draft: { on: { submit: "security_review" } },
      security_review: { on: { approve: "granted", reject: "rejected" } },
      granted: { on: { revoke: "revoked" } },
      rejected: { on: { reopen: "draft" } },
      revoked: {}
    }
  }),
  "content-publication": defineWorkflow({
    id: "content-publication",
    description: "Editorial review and publication workflow for governed content.",
    businessPurpose: "Prevent content from reaching publication without editorial review and scheduled release control.",
    actors: ["author", "editor", "publisher"],
    invariants: [
      "Published content must pass through editor review.",
      "Archived content cannot be republished without reopening."
    ],
    mandatorySteps: [
      "Draft content must be submitted for editor review.",
      "Scheduled content must pass through publish before becoming live."
    ],
    stateDescriptions: {
      draft: {
        description: "Content is being prepared by the author."
      },
      editor_review: {
        description: "Editors are checking readiness, accuracy, and compliance."
      },
      scheduled: {
        description: "Content is approved and waiting for publication."
      },
      published: {
        description: "Content is live and visible to the intended audience."
      },
      rejected: {
        description: "Editorial review failed and the content must be revised."
      },
      archived: {
        description: "Content is no longer active but remains in history."
      }
    },
    transitionDescriptions: {
      "draft.submit": "Moves the draft into editorial review.",
      "editor_review.approve": "Approves content for scheduling.",
      "editor_review.reject": "Rejects content for revision.",
      "scheduled.publish": "Publishes approved content.",
      "published.archive": "Archives live content.",
      "rejected.reopen": "Returns rejected content to draft."
    },
    initialState: "draft",
    states: {
      draft: { on: { submit: "editor_review" } },
      editor_review: { on: { approve: "scheduled", reject: "rejected" } },
      scheduled: { on: { publish: "published" } },
      published: { on: { archive: "archived" } },
      rejected: { on: { reopen: "draft" } },
      archived: {}
    }
  }),
  "invoice-approval": defineWorkflow({
    id: "invoice-approval",
    description: "Finance approval flow for invoices before they are finalized.",
    businessPurpose: "Ensure invoices are reviewed before final approval and archival.",
    actors: ["requester", "approver", "finance-admin"],
    invariants: [
      "Invoices cannot move to approved without a pending approval state.",
      "Rejected invoices must reopen before resubmission."
    ],
    mandatorySteps: [
      "Invoice drafts must be submitted before approvers can act.",
      "Only approved invoices may be archived."
    ],
    stateDescriptions: {
      draft: {
        description: "Invoice is being prepared and has not yet entered approval."
      },
      pending_approval: {
        description: "Invoice is waiting for finance approval."
      },
      approved: {
        description: "Invoice has been approved and is ready for finalization."
      },
      rejected: {
        description: "Invoice was rejected and must be corrected."
      },
      archived: {
        description: "Invoice has been finalized and archived."
      }
    },
    transitionDescriptions: {
      "draft.submit": "Queues the invoice for approval.",
      "pending_approval.approve": "Approves the invoice for finalization.",
      "pending_approval.reject": "Rejects the invoice for correction.",
      "approved.archive": "Archives the approved invoice.",
      "rejected.reopen": "Returns the invoice to draft."
    },
    initialState: "draft",
    states: {
      draft: { on: { submit: "pending_approval" } },
      pending_approval: { on: { approve: "approved", reject: "rejected" } },
      approved: { on: { archive: "archived" } },
      rejected: { on: { reopen: "draft" } },
      archived: {}
    }
  }),
  "ai-run-lifecycle": defineWorkflow({
    id: "ai-run-lifecycle",
    description: "Governed lifecycle for AI-operated work from intake through verification and recovery.",
    businessPurpose: "Keep AI work typed, resumable, auditable, and safely recoverable across approval and verification steps.",
    actors: ["system", "ai-operator", "approver"],
    invariants: [
      "Every AI run must start with intake before planning or execution begins.",
      "Completion requires verification unless the run is explicitly cancelled or escalated."
    ],
    mandatorySteps: [
      "Intake must be classified before bounded planning starts.",
      "Verification or recovery must happen before a run can be marked completed."
    ],
    stateDescriptions: {
      intake: { description: "The work item has been accepted and normalized." },
      classified: { description: "The work item has risk, SLA, and operating-model classification." },
      planned: { description: "A bounded execution plan has been prepared." },
      executing: { description: "Deterministic or agent work is in progress." },
      approval_pending: { description: "Execution is paused while waiting for human approval." },
      verifying: { description: "Outputs, policies, and replay evidence are being verified." },
      completed: { description: "The run completed successfully with durable evidence." },
      recovery: { description: "A failure or rejection triggered compensating or retry work." },
      escalated: { description: "The run exceeded policy or SLA thresholds and was escalated." },
      cancelled: { description: "The run was explicitly cancelled and can no longer progress." },
      failed: { description: "The run exhausted retries or hit an unrecoverable failure." }
    },
    transitionDescriptions: {
      "intake.classify": "Assigns operating-model class, risk, and SLA.",
      "classified.plan": "Creates a bounded execution plan.",
      "planned.execute": "Starts deterministic or agent execution.",
      "executing.request_approval": "Pauses for a human approval checkpoint.",
      "approval_pending.resume": "Resumes work after approval.",
      "executing.verify": "Moves completed execution into verification.",
      "verifying.complete": "Marks the run complete with evidence.",
      "approval_pending.reject": "Rejects the approval path and sends the run to recovery.",
      "recovery.retry": "Retries work after compensation or correction.",
      "recovery.escalate": "Escalates a stuck or unsafe recovery path.",
      "executing.fail": "Marks execution as failed after unrecoverable issues.",
      "approval_pending.cancel": "Cancels a paused run.",
      "executing.cancel": "Cancels an active run.",
      "recovery.cancel": "Cancels a recovering run."
    },
    initialState: "intake",
    states: {
      intake: { on: { classify: "classified" } },
      classified: { on: { plan: "planned" } },
      planned: { on: { execute: "executing" } },
      executing: {
        on: {
          request_approval: "approval_pending",
          verify: "verifying",
          fail: "failed",
          cancel: "cancelled"
        }
      },
      approval_pending: { on: { resume: "executing", reject: "recovery", cancel: "cancelled" } },
      verifying: { on: { complete: "completed", reject: "recovery" } },
      recovery: { on: { retry: "planned", escalate: "escalated", cancel: "cancelled" } },
      completed: {},
      escalated: {},
      cancelled: {},
      failed: {}
    }
  }),
  "ai-run-approval": defineWorkflow({
    id: "ai-run-approval",
    description: "Approval-specific workflow for sensitive AI steps that need human review before execution.",
    businessPurpose: "Track approval wait, approval decisions, and escalation for sensitive AI mutations.",
    actors: ["system", "approver", "ai-operator"],
    invariants: [
      "Approval-driven AI work must enter approval_pending before an approver can decide.",
      "Rejected or expired approvals cannot move directly to approved."
    ],
    mandatorySteps: [
      "Each approval packet must be requested explicitly by the system.",
      "Expired approvals must either escalate or recover before any retry."
    ],
    stateDescriptions: {
      intake: { description: "Approval context is being assembled." },
      approval_pending: { description: "The request is waiting for human review." },
      approved: { description: "The human checkpoint approved the requested step." },
      rejected: { description: "The human checkpoint rejected the requested step." },
      expired: { description: "The approval window elapsed without a decision." },
      escalated: { description: "The approval timeout or pressure triggered escalation." }
    },
    transitionDescriptions: {
      "intake.request_approval": "Creates a pending approval checkpoint.",
      "approval_pending.approve": "Approves the gated step.",
      "approval_pending.reject": "Rejects the gated step.",
      "approval_pending.expire": "Marks the approval as expired after SLA breach.",
      "expired.escalate": "Escalates the expired approval queue.",
      "rejected.escalate": "Escalates a rejected packet for operator follow-up."
    },
    initialState: "intake",
    states: {
      intake: { on: { request_approval: "approval_pending" } },
      approval_pending: { on: { approve: "approved", reject: "rejected", expire: "expired" } },
      approved: {},
      rejected: { on: { escalate: "escalated" } },
      expired: { on: { escalate: "escalated" } },
      escalated: {}
    }
  }),
  "company-work-intake": defineWorkflow({
    id: "company-work-intake",
    description: "Typed intake workflow for Company Builder departments and governed work queues.",
    businessPurpose: "Route incoming company work through classification, execution, recovery, and department ownership.",
    actors: ["requester", "department-lead", "ai-operator", "approver"],
    invariants: [
      "Work must be classified before it can be routed into a department queue.",
      "Rejected or failed work must enter recovery or be cancelled explicitly."
    ],
    mandatorySteps: [
      "Each intake must capture a department destination and operating-model context.",
      "Approval-required work must enter approval_pending before completion."
    ],
    stateDescriptions: {
      intake: { description: "A new work item has been submitted." },
      classified: { description: "The intake has been normalized, scored, and assigned." },
      queued: { description: "The work is in a department queue awaiting execution." },
      in_progress: { description: "Department or AI execution is in progress." },
      approval_pending: { description: "A department-level approval is required." },
      verifying: { description: "Work quality and policy checks are being verified." },
      recovery: { description: "The work requires compensation, retry, or operator intervention." },
      completed: { description: "The work finished successfully." },
      escalated: { description: "The work breached SLA or policy and was escalated." },
      cancelled: { description: "The intake was cancelled." }
    },
    transitionDescriptions: {
      "intake.classify": "Scores and classifies the intake.",
      "classified.queue": "Places the work into the department queue.",
      "queued.start": "Starts execution.",
      "in_progress.request_approval": "Pauses for approval.",
      "in_progress.reject": "Routes unsafe or stale work into recovery.",
      "approval_pending.approve": "Approves the work to continue.",
      "approval_pending.reject": "Rejects the work into recovery.",
      "in_progress.verify": "Moves work into verification.",
      "verifying.complete": "Completes the work.",
      "recovery.retry": "Retries after recovery.",
      "recovery.escalate": "Escalates after repeated failure.",
      "queued.cancel": "Cancels a queued intake.",
      "in_progress.cancel": "Cancels work in progress."
    },
    initialState: "intake",
    states: {
      intake: { on: { classify: "classified" } },
      classified: { on: { queue: "queued" } },
      queued: { on: { start: "in_progress", cancel: "cancelled" } },
      in_progress: { on: { request_approval: "approval_pending", reject: "recovery", verify: "verifying", cancel: "cancelled" } },
      approval_pending: { on: { approve: "in_progress", reject: "recovery" } },
      verifying: { on: { complete: "completed", reject: "recovery" } },
      recovery: { on: { retry: "queued", escalate: "escalated", cancel: "cancelled" } },
      completed: {},
      escalated: {},
      cancelled: {}
    }
  })
} as const;

export type WorkflowDefinitionKey = (typeof workflowDefinitionKeys)[number];
