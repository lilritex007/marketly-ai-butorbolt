# UNAS API Batch Sync - 160-170K Termék

## 📊 Helyzet
- **Cél**: 160-170K termék betöltése (MINDEN: aktív + inaktív)
- **Jelenleg**: 6K aktív termék (`StatusBase=1`)
- **Megoldás**: Batch letöltés `StatusBase` nélkül

## ⚠️ Rate Limit
- **PREMIUM**: 2000 hívás/óra
- **VIP**: 6000 hívás/óra
- **Tiltás**: 1 óra (sikertelen hívások után)

## 🔧 Implementáció

### Batch paraméterek:
- **Batch size**: 1000 termék
- **Batches**: ~170 (170K termék esetén)
- **Várakozás**: 2 másodperc/batch
- **Teljes idő**: ~5-6 perc (170 batch × 2s)

### Content típusok:
1. **SHORT** (jelenlegi): 
   - Gyors
   - Kategória, név, ár, alapadatok
   - 1 hívás = 1000 termék
   
2. **FULL** (később):
   - Teljes leírás, paraméterek, extra képek
   - Lassú, rate limit-sensitive
   - Batch-elve később

## 🚀 Használat

```bash
# Manuális sync (1 óra tiltás után)
curl -X POST http://localhost:3002/api/admin/sync

# Vagy PowerShell
Invoke-RestMethod -Uri "http://localhost:3002/api/admin/sync" -Method POST
```

## 📈 Progress tracking

A backend konzolon látható:
```
📦 Batch 1: Fetching products 0-1000...
  ✓ Got 1000 products
   ⏳ Waiting 2s (rate limit protection)...
📦 Batch 2: Fetching products 1000-2000...
```

## ✅ Eredmény
- ~170K termék az adatbázisban
- Kategóriák: "Otthon és kert" alkategóriái
- SHORT tartalom (gyors sync)
- Később FULL adatok batch-elve
