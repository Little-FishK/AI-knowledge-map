@echo off
chcp 65001 >nul
title 设置 Groq API Key
echo.
echo   这个窗口帮你把 Groq API Key 存进环境变量 GROQ_API_KEY。
echo   下一行粘贴你的 key 后回车 —— 输入不显示，不会进对话、不会进网页。
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=Read-Host '粘贴 Groq API key' -AsSecureString; $b=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); $k=[Runtime.InteropServices.Marshal]::PtrToStringAuto($b); [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b); if([string]::IsNullOrWhiteSpace($k)){Write-Host '未输入，已取消。'} elseif($k -notmatch '^gsk_'){Write-Host '这不像 Groq key（通常以 gsk_ 开头），已取消。'} else{[Environment]::SetEnvironmentVariable('GROQ_API_KEY',$k,'User'); Write-Host '✓ 已保存到用户环境变量 GROQ_API_KEY。请关掉并重开终端/编辑器后生效。'}"
echo.
pause
