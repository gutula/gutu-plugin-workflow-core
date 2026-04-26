/** workflow-core schema. Owned by the plugin so it travels with the plugin —
 *  drop the plugin and the tables go with it. CREATE TABLE IF NOT EXISTS
 *  + CREATE INDEX IF NOT EXISTS so it's safe to re-run on every boot. */
import { db } from "@gutu-host";

export function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
      id           TEXT PRIMARY KEY,
      tenant_id    TEXT NOT NULL,
      name         TEXT NOT NULL,
      description  TEXT,
      status       TEXT NOT NULL DEFAULT "draft",
      definition   TEXT NOT NULL,
      version      INTEGER NOT NULL DEFAULT 1,
      created_by   TEXT NOT NULL,
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS workflows_tenant_status_idx
      ON workflows(tenant_id, status);

    CREATE TABLE IF NOT EXISTS workflow_runs (
      id              TEXT PRIMARY KEY,
      workflow_id     TEXT NOT NULL,
      tenant_id       TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT "pending",
      trigger_payload TEXT,
      output          TEXT,
      error           TEXT,
      started_at      TEXT NOT NULL,
      finished_at     TEXT,
      duration_ms     INTEGER,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS workflow_runs_workflow_idx
      ON workflow_runs(workflow_id, started_at DESC);
    CREATE INDEX IF NOT EXISTS workflow_runs_tenant_idx
      ON workflow_runs(tenant_id, started_at DESC);
`);
}
