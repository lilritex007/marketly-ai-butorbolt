# Radikálisan Egyszerű Design System

## Filozófia: Kevesebb Minden

**Egy szabály**: Ha kétséged van, vedd ki.

---

## 1. Színek - CSAK 2

```
Primary: #FF8A00 (narancs - CTA, aktív)
Neutral: Gray scale (900, 700, 500, 200, 100, 50, white)

KÉSZ. Nincs secondary, nincs több accent.
```

---

## 2. Typography - 3 Méret Per Szekció

```
Hero:
- H1: text-5xl (48px) desktop, text-3xl (30px) mobile
- Body: text-xl (20px) desktop, text-lg (18px) mobile
- Caption: text-sm (14px)

Szekciók:
- H2: text-3xl (30px) desktop, text-2xl (24px) mobile  
- Body: text-base (16px)
- Caption: text-sm (14px)

Font: Inter, 400 (regular), 600 (semibold), 700 (bold)
```

---

## 3. Spacing - EGY Skála

```
Section padding: py-20 (mindenhol ugyanaz)
Container: max-w-6xl (mindenhol ugyanaz)
Grid gap: gap-6 (mindenhol ugyanaz)
Element gap: gap-4 (buttons, badges)

Kész. Nincs py-14, py-16, py-24. Csak py-20.
```

---

## 4. Gombok - 2 Típus

```
Primary:
- px-6 py-3
- bg-primary-500 text-white
- rounded-lg (nem xl, nem 2xl)
- shadow-sm hover:shadow-md
- Semmi shimmer, semmi gradient overlay

Secondary:  
- px-6 py-3
- bg-white text-gray-900 border border-gray-200
- rounded-lg
- hover:border-gray-300

Text Link:
- text-primary-600 underline
- hover:text-primary-700
```

---

## 5. Kártyák - 1 Stílus

```
- rounded-lg (16px, mindenhol ugyanaz)
- border border-gray-200
- bg-white
- p-6 (mindenhol ugyanaz)
- hover:shadow-md (csak shadow, semmi border-color change)
- hover:-translate-y-1

Semmi gradient border, semmi glow.
```

---

## 6. Shadow - 2 Szint

```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.07)

Kész. Nincs lg, xl, 2xl, primary-shadow.
```

---

## 7. Animációk - MINIMÁLIS

```
Transition: 200ms ease-out (mindenhol ugyanaz)

Engedélyezett:
- hover:-translate-y-1
- hover:shadow-md  
- opacity fade-in

TILOS:
- Shimmer
- Parallax
- Complex gradients
- Stagger animations
- Blur effects
```

---

## 8. Layout - Fix Szabályok

```
Hero:
- min-h-screen (teljes, egyszerű)
- text-center
- max-w-3xl mx-auto (szűk, fókusz)

Szekciók:
- py-20 (fix)
- max-w-6xl mx-auto (fix)
- px-6 (fix)

Grid:
- gap-6 (fix)
- 1 col mobile, 3 col desktop (fix)
```

---

## 9. Ami KIMEGY

❌ Violet color  
❌ 3-color gradients
❌ Button shimmer effect
❌ Card gradient border glow
❌ Parallax movement
❌ CountUp animations
❌ Multiple container widths (max-w-5xl, max-w-7xl, max-w-8xl)
❌ Multiple paddings (py-14, py-16, py-24)
❌ Multiple gaps (gap-5, gap-8)
❌ Complex shadows (shadow-primary, shadow-2xl)
❌ Multiple rounded (rounded-xl, rounded-2xl, rounded-3xl)

---

## 10. Ami MARAD

✅ Primary color (#FF8A00)
✅ Gray scale
✅ Inter font
✅ rounded-lg (16px mindenhol)
✅ py-20 (mindenhol)
✅ max-w-6xl (mindenhol)
✅ gap-6 (mindenhol)
✅ shadow-sm → shadow-md
✅ 200ms transitions

---

## Példa: Hero (ÚJ)

```jsx
<section className="min-h-screen flex items-center justify-center bg-gray-50">
  <div className="max-w-3xl mx-auto px-6 text-center">
    <h1 className="text-5xl font-bold text-gray-900 mb-6">
      Találd meg az ideális bútort
    </h1>
    <p className="text-xl text-gray-600 mb-8">
      AI-alapú keresés, tervezés, vásárlás – egy helyen.
    </p>
    <div className="flex gap-4 justify-center">
      <button className="px-6 py-3 bg-primary-500 text-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
        Kezdés
      </button>
      <button className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-lg hover:border-gray-300 hover:-translate-y-1 transition-all duration-200">
        Termékek
      </button>
    </div>
  </div>
</section>
```

---

## Példa: Feature Card (ÚJ)

```jsx
<div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
  <Icon className="w-8 h-8 text-primary-500 mb-4" />
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    Funkció Neve
  </h3>
  <p className="text-sm text-gray-600">
    Rövid leírás.
  </p>
</div>
```

---

## Implementációs Checklist

- [ ] Minden section: py-20, max-w-6xl, px-6
- [ ] Minden button: px-6 py-3, rounded-lg
- [ ] Minden card: rounded-lg, border-gray-200, p-6
- [ ] Minden grid: gap-6
- [ ] Minden transition: 200ms
- [ ] Minden hover: -translate-y-1 + shadow-md
- [ ] Csak gray + primary color
- [ ] Csak sm/md shadow
- [ ] Semmi shimmer, parallax, complex animation

---

**Radikálisan egyszerű. Radikálisan szép.**
