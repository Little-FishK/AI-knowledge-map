# Five-page translation concurrency

Set `STAGE2_CAMPAIGN_CONCURRENCY=5` on the existing MCP campaign launcher. The configured limit is persisted in campaign metadata, shown by inspect, and is restricted to 1–5. Existing campaigns default to 1 until configured; 1 preserves the previous one-page-per-step behavior. Parallel mode advances each eligible page by one phase per controller step, with a worker pool of at most five. Each page is assigned once per step; its next chapter/review batch waits for the next step. This is bounded round-based concurrency, not multiple simultaneous requests for one page.

A single controller retains the campaign operation lock across the step. It owns the shared job object and ledger; multiple launcher processes must not write the same campaign. Budget preflight, reservation and synchronous atomic persistence happen without an intervening await before dispatch. In-flight calls are charged their reservations until their actual usage is accepted. Translation admission happens before creating a page-level sending record, so a budget refusal is not mistaken for an uncertain paid call.

Provider requests run concurrently; publication operations are queued serially within the controller. A malformed review holds only that page. An uncertain response or exhausted budget stops dispatching new work while already-dispatched calls settle and persist their responses/costs. Their success cannot overwrite the stop state. An unexpected worker failure waits for all other workers to settle before surfacing operator intervention.

## Safe upgrade from a running legacy launcher

`handover <campaignId>` uses a full-profile MCP tool with exact `STAGE2_CAMPAIGN_HANDOVER=<campaignId>` authorization. It waits up to ten seconds per invocation to acquire campaign ownership. It never removes an existing lock or interrupts an API request. Once acquired, it refuses pending/uncertain requests, sets concurrency to five, and holds the lock for three seconds so the legacy launcher fails its next step and exits between requests. Verify the old process exited before starting the new runner. A busy return permits another wait; an uncertain/inconsistent state does not.

Resume the same campaign with the same credentials and cumulative spending limit. Do not create another campaign, reset history, restart completed translations, or launch five independent processes. This change does not remove the existing total budget, source/quality/browser gates or deployment separation.

## Tests and rollback

`tests/stage2/translation-campaign.test.js` runs eight synthetic pages with delayed responses: peak network concurrency is five, peak publication concurrency is one, all 40 expected calls are recorded. Separate tests exhaust a shared budget while requests are active, inject an uncertain response while four others settle, reject a second owner, and verify handover requires explicit authorization and makes no provider calls. Existing serial, v2-batch, recovery and budget tests remain enabled.

Pre-edit campaign, launcher, DeepSeek adapter and campaign test copies are under `.tmp/parallel-five-backup-20260913/`. The MCP server adds only the full-profile handover tool and dispatch branch; remove those additions if reverting code. Never restore historical billing/production state as part of a code rollback.
