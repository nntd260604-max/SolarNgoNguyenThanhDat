# Script chup anh Chatbot AI
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "d:\F_ACER_NITRO_V\CODE_visual\website dat\assets\screenshots"
$target = Join-Path $outDir "Hinh4_14_Chatbot_AI_Assistant.png"

# Tạo 1 file HTML tạm mở sẵn chatbot
$tempHtml = "d:\F_ACER_NITRO_V\CODE_visual\website dat\home_chatbot_preview.html"
$content = Get-Content "d:\F_ACER_NITRO_V\CODE_visual\website dat\home.html" -Raw
$injected = $content.Replace("</body>", "<script>setTimeout(() => { document.getElementById('chatbot-launcher-btn')?.click(); }, 300);</script></body>")
Set-Content -Path $tempHtml -Value $injected -Encoding UTF8

Write-Host "Chup anh Chatbot AI Assistant..."
Start-Process -FilePath $edgePath -ArgumentList "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1440,950", "--screenshot=""$target""", "http://localhost:3000/home_chatbot_preview.html" -PassThru -Wait

if (Test-Path $target) {
  $size = (Get-Item $target).Length
  Write-Host "Thanh cong! Size: $([math]::Round($size/1024, 1)) KB"
}

if (Test-Path $tempHtml) {
  Remove-Item $tempHtml -Force
}

