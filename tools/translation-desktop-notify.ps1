param([string]$Message)
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$notice = New-Object System.Windows.Forms.NotifyIcon
try {
 $notice.Icon = [System.Drawing.SystemIcons]::Information
 $notice.Visible = $true
 $notice.BalloonTipTitle = 'AI Knowledge Map Translation'
 $notice.BalloonTipText = $Message.Substring(0, [Math]::Min(250, $Message.Length))
 $notice.ShowBalloonTip(10000)
 Start-Sleep -Seconds 12
} finally { $notice.Dispose() }
