# Backend API Teszt Script
# PowerShell-ben futtatható

Write-Host "🧪 Backend API Teszt" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001"

# Ellenőrizzük, hogy a szerver fut-e
Write-Host "🔍 Backend ellenőrzése..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -ErrorAction Stop
    Write-Host "✅ Backend fut! ($($health.status))" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Backend nem fut!" -ForegroundColor Red
    Write-Host "Indítsd el: npm run server" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Statisztikák
Write-Host "📊 Statisztikák lekérése..." -ForegroundColor Cyan
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/stats"
    Write-Host "  - Összes termék: $($stats.total_products)" -ForegroundColor White
    Write-Host "  - Aktív (AI-ban): $($stats.active_products)" -ForegroundColor White
    Write-Host "  - Raktáron: $($stats.in_stock_products)" -ForegroundColor White
    Write-Host "  - Kategóriák: $($stats.categories_count)" -ForegroundColor White
    Write-Host "  - Utolsó sync: $($stats.last_sync)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Hiba a statisztikák lekérésénél" -ForegroundColor Red
    Write-Host ""
}

# Termékek
Write-Host "📦 Első 5 termék lekérése..." -ForegroundColor Cyan
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/products?limit=5"
    Write-Host "  - Termékek száma: $($products.count)" -ForegroundColor White
    
    if ($products.products.Count -gt 0) {
        Write-Host ""
        Write-Host "  Első termékek:" -ForegroundColor Yellow
        foreach ($product in $products.products[0..([Math]::Min(4, $products.products.Count - 1))]) {
            Write-Host "    - $($product.name) ($($product.price) Ft)" -ForegroundColor White
        }
    } else {
        Write-Host "  ⚠️ Nincs termék!" -ForegroundColor Yellow
        Write-Host "  Futtass sync-et: curl -X POST $baseUrl/api/admin/sync" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Hiba a termékek lekérésénél" -ForegroundColor Red
    Write-Host ""
}

# Kategóriák
Write-Host "📂 Kategóriák lekérése..." -ForegroundColor Cyan
try {
    $categories = Invoke-RestMethod -Uri "$baseUrl/api/categories"
    if ($categories.categories.Count -gt 0) {
        Write-Host "  - Kategóriák száma: $($categories.categories.Count)" -ForegroundColor White
        Write-Host ""
        Write-Host "  Kategóriák:" -ForegroundColor Yellow
        foreach ($cat in $categories.categories) {
            $enabled = if ($cat.enabled) { "✓" } else { "✗" }
            Write-Host "    $enabled $($cat.name)" -ForegroundColor White
        }
    } else {
        Write-Host "  ⚠️ Nincs kategória" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Hiba a kategóriák lekérésénél" -ForegroundColor Red
    Write-Host ""
}

# Szinkronizációs előzmények
Write-Host "🔄 Utolsó 3 szinkronizáció..." -ForegroundColor Cyan
try {
    $history = Invoke-RestMethod -Uri "$baseUrl/api/admin/sync/history?limit=3"
    if ($history.history.Count -gt 0) {
        foreach ($sync in $history.history) {
            $status = if ($sync.status -eq "completed") { "✅" } else { "❌" }
            Write-Host "  $status $($sync.started_at)" -ForegroundColor White
            if ($sync.status -eq "completed") {
                Write-Host "     Letöltve: $($sync.products_fetched), Hozzáadva: $($sync.products_added), Frissítve: $($sync.products_updated)" -ForegroundColor Gray
            } else {
                Write-Host "     Hiba: $($sync.error_message)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  ⚠️ Még nem volt szinkronizáció" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Hiba az előzmények lekérésénél" -ForegroundColor Red
    Write-Host ""
}

Write-Host "✅ Tesztek befejezve!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
