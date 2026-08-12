$ErrorActionPreference = 'Stop'

$rawInput = [Console]::In.ReadToEnd()
$hookInput = $rawInput | ConvertFrom-Json
$toolName = [string]$hookInput.tool_name

$agentTools = @(
  'Agent',
  'spawn_agent',
  'wait_agent',
  'send_input',
  'resume_agent',
  'close_agent'
)
$stage2Tools = @(
  'stage2_status',
  'stage2_next_recommended_page',
  'stage2_inspect_publication_candidate',
  'stage2_publish_provisional_page',
  'stage2_claim_task',
  'stage2_read_task_packet',
  'stage2_search_project',
  'stage2_read_project_file',
  'stage2_validate_audit_result',
  'stage2_validate_page_result',
  'stage2_submit_result'
)

$allowed = $agentTools -contains $toolName
if (-not $allowed) {
  foreach ($stage2Tool in $stage2Tools) {
    if ($toolName -eq $stage2Tool -or $toolName.EndsWith("__$stage2Tool")) {
      $allowed = $true
      break
    }
  }
}

if (-not $allowed) {
  @{
    hookSpecificOutput = @{
      hookEventName = 'PreToolUse'
      permissionDecision = 'deny'
      permissionDecisionReason = "Stage 2 restricted Codex profile blocks tool: $toolName"
    }
  } | ConvertTo-Json -Depth 5 -Compress
}
