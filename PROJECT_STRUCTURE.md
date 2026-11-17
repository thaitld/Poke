# Pokemon Project Structure

This file lists the main structure of the current project.

## Overview

- Project name: `pokemon`
- Stack: React, TypeScript, Vite
- Entry point: `src/main.tsx`
- Root app: `src/App.tsx`

## Directory Tree

```text
Pokemon/
├─ index.html
├─ package.json
├─ README.md
├─ vite.config.ts
├─ eslint.config.js
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ public/
│  ├─ favicon.svg
│  └─ icons.svg
└─ src/
   ├─ App.tsx
   ├─ App.css
   ├─ main.tsx
   ├─ index.css
   ├─ FloatingLines.tsx
   ├─ FloatingLines.css
   ├─ assets/
   │  ├─ hero.png
   │  ├─ react.svg
   │  └─ vite.svg
   ├─ components/
   │  └─ ui/
   │     ├─ BorderBeam.tsx
   │     └─ BorderBeam.css
   ├─ pages/
   │  ├─ AbilityPage.tsx
   │  ├─ CharacteristicPage.tsx
   │  ├─ NotFoundPage.tsx
   │  ├─ PokeathlonStatPage.tsx
   │  └─ PokemonListPage.tsx
   └─ utils/
      └─ pokemon.ts
```

## Scripts

- `npm run dev` - start the development server
- `npm run build` - type-check and build for production
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build

## Notes

- Khi them/chinh chuc nang moi, uu tien luu y dung dan trang hien co; khong can them them mot khung/box thong tin rieng nhu trong anh neu khong thuc su can.
