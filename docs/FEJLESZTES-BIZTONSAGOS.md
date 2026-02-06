# Biztonságos fejlesztés – hogy ne tűnjön el, ami működik

## Visszaállítható állapot (tag)

- **Tag:** `stable-showroom-ok`
- **Jelentése:** Stabil verzió: showroom és vélemények a főoldalon, termékbetöltés, kereső és kategóriaoldalak jól működnek.

**Visszaállítás erre az állapotra (ha valami elromlik):**

```bash
# Csak a kód visszaállítása (main törlése nélkül)
git fetch origin tag stable-showroom-ok
git checkout stable-showroom-ok

# Vagy: main teljes visszaállítása erre a commitra (utána force push kell)
git reset --hard stable-showroom-ok
git push --force origin main
```

A tag a GitHubon is megvan, bármikor vissza lehet állni.

---

## Hogyan fejlesszünk úgy, hogy ne törjön el semmi

### 1. Ágak használata (branch)

- Új funkciót vagy nagyobb változtatást **ne közvetlenül a `main`-on** csinálj.
- Hozz létre egy fejlesztő ágat, pl. `git checkout -b feature/uj-funkcio`.
- Ha minden teszt szerint jó, akkor egyesítsd a `main`-ba: `git checkout main` → `git merge feature/uj-funkcio`.

Így a `main` addig stabil marad, amíg nem merge-elsz.

### 2. Kis lépések, gyakori commit

- Egy commit = egy logikai változtatás (egy funkció, egy javítás).
- Így könnyű megmondani, melyik commit rontotta el a dolgot, és visszacsinálni (revert) vagy visszaállni a tag-ra.

### 3. Amit ne távolíts el / ne bonts szét

- **Főoldal:** Showroom, vélemények (PhotoReviews, Testimonials), Ajándéklista – csak akkor vedd ki vagy bontsd át, ha tudatosan úgy döntesz, és külön commitban teszed.
- **Termékbetöltés:** Paginált API hívás, kategória szűrés – módosítás előtt ellenőrizd, hogy a listázás és a kategóriaoldal továbbra is működik.
- **Kategóriák:** A listát a backend / shop API-ból vedd (pl. kizárásokkal), ne cseréld le config táblára anélkül, hogy ugyanaz a viselkedés megmaradna.
- **Kereső:** A SmartSearchBar és a háttérben futó kereső index – nagy refaktor előtt érdemes egy külön ágon kipróbálni.

### 4. Tesztelés merge / push előtt

- Futtasd a buildet: `npm run build`.
- Nézd végig böngészőben: főoldal (showroom, vélemények), terméklista, kategóriára kattintás, kereső, „Több termék betöltése”.
- Ha valami eltűnt vagy elromlott, **ne pusholj**, hanem javíts ki vagy állj vissza (revert / tag).

### 5. Ha mégis elromlott valami

- **Gyors visszaállás:** `git checkout stable-showroom-ok` (vagy `git reset --hard stable-showroom-ok` + force push, ha a main-t akarod visszaállítani).
- **Egy konkrét commit visszacsinálása:** `git revert <commit-hash>` – ez új commitot készít, ami „visszavonja” a változtatást, a többi történet megmarad.

---

## Összefoglalva

| Cél | Teendő |
|-----|--------|
| Visszaállás erre a stabil verzióra | `git checkout stable-showroom-ok` vagy `git reset --hard stable-showroom-ok` (+ push --force ha kell) |
| Új fejlesztés biztonságosan | Ág: `git checkout -b feature/valami`, majd merge a main-be, ha minden ok |
| Amit ne bontsunk el | Showroom, vélemények, termékbetöltés logika, kategória API, kereső |
| Push előtt | Build + gyors manuális teszt főoldal + termékek + kategória + kereső |
