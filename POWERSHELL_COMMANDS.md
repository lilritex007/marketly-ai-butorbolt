# 🪟 PowerShell Parancsok - Gyors Referencia

## 🧪 Tesztelési Scriptek (AJÁNLOTT)

### UNAS API Teszt
```powershell
.\test-unas-api.ps1
```
Ez teszteli az UNAS API kapcsolatot és megmutatja a válaszát.

### Backend API Teszt
```powershell
.\test-backend.ps1
```
Ez ellenőrzi a backend működését, statisztikákat és termékeket.

---

## 📡 UNAS API Manuális Teszt

```powershell
# UNAS API teszt
$xmlBody = @"
<?xml version="1.0" encoding="UTF-8"?>
<Request>
    <AuthCode>98ff143933</AuthCode>
    <ShopId>81697</ShopId>
</Request>
"@

$response = Invoke-WebRequest -Uri "https://api.unas.eu/shop/getProducts" `
    -Method POST `
    -ContentType "application/xml; charset=UTF-8" `
    -Body $xmlBody

# Válasz megjelenítése
$response.Content
```

---

## 🔧 Backend API Parancsok

### Statisztikák
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/stats"
```

### Termékek lekérése
```powershell
# Első 10 termék
Invoke-RestMethod -Uri "http://localhost:3001/api/products?limit=10"

# Keresés
Invoke-RestMethod -Uri "http://localhost:3001/api/products?search=szék"

# Kategória szűrés
Invoke-RestMethod -Uri "http://localhost:3001/api/products?category=Székek"
```

### Kategóriák
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/categories"
```

### Manuális Szinkronizáció
```powershell
# Teljes szinkronizáció
Invoke-RestMethod -Uri "http://localhost:3001/api/admin/sync" -Method POST

# Csak bizonyos kategóriák
$body = @{
    categories = @("Székek", "Asztalok")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/admin/sync" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Szinkronizációs Előzmények
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/admin/sync/history?limit=10"
```

---

## 🛠️ Termék Kezelés

### Termék Letiltása
```powershell
$body = @{
    show_in_ai = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/admin/products/PRODUCT_ID" `
    -Method PATCH `
    -ContentType "application/json" `
    -Body $body
```

### Prioritás Beállítása
```powershell
$body = @{
    priority = 100
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/admin/products/PRODUCT_ID" `
    -Method PATCH `
    -ContentType "application/json" `
    -Body $body
```

### Egyedi Leírás Hozzáadása
```powershell
$body = @{
    custom_description = "Prémium skandináv design bútor"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/admin/products/PRODUCT_ID" `
    -Method PATCH `
    -ContentType "application/json" `
    -Body $body
```

### Termék Törlése
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/admin/products/PRODUCT_ID" `
    -Method DELETE
```

---

## 📂 Kategória Kezelés

### Kategória Letiltása
```powershell
$body = @{
    enabled = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/admin/categories/Székek" `
    -Method PATCH `
    -ContentType "application/json" `
    -Body $body
```

---

## 🧹 Karbantartás

### Adatbázis Reset
```powershell
# Adatbázis törlése
Remove-Item -Path "data" -Recurse -Force -ErrorAction SilentlyContinue

# Szerver indítása (új adatbázist hoz létre)
npm run server
```

### .env Fájl Ellenőrzése
```powershell
# UNAS konfiguráció megtekintése
Get-Content .env | Select-String "UNAS"
```

---

## 🚀 Szerver Indítás

```powershell
# Szerver indítása
npm run server

# Teljes stack (backend + frontend)
npm run dev:full

# Adatbázis teszt
npm run test:db
```

---

## 💡 Hasznos Tippek

### JSON Formázott Kimenetre
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/products?limit=5" | ConvertTo-Json -Depth 5
```

### Válasz Mentése Fájlba
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/products" | ConvertTo-Json -Depth 10 | Out-File "products.json"
```

### HTTP Státuszkód Ellenőrzése
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3001/api/stats"
Write-Host "Status: $($response.StatusCode)"
$response.Content | ConvertFrom-Json
```

---

## ⚠️ Hibakezelés

### Részletes Hibaüzenetek
```powershell
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/stats"
    $response
} catch {
    Write-Host "Hiba: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Válasz: $errorBody"
    }
}
```

---

## 📋 Gyors Ellenőrző Lista

```powershell
# 1. Backend fut-e?
Invoke-RestMethod -Uri "http://localhost:3001/health"

# 2. Van termék?
(Invoke-RestMethod -Uri "http://localhost:3001/api/stats").total_products

# 3. Utolsó sync mikor volt?
(Invoke-RestMethod -Uri "http://localhost:3001/api/stats").last_sync

# 4. Hány kategória?
(Invoke-RestMethod -Uri "http://localhost:3001/api/categories").categories.Count
```

---

## 🎯 Teljes Workflow

```powershell
# 1. Szerver indítás
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run server"

# 2. Várj 5 másodpercet
Start-Sleep -Seconds 5

# 3. Ellenőrizd a statisztikákat
.\test-backend.ps1

# 4. Ha nincs termék, futtass sync-et
Invoke-RestMethod -Uri "http://localhost:3001/api/admin/sync" -Method POST
```

---

## 📖 Dokumentációk

- **`test-unas-api.ps1`** - UNAS API teszt script
- **`test-backend.ps1`** - Backend teszt script
- **`QUICK_REFERENCE.md`** - Általános referencia
- **`UNAS_XML_API.md`** - UNAS API dokumentáció

---

✅ **Egyszerű használat:** Futtasd a `.\test-backend.ps1` scriptet! 🚀
