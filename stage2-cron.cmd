@echo off
chcp 65001 >nul
cd /d "C:\Users\Lenovo\PycharmProjects\ai_knowledge_map"
if not defined AI_KNOWLEDGE_MAP_DATA_DIR set "AI_KNOWLEDGE_MAP_DATA_DIR=%LOCALAPPDATA%\ai-knowledge-map"
set "AI_KNOWLEDGE_MAP_LOG_DIR=%AI_KNOWLEDGE_MAP_DATA_DIR%\logs"
if not exist "%AI_KNOWLEDGE_MAP_LOG_DIR%" mkdir "%AI_KNOWLEDGE_MAP_LOG_DIR%"
set "AI_KNOWLEDGE_MAP_STAGE2_LOG=%AI_KNOWLEDGE_MAP_LOG_DIR%\stage2-cron.log"
echo [%date% %time%] --- run start --- >> "%AI_KNOWLEDGE_MAP_STAGE2_LOG%"
"C:\Users\Lenovo\AppData\Roaming\npm\claude.cmd" -p "Run exactly ONE round of the Stage 2 deepdive pipeline as the stage2-orchestrator. Use stage2_next_recommended_page with startOrder 2.2 to find the next non-terminal page id along the official recommended path. Spawn a stage2-audit subagent to audit that page; the controller publishes on pass or queues repair on fail. If repair-queued, spawn a stage2-repair subagent for that page, then stop. Process only ONE page this run, then stop. If the tool returns busy or idle, or the queue is empty, stop immediately without retrying. Do NOT attempt any file reads, file edits, shell commands, or manual-review control actions." --allowedTools "mcp__stage2__stage2_status,mcp__stage2__stage2_next_recommended_page,mcp__stage2__stage2_claim_task,mcp__stage2__stage2_submit_result,mcp__stage2__stage2_read_task_packet,mcp__stage2__stage2_search_project,mcp__stage2__stage2_read_project_file,Task" >> "%AI_KNOWLEDGE_MAP_STAGE2_LOG%" 2>&1
echo [%date% %time%] --- run end, exit %errorlevel% --- >> "%AI_KNOWLEDGE_MAP_STAGE2_LOG%"
