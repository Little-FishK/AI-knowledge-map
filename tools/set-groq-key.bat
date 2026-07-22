@echo off
title Set GROQ_API_KEY
echo.
echo   This sets your Groq API key into the GROQ_API_KEY environment variable.
echo   Paste your key at the prompt and press Enter. Input stays hidden;
echo   it is NOT shown, NOT sent to any chat or webpage.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=Read-Host 'Paste Groq API key' -AsSecureString; $b=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); $k=[Runtime.InteropServices.Marshal]::PtrToStringAuto($b); [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b); if([string]::IsNullOrWhiteSpace($k)){Write-Host 'Empty input, cancelled.'} elseif($k -notmatch '^gsk_'){Write-Host 'Does not look like a Groq key (should start with gsk_). Cancelled.'} else{[Environment]::SetEnvironmentVariable('GROQ_API_KEY',$k,'User'); Write-Host 'OK: saved to GROQ_API_KEY (User scope). Reopen your terminal/editor to take effect.'}"
echo.
pause
