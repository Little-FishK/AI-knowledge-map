# Translation manual handoff and capacity

The campaign runner waits up to 1,200,000 ms (20 minutes) per MCP operation. Individual provider request timeouts remain unchanged. A timeout still stops the controller and requires inspection, not automatic resubmission.

A no-op repair raises `NO_OP_REPAIR` and the campaign immediately parks the page as `held / manual-repair-required`, retaining response, usage and error history. It does not count this as a retryable report-schema failure. Legacy held `No-op repair` records are also parked on the next authorized step. The existing quality controller's repair limits remain enforced: two unsuccessful repairs in the legacy path require manual review; stricter round-review limits and dispute gates are not relaxed.

Parked pages are excluded from automatic eligible/ready selection. A worker advances to the next eligible page in the already authorized campaign. The status separately reports `automaticPendingPages`, `manualPendingPages` and `heldPages`; these are counts of work states, not simultaneous network requests. The runner emits `page-needs-human` once per page per run. Published pages continue through the independent serial deployment queue.

The frozen campaign scope and budget do not expand automatically. If an authorized five-page campaign parks one page, the other four can finish; no unapproved sixth page is silently added. A larger authorized backlog can continue filling available workers. Manual pages remain tracked rather than being deleted or treated as successful publication. A runner ending with any held page exits with code 2 even if the controller's legacy terminal state is `completed`.

Only explicit operator recovery may return a manual page to processing. Existing recovery authorization, source/version checks and independent verification remain required. Historical costs are retained and still count toward budget; freeing a scheduling slot never refunds consumed tokens.

Tests: an eight-page mock campaign with concurrency two parks one no-op page after one repair, publishes the other seven, and sends no further request when stepped again. Quality tests cover two unsuccessful repairs and stricter round review. No live translation or website deployment was performed for these changes.
