# Start ngrok
Start-Process -NoNewWindow -FilePath "C:\ngrok\ngrok.exe" -ArgumentList "http 5678"
Start-Sleep -Seconds 4

# Get the public URL from ngrok API
$response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels"
$url = $response.tunnels[0].public_url

# Update .env.local file automatically
$envPath = "D:\Felcy\Product_manager and Agentic_AI\Assignments\Agent_AI\Recruit-AI_prj\Code\25_Apl\recruit-ai-saas-prototype-main\.env.local"

(Get-Content $envPath) `
  -replace 'N8N_WEBHOOK_URL=.*', "N8N_WEBHOOK_URL=$url/webhook/recruitai/score" `
  -replace 'N8N_SCORE_URL=.*', "N8N_SCORE_URL=$url/webhook/recruitai/score" `
  -replace 'N8N_INVITE_URL=.*', "N8N_INVITE_URL=$url/webhook/recruitai/invite" `
  -replace 'N8N_REJECT_WEBHOOK_URL=.*', "N8N_REJECT_WEBHOOK_URL=$url/webhook/reject" |
Set-Content $envPath

Write-Host "✅ Tunnel started: $url"
Write-Host "✅ All URLs updated in .env.local!"
Write-Host "✅ Now start n8n and restart your app!"