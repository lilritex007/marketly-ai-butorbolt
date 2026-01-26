# UNAS API Manual Test Script
Write-Host "🧪 UNAS API Termékek Lekérése Teszt" -ForegroundColor Cyan
Write-Host ""

$apiKey = "9a6522bfbcd56045cda463a90d7476d932338f52"

# Step 1: Login
Write-Host "🔐 Login..." -ForegroundColor Yellow
$loginXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <ApiKey>$apiKey</ApiKey>
</Params>
"@

try {
    $loginResponse = Invoke-WebRequest -Uri "https://api.unas.eu/shop/login" `
        -Method POST `
        -ContentType "application/xml; charset=UTF-8" `
        -Body $loginXml `
        -TimeoutSec 30
    
    Write-Host "✅ Login sikeres" -ForegroundColor Green
    
    # Parse token
    $loginXml = [xml]$loginResponse.Content
    $token = $loginXml.Login.Token
    Write-Host "🔑 Token: $token" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 2: Get Products
    Write-Host "📡 Termékek lekérése..." -ForegroundColor Yellow
    
    $productXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <StatusBase>1</StatusBase>
    <ContentType>minimal</ContentType>
    <LimitNum>10</LimitNum>
</Params>
"@
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/xml; charset=UTF-8"
    }
    
    Write-Host "⏱️ Kérés küldése (max 120 sec timeout)..." -ForegroundColor Yellow
    $productResponse = Invoke-WebRequest -Uri "https://api.unas.eu/shop/getProduct" `
        -Method POST `
        -Headers $headers `
        -Body $productXml `
        -TimeoutSec 120
    
    Write-Host "✅ Válasz megérkezett!" -ForegroundColor Green
    Write-Host "📊 Méret: $($productResponse.Content.Length) karakter" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📄 Első 1000 karakter:" -ForegroundColor Yellow
    Write-Host $productResponse.Content.Substring(0, [Math]::Min(1000, $productResponse.Content.Length))
    
} catch {
    Write-Host "❌ Hiba!" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "Press any key..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
