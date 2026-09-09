param([ValidateSet('Inventory','Backup','Restore')][string]$Mode='Inventory', [string]$BackupDirectory)
$ErrorActionPreference='Stop'
$privateRoot=Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'ai-knowledge-map\backup-private'
$cert=(Resolve-Path (Join-Path $PSScriptRoot 'certs/supabase-prod-ca-2021.crt')).Path
$utf8=[System.Text.UTF8Encoding]::new($false)

function Invoke-DockerBytes([string[]]$DockerArguments,[byte[]]$InputBytes=@()) {
    $info=[System.Diagnostics.ProcessStartInfo]::new();$info.FileName='docker.exe';$info.UseShellExecute=$false;$info.CreateNoWindow=$true
    $info.RedirectStandardInput=$true;$info.RedirectStandardOutput=$true;$info.RedirectStandardError=$true
    foreach($item in $DockerArguments){$info.ArgumentList.Add($item)}
    $process=[System.Diagnostics.Process]::new();$process.StartInfo=$info;$buffer=[System.IO.MemoryStream]::new()
    try {
        [void]$process.Start();$copy=$process.StandardOutput.BaseStream.CopyToAsync($buffer);$errorTask=$process.StandardError.ReadToEndAsync()
        $process.StandardInput.BaseStream.Write($InputBytes,0,$InputBytes.Length);$process.StandardInput.Close()
        $process.WaitForExit();[void]$copy.GetAwaiter().GetResult();$errorText=$errorTask.GetAwaiter().GetResult()
        if($process.ExitCode -ne 0){
            # Do not print SQL statements, data rows, connection secrets or stderr.
            $kind=if($errorText -match 'password authentication failed'){'authentication'}elseif($errorText -match 'permission denied'){'permission'}elseif($errorText -match 'does not exist'){'missing_dependency'}else{'client_or_connection'}
            if($errorText -match 'ERROR:\s+((?:schema|type|function|extension|role|relation) [^\r\n]+does not exist)'){throw ('Restore dependency missing: '+$Matches[1])}
            throw "Database operation failed: $kind (exit $($process.ExitCode))."
        }
        return ,$buffer.ToArray()
    } finally {$buffer.Dispose();$process.Dispose()}
}
function Invoke-Source([string]$Command) {
    $credential=Import-Clixml -LiteralPath (Join-Path $privateRoot 'supabase-db.credential.xml')
    if($credential.UserName -cne 'postgres.jjmihlewnbkfwpfgtfqi'){throw 'Unexpected credential owner'}
    $passwordBytes=$utf8.GetBytes($credential.GetNetworkCredential().Password)
    $stdinBytes=$utf8.GetBytes([Convert]::ToBase64String($passwordBytes)+"`n")
    try {
        $args=@('run','--rm','-i','--mount',"type=bind,source=$cert,target=/tmp/ca.crt,readonly",'-e','PGHOST=aws-0-us-east-1.pooler.supabase.com','-e','PGPORT=5432','-e','PGDATABASE=postgres','-e','PGUSER=postgres.jjmihlewnbkfwpfgtfqi','-e','PGSSLMODE=verify-full','-e','PGSSLROOTCERT=/tmp/ca.crt','-e','PGCONNECT_TIMEOUT=15','-e','PGOPTIONS=-c default_transaction_read_only=on','postgres:17.6','sh','-c',('IFS= read -r encoded; PGPASSWORD="$(printf ''%s'' "$encoded" | base64 -d)"; export PGPASSWORD; unset encoded; '+$Command))
        return ,(Invoke-DockerBytes $args $stdinBytes)
    } finally {[Array]::Clear($passwordBytes,0,$passwordBytes.Length);[Array]::Clear($stdinBytes,0,$stdinBytes.Length);$credential.Password.Dispose()}
}
function Source-Sql([string]$Sql) {
    # Queries here are fixed program text, not user data. Quote for POSIX shell.
    $readOnlySql='BEGIN READ ONLY; '+$Sql+' COMMIT;'
    $quoted="'"+$readOnlySql.Replace("'","'"+'"'+"'"+'"'+"'")+"'"
    return $utf8.GetString((Invoke-Source ('exec psql -X -w -v ON_ERROR_STOP=1 -qAt -c '+$quoted)))
}
function Protect-File([string]$Path,[byte[]]$Bytes) {
    $encrypted=[System.Security.Cryptography.ProtectedData]::Protect($Bytes,$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser)
    [System.IO.File]::WriteAllBytes($Path,$encrypted)
}
function Unprotect-File([string]$Path) {
    return ,[System.Security.Cryptography.ProtectedData]::Unprotect([System.IO.File]::ReadAllBytes($Path),$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser)
}
function Digest([byte[]]$Bytes){return [Convert]::ToHexString([System.Security.Cryptography.SHA256]::HashData($Bytes)).ToLowerInvariant()}
$fingerprintSql="SELECT json_build_object('users',(SELECT encode(sha256(convert_to(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]'),'UTF8')),'hex') FROM auth.users t),'identities',(SELECT encode(sha256(convert_to(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]'),'UTF8')),'hex') FROM auth.identities t),'progress',(SELECT encode(sha256(convert_to(coalesce(jsonb_agg(to_jsonb(t) ORDER BY user_id,node_id,field)::text,'[]'),'UTF8')),'hex') FROM public.learning_progress t),'receipts',(SELECT encode(sha256(convert_to(coalesce(jsonb_agg(to_jsonb(t) ORDER BY user_id,operation_id)::text,'[]'),'UTF8')),'hex') FROM public.learning_operations t));"

