$ErrorActionPreference = "Stop"
$credentialPath = $env:DEEPSEEK_CREDENTIAL_FILE
if (-not [string]::IsNullOrWhiteSpace($credentialPath) -and (Test-Path -LiteralPath $credentialPath)) {
  $item = Get-Item -LiteralPath $credentialPath -Force
  if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
    throw "DeepSeek credential file cannot be a link."
  }
  $credential = Import-Clixml -LiteralPath $credentialPath
  $apiKey = $credential.GetNetworkCredential().Password
  if ([string]::IsNullOrWhiteSpace($apiKey)) { throw "DeepSeek credential is empty." }
  $env:DEEPSEEK_API_KEY = $apiKey
  $apiKey = $null
  $credential = $null
}
$node = "D:\AI\node.exe"
$server = "C:\Users\Lenovo\PycharmProjects\ai_knowledge_map\tools\deepdive-stage2\mcp-server.js"
& $node $server
exit $LASTEXITCODE
