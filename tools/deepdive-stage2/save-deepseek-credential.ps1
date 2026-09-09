param(
  [Parameter(Mandatory = $true)]
  [string]$CredentialPath
)
$ErrorActionPreference = "Stop"
$directory = Split-Path -Parent $CredentialPath
if (-not (Test-Path -LiteralPath $directory)) {
  New-Item -ItemType Directory -Path $directory | Out-Null
}
$directoryItem = Get-Item -LiteralPath $directory -Force
if (($directoryItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
  throw "Credential directory cannot be a link or junction."
}
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$form = New-Object System.Windows.Forms.Form
$form.Text = "DeepSeek API Key"
$form.Width = 520
$form.Height = 185
$form.StartPosition = "CenterScreen"
$form.TopMost = $true
$label = New-Object System.Windows.Forms.Label
$label.Text = "Paste the DeepSeek API Key. It will be encrypted with Windows DPAPI."
$label.AutoSize = $true
$label.Left = 18
$label.Top = 18
$box = New-Object System.Windows.Forms.TextBox
$box.Left = 18
$box.Top = 48
$box.Width = 465
$box.UseSystemPasswordChar = $true
$ok = New-Object System.Windows.Forms.Button
$ok.Text = "Save"
$ok.Left = 318
$ok.Top = 86
$ok.DialogResult = [System.Windows.Forms.DialogResult]::OK
$cancel = New-Object System.Windows.Forms.Button
$cancel.Text = "Cancel"
$cancel.Left = 408
$cancel.Top = 86
$cancel.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
$form.Controls.AddRange(@($label, $box, $ok, $cancel))
$form.AcceptButton = $ok
$form.CancelButton = $cancel
$form.Add_Shown({ $box.Focus() })
$dialog = $form.ShowDialog()
if ($dialog -ne [System.Windows.Forms.DialogResult]::OK -or [string]::IsNullOrWhiteSpace($box.Text)) {
  throw "No API Key was supplied."
}
$secure = New-Object System.Security.SecureString
foreach ($character in $box.Text.ToCharArray()) { $secure.AppendChar($character) }
$secure.MakeReadOnly()
$credential = New-Object System.Management.Automation.PSCredential("deepseek-api", $secure)
$box.Text = ""
$temporary = "$CredentialPath.$([Guid]::NewGuid().ToString('N')).tmp"
try {
  $credential | Export-Clixml -LiteralPath $temporary -Force
  Move-Item -LiteralPath $temporary -Destination $CredentialPath -Force
} finally {
  if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force }
}
Write-Output "DeepSeek credential saved with Windows DPAPI."