if($Mode -eq 'Inventory') {
    Source-Sql "SELECT json_build_object('version',current_setting('server_version'),'readOnly',current_setting('transaction_read_only'),'schemas',(SELECT json_agg(nspname ORDER BY nspname) FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname <> 'information_schema'),'extensions',(SELECT json_agg(extname ORDER BY extname) FROM pg_extension),'users',(SELECT count(*) FROM auth.users),'progress',(SELECT count(*) FROM public.learning_progress),'receipts',(SELECT count(*) FROM public.learning_operations));"
    exit
}
if($Mode -eq 'Backup') {
    $target=Join-Path $privateRoot ('backup-'+[DateTime]::UtcNow.ToString('yyyyMMddTHHmmssZ')+'-'+[guid]::NewGuid().ToString('N').Substring(0,6))
    [System.IO.Directory]::CreateDirectory($target)|Out-Null
    $beforeFingerprint=Source-Sql $fingerprintSql
    # Full logical database archive. No plaintext archive is written to disk.
    $dump=Invoke-Source 'exec pg_dump -w --format=custom --no-password --lock-wait-timeout=15000'
    if($dump.Length -lt 100 -or $utf8.GetString($dump[0..4]) -ne 'PGDMP'){throw 'Invalid pg_dump archive'}
    Protect-File (Join-Path $target 'database.dump.dpapi') $dump
    $verified=Unprotect-File (Join-Path $target 'database.dump.dpapi')
    if((Digest $verified) -ne (Digest $dump)){throw 'Encrypted archive roundtrip mismatch'}
    $roles=Source-Sql "SELECT format('CREATE ROLE %I NOLOGIN;',rolname) FROM pg_roles WHERE rolname NOT LIKE 'pg_%' AND rolname <> 'postgres' ORDER BY rolname;"
    Protect-File (Join-Path $target 'roles-for-isolated-restore.sql.dpapi') ($utf8.GetBytes($roles))
    $afterFingerprint=Source-Sql $fingerprintSql
    if($beforeFingerprint.Trim() -cne $afterFingerprint.Trim()){throw 'Backup saved but source changed during export; repeat to establish a comparable snapshot.'}
    Protect-File (Join-Path $target 'account-data-fingerprints.json.dpapi') ($utf8.GetBytes($afterFingerprint))
    $manifest=@{project='jjmihlewnbkfwpfgtfqi';createdAt=[DateTime]::UtcNow.ToString('o');format='pg_dump custom';scope='full logical PostgreSQL database; excludes external services and storage objects';encryption='Windows DPAPI CurrentUser; machine/account bound';plaintextSha256=(Digest $dump);bytes=$dump.Length;restoreVerified=$false}
    $manifest|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $target 'manifest.json') -Encoding utf8
    [Array]::Clear($dump,0,$dump.Length);[Array]::Clear($verified,0,$verified.Length)
    @{state='encrypted_backup_created';directory=$target;bytes=$manifest.bytes;sha256=$manifest.plaintextSha256}|ConvertTo-Json -Compress
    exit
}
if($Mode -eq 'Restore') {
    if(-not $BackupDirectory){throw 'Exact backup directory required'}
    $target=(Resolve-Path -LiteralPath $BackupDirectory).Path
    if(-not $target.StartsWith($privateRoot+[System.IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'Backup must remain under the private backup directory'}
    $manifest=Get-Content -LiteralPath (Join-Path $target 'manifest.json') -Raw|ConvertFrom-Json
    $dump=Unprotect-File (Join-Path $target 'database.dump.dpapi')
    if((Digest $dump) -ne $manifest.plaintextSha256){throw 'Backup checksum mismatch'}
    $roles=Unprotect-File (Join-Path $target 'roles-for-isolated-restore.sql.dpapi')
    $name='akm-restore-'+[guid]::NewGuid().ToString('N').Substring(0,12)
    $started=$false;$watch=[Diagnostics.Stopwatch]::StartNew()
    try {
        # No host port, no external network; restored credentials cannot log in.
        [void](Invoke-DockerBytes @('run','-d','--rm','--name',$name,'--network','none','--tmpfs','/var/lib/postgresql/data:rw','-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:17.6'))
        $started=$true
        [void](Invoke-DockerBytes @('exec',$name,'sh','-c','for i in $(seq 1 30); do pg_isready -U postgres >/dev/null 2>&1 && exit 0; sleep 1; done; exit 1'))
        [void](Invoke-DockerBytes @('exec','-i',$name,'psql','-U','postgres','-X','-v','ON_ERROR_STOP=1') $roles)
        $bootstrap=$utf8.GetBytes('CREATE SCHEMA IF NOT EXISTS extensions; CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions; CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;')
        [void](Invoke-DockerBytes @('exec','-i',$name,'psql','-U','postgres','-X','-v','ON_ERROR_STOP=1') $bootstrap)
        # This drill restores account and learning schemas, preserving their ACLs.
        # Other platform schemas require a compatible full Supabase environment.
        # pg_restore --schema alone omits schema creation and schema ACLs. Select
        # these archive entries explicitly so the original permissions survive.
        $toc=$utf8.GetString((Invoke-DockerBytes @('exec','-i',$name,'pg_restore','--list') $dump))
        $selected=($toc -split "`n" | Where-Object {$_ -match '^\d+;.* (auth|public) ' -or $_ -match '^\d+;.* SCHEMA (?:- )?(auth|public) '}) -join "`n"
        if($selected -notmatch 'SCHEMA - auth ' -or $selected -notmatch 'TABLE DATA public learning_progress '){throw 'Required archive entries missing'}
        [void](Invoke-DockerBytes @('exec','-i',$name,'sh','-c','cat > /var/lib/postgresql/data/restore.dump') $dump)
        [void](Invoke-DockerBytes @('exec','-i',$name,'sh','-c','cat > /var/lib/postgresql/data/restore.list') ($utf8.GetBytes($selected+"`n")))
        [void](Invoke-DockerBytes @('exec',$name,'pg_restore','-U','postgres','-d','postgres','--exit-on-error','--use-list=/var/lib/postgresql/data/restore.list','/var/lib/postgresql/data/restore.dump'))
        $query="SELECT json_build_object('users',(SELECT count(*) FROM auth.users),'progress',(SELECT count(*) FROM public.learning_progress),'receipts',(SELECT count(*) FROM public.learning_operations),'orphanProgress',(SELECT count(*) FROM public.learning_progress p LEFT JOIN auth.users u ON p.user_id=u.id WHERE u.id IS NULL),'rls',(SELECT bool_and(relrowsecurity) FROM pg_class WHERE oid IN ('public.learning_progress'::regclass,'public.learning_operations'::regclass)));"
        $counts=$utf8.GetString((Invoke-DockerBytes @('exec',$name,'psql','-U','postgres','-X','-At','-v','ON_ERROR_STOP=1','-c',$query)))|ConvertFrom-Json
        if($counts.orphanProgress -ne 0 -or -not $counts.rls){throw 'Restored integrity or RLS failure'}
        $fingerprints=$utf8.GetString((Invoke-DockerBytes @('exec',$name,'psql','-U','postgres','-X','-At','-c',$fingerprintSql)))
        $expectedFingerprint=$utf8.GetString((Unprotect-File (Join-Path $target 'account-data-fingerprints.json.dpapi')))
        if($fingerprints.Trim() -cne $expectedFingerprint.Trim()){throw 'Restored account data does not match source fingerprints'}
        # Run synthetic fixtures only in the network-isolated restore, inside
        # the existing rollback transaction. Original restored rows survive.
        $regression=[System.IO.File]::ReadAllText((Join-Path $PSScriptRoot '../supabase/tests/progress.sql'))
        $fixture="begin;`nTRUNCATE public.learning_progress, public.learning_operations, auth.users CASCADE;`nINSERT INTO auth.users(id) VALUES ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');"
        $regression=[regex]::Replace($regression,'(?m)^begin;',$fixture,1)
        [void](Invoke-DockerBytes @('exec','-i',$name,'psql','-U','postgres','-X','-v','ON_ERROR_STOP=1') ($utf8.GetBytes($regression)))
        $after=$utf8.GetString((Invoke-DockerBytes @('exec',$name,'psql','-U','postgres','-X','-At','-c',$query)))|ConvertFrom-Json
        if(($counts|ConvertTo-Json -Compress) -cne ($after|ConvertTo-Json -Compress)){throw 'Regression transaction did not preserve restored rows'}
        $report=@{state='partial_restore_verified';scope='auth and public schemas, ownership and ACLs';dataFingerprintsMatched=$true;counts=$counts;seconds=[Math]::Round($watch.Elapsed.TotalSeconds,2);databaseRegression='passed: RLS, isolation, anonymous denial, replay, conflict, cancellation, cascade';fullSupabaseRestore=$false;otpLoginTested=$false;network='none';sourceModified=$false}
        $report|ConvertTo-Json -Depth 5|Set-Content -LiteralPath (Join-Path $target 'restore-report.json') -Encoding utf8
        $report|ConvertTo-Json -Depth 5 -Compress
    } finally {
        if($started){[void](Invoke-DockerBytes @('rm','-f',$name))}
        [Array]::Clear($dump,0,$dump.Length);[Array]::Clear($roles,0,$roles.Length)
    }
}
