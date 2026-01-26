# UNAS XML API Teszt Script
# PowerShell-ben futtatható

Write-Host "🧪 UNAS API Teszt" -ForegroundColor Cyan
Write-Host ""

# UNAS API konfiguráció
$shopId = "81697"
$authCode = "98ff143933"
$apiUrl = "https://api.unas.eu/shop/getProducts"

# XML kérés összeállítása
$xmlBody = @"
<?xml version="1.0" encoding="UTF-8"?>
<Request>
    <AuthCode>$authCode</AuthCode>
    <ShopId>$shopId</ShopId>
</Request>
"@

Write-Host "📡 Calling UNAS API..." -ForegroundColor Yellow
Write-Host "URL: $apiUrl"
Write-Host ""

try {
    # API hívás
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -ContentType "application/xml; charset=UTF-8" `
        -Body $xmlBody `
        -ErrorAction Stop
    
    Write-Host "✅ Sikeres válasz! (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host ""
    
    # XML válasz megjelenítése
    Write-Host "📦 XML Válasz:" -ForegroundColor Cyan
    Write-Host $response.Content
    Write-Host ""
    
    # Termékek száma
    if ($response.Content -match "<Product>") {
        $productCount = ([regex]::Matches($response.Content, "<Product>")).Count
        Write-Host "🎉 Termékek száma: $productCount" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Nincs termék a válaszban" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Hiba történt!" -ForegroundColor Red
    Write-Host "HTTP Státusz: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Hibaüzenet: $($_.Exception.Message)"
    Write-Host ""
    
    # Ha van válasz, mutassuk meg
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Válasz tartalma:"
        Write-Host $errorBody
    }
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
