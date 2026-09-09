param([switch]$SelfTest)
$ErrorActionPreference = 'Stop'

# The password is accepted only by a masked native dialog. Never pass it as a
# command-line argument, write it to stdout, or store it in the project.
if ($SelfTest) {
    $probe = Join-Path ([System.IO.Path]::GetTempPath()) ('akm-dpapi-test-' + [guid]::NewGuid().ToString() + '.xml')
    try {
        $secure = ConvertTo-SecureString 'synthetic-test-only' -AsPlainText -Force
        $credential = [pscredential]::new('test', $secure)
        $credential | Export-Clixml -LiteralPath $probe
        $restored = Import-Clixml -LiteralPath $probe
        if ($restored.GetNetworkCredential().Password -cne 'synthetic-test-only') { throw 'DPAPI roundtrip failed' }
        if ([System.IO.File]::ReadAllText($probe).Contains('synthetic-test-only')) { throw 'Plaintext in encrypted output' }
        Write-Output 'PASS: Windows user-bound credential encryption roundtrip; no plaintext in output file'
    } finally { if (Test-Path -LiteralPath $probe) { Remove-Item -LiteralPath $probe -Force } }
    exit
}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$form = [System.Windows.Forms.Form]::new()
$form.Text = 'AI Knowledge Map - Local database credential'
$form.ClientSize = [System.Drawing.Size]::new(570, 275)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$label = [System.Windows.Forms.Label]::new()
$label.Text = "Supabase database password (not your login code)`r`nProject: jjmihlewnbkfwpfgtfqi`r`nSaved encrypted for this Windows user only, outside Git.`r`nNo database changes or password transmission in this step."
$label.Location = [System.Drawing.Point]::new(20, 18)
$label.Size = [System.Drawing.Size]::new(530, 92)
$inputBox = [System.Windows.Forms.TextBox]::new()
$inputBox.UseSystemPasswordChar = $true
$inputBox.Location = [System.Drawing.Point]::new(20, 120)
$inputBox.Size = [System.Drawing.Size]::new(530, 28)
$inputBox.MaxLength = 1024
$status = [System.Windows.Forms.Label]::new()
$status.Location = [System.Drawing.Point]::new(20, 158)
$status.Size = [System.Drawing.Size]::new(530, 40)
$save = [System.Windows.Forms.Button]::new()
$save.Text = 'Save encrypted'
$save.Location = [System.Drawing.Point]::new(315, 215)
$save.Size = [System.Drawing.Size]::new(145, 35)
$cancel = [System.Windows.Forms.Button]::new()
$cancel.Text = 'Cancel'
$cancel.Location = [System.Drawing.Point]::new(470, 215)
$cancel.Size = [System.Drawing.Size]::new(80, 35)
$cancel.Add_Click({ $inputBox.Clear(); $form.Close() })
$save.Add_Click({
    if ([string]::IsNullOrEmpty($inputBox.Text)) { $status.Text = 'Please enter the database password.'; return }
    try {
        $privateDir = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'ai-knowledge-map\backup-private'
        [System.IO.Directory]::CreateDirectory($privateDir) | Out-Null
        $acl = [System.Security.AccessControl.DirectorySecurity]::new()
        $acl.SetAccessRuleProtection($true, $false)
        $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
        $acl.AddAccessRule([System.Security.AccessControl.FileSystemAccessRule]::new($identity, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow'))
        Set-Acl -LiteralPath $privateDir -AclObject $acl
        $destination = Join-Path $privateDir 'supabase-db.credential.xml'
        $secure = ConvertTo-SecureString $inputBox.Text -AsPlainText -Force
        $credential = [pscredential]::new('postgres.jjmihlewnbkfwpfgtfqi', $secure)
        $credential | Export-Clixml -LiteralPath $destination
        $secure.Dispose()
        $inputBox.Clear()
        [System.Windows.Forms.MessageBox]::Show('Saved encrypted on this computer. Return to Codex and say: Saved.', 'AI Knowledge Map') | Out-Null
        $form.Close()
    } catch {
        $inputBox.Clear()
        $status.Text = 'Could not save the credential. No password details were logged.'
    }
})
$form.Controls.AddRange(@($label, $inputBox, $status, $save, $cancel))
$form.AcceptButton = $save
$form.CancelButton = $cancel
$form.Add_Shown({ $inputBox.Focus() })
try { [void]$form.ShowDialog() } finally { $inputBox.Clear(); $form.Dispose() }
