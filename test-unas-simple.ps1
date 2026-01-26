Write-Host "UNAS API Test" -ForegroundColor Cyan
Write-Host ""

$apiKey = "9a6522bfbcd56045cda463a90d7476d932338f52"

Write-Host "Step 1: Login..." -ForegroundColor Yellow
$loginXml = '<?xml version="1.0" encoding="UTF-8"?><Params><ApiKey>' + $apiKey + '</ApiKey></Params>'

try {
    $loginResponse = Invoke-WebRequest -Uri "https://api.unas.eu/shop/login" -Method POST -ContentType "application/xml" -Body $loginXml -TimeoutSec 30
    
    Write-Host "Login OK" -ForegroundColor Green
    
    $loginXmlParsed = [xml]$loginResponse.Content
    $token = $loginXmlParsed.Login.Token
    Write-Host "Token: $token" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Step 2: Get Products (10 minimal)..." -ForegroundColor Yellow
    
    $productXml = '<?xml version="1.0" encoding="UTF-8"?><Params><StatusBase>1</StatusBase><ContentType>minimal</ContentType><LimitNum>10</LimitNum></Params>'
    
    $productResponse = Invoke-WebRequest -Uri "https://api.unas.eu/shop/getProduct" -Method POST -ContentType "application/xml" -Headers @{Authorization="Bearer $token"} -Body $productXml -TimeoutSec 120
    
    Write-Host "Products OK!" -ForegroundColor Green
    Write-Host "Size: $($productResponse.Content.Length) chars" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "First 1000 chars:" -ForegroundColor Yellow
    Write-Host $productResponse.Content.Substring(0, [Math]::Min(1000, $productResponse.Content.Length))
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter"
