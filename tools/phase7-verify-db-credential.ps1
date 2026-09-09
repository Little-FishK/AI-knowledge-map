$ErrorActionPreference = 'Stop'
$credentialFile = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'ai-knowledge-map\backup-private\supabase-db.credential.xml'
if (-not (Test-Path -LiteralPath $credentialFile)) { throw 'Encrypted credential is not saved yet.' }
$credential = Import-Clixml -LiteralPath $credentialFile
if ($credential.UserName -cne 'postgres.jjmihlewnbkfwpfgtfqi') { throw 'Unexpected credential user.' }

# Deliver the secret over stdin, never as a process argument or tool output.
$start = [System.Diagnostics.ProcessStartInfo]::new()
$start.FileName = 'docker.exe'
$start.UseShellExecute = $false
$start.CreateNoWindow = $true
$start.RedirectStandardInput = $true
$start.RedirectStandardOutput = $true
$start.RedirectStandardError = $true
$query = "BEGIN READ ONLY; SELECT json_build_object('connected',true,'database',current_database(),'serverVersion',current_setting('server_version'),'readOnly',current_setting('transaction_read_only')); COMMIT;"
# SQL contains single quotes, so pass it via a non-secret environment variable.
$command = 'IFS= read -r encoded; PGPASSWORD="$(printf ''%s'' "$encoded" | base64 -d)"; export PGPASSWORD; unset encoded; exec psql -X -w -v ON_ERROR_STOP=1 -At -c "$AKM_VERIFY_QUERY"'
$rootCertificate=(Resolve-Path (Join-Path $PSScriptRoot 'certs/supabase-prod-ca-2021.crt')).Path
$arguments = @('run','--rm','-i','--mount',('type=bind,source=' + $rootCertificate + ',target=/tmp/supabase-ca.crt,readonly'),'--env','PGHOST=aws-0-us-east-1.pooler.supabase.com','-e','PGPORT=5432','-e','PGDATABASE=postgres','-e','PGUSER=postgres.jjmihlewnbkfwpfgtfqi','-e','PGCONNECT_TIMEOUT=15','-e','PGSSLMODE=verify-full','-e','PGSSLROOTCERT=/tmp/supabase-ca.crt','-e',('AKM_VERIFY_QUERY=' + $query),'postgres:17.6','sh','-c',$command)
foreach ($argument in $arguments) { $start.ArgumentList.Add($argument) }
$process = [System.Diagnostics.Process]::new()
$process.StartInfo = $start
try {
    [void]$process.Start()
    $output = $process.StandardOutput.ReadToEndAsync()
    $errors = $process.StandardError.ReadToEndAsync()
    $passwordBytes = [System.Text.Encoding]::UTF8.GetBytes($credential.GetNetworkCredential().Password)
    try { $process.StandardInput.WriteLine([Convert]::ToBase64String($passwordBytes)) }
    finally { [Array]::Clear($passwordBytes, 0, $passwordBytes.Length); $process.StandardInput.Close() }
    $process.WaitForExit()
    $stdout = $output.GetAwaiter().GetResult()
    $stderr = $errors.GetAwaiter().GetResult()
    if ($process.ExitCode -eq 0) {
        $record = ($stdout -split "`n" | Where-Object { $_.TrimStart().StartsWith('{') } | Select-Object -First 1) | ConvertFrom-Json
        if (-not $record.connected -or $record.readOnly -ne 'on') { throw 'Unexpected read-only verification result.' }
        $record | ConvertTo-Json -Compress
    } elseif ($stderr -match 'password authentication failed') {
        Write-Output '{"connected":false,"reason":"password_authentication_failed"}'
    } elseif ($stderr -match 'certificate|SSL error|TLS') {
        Write-Output '{"connected":false,"reason":"tls_verification_failed","passwordVerdict":"unknown"}'
    } elseif ($stderr -match 'timeout|timed out|could not translate host|Network is unreachable|Connection refused') {
        Write-Output '{"connected":false,"reason":"network_connection_failed","passwordVerdict":"unknown"}'
    } else {
        Write-Output '{"connected":false,"reason":"connection_or_client_failed","passwordVerdict":"unknown"}'
    }
} finally { $credential.Password.Dispose(); $process.Dispose() }
