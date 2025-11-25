# ⚡ Expo + Tailwind + Redux + Router Template  

A **clean, scalable starter** for building apps with **React Native (Expo)**, styled using **Tailwind (NativeWind)**, powered by **Redux Toolkit** for state management, and **Expo Router** for navigation (with **Tabs & Drawer** included).  

> 🚀 Build modern, production-ready Expo apps — faster.

---

## 📦 Installation  

```sh
# install dependencies
npm install
# or
yarn install
# or
pnpm install
```

---

## 🚀 Development  

Start the Expo dev server with hot reload:  

```sh
npx expo start
```

Open in **Expo Go** (scan the QR) or run on a simulator/emulator.

---

## 📤 Build  

Build for production with **EAS**:  

```sh
eas build
```

Or run natively:  

```sh
npx expo run:android
npx expo run:ios
```

---

## 🌐 Environment Variables  

Create a `.env` in your project root:  

```env
EXPO_PUBLIC_API_URL=https://api.example.com
```

Use inside code:  

```ts
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

---

## 🗂 File Structure  

```
app/                     # Expo Router navigation
 ├── (drawer)/           # Drawer navigator
 │   └── (tabs)/         # Tabs inside drawer
 │       ├── _layout.tsx
 │       ├── index.tsx
 │       └── profile.tsx
 └── _layout.tsx         # Root layout

src/
 ├── assets/             # Images, fonts, static files
 ├── components/         # Reusable UI
 │   ├── container/      # Layout wrappers
 │   ├── footer/         # Footer UI
 │   ├── header/         # Header UI
 │   ├── pages/          # Page-level components
 │   │   └── Home.tsx
 │   ├── ui/             # Small UI parts (buttons, inputs, etc.)
 │   └── index.ts        # Barrel export
 ├── conf/               # Config & env helpers
 │   └── conf.ts
 └── store/              # Redux store setup
     ├── features/       # Redux slices
     └── store.ts
```

---

## ✨ Features  

- ⚡ **Expo** – React Native made simple  
- 🗂 **Expo Router** – File-based navigation (Tabs, Drawer, Stack)  
- 🎨 **Tailwind (NativeWind)** – Utility-first styling  
- 🔄 **Redux Toolkit** – Modern state management  


## 📚 Docs & Resources  

- [Expo](https://docs.expo.dev/)  
- [Expo Router](https://expo.github.io/router/docs)  
- [NativeWind](https://www.nativewind.dev/)  
- [Redux Toolkit](https://redux-toolkit.js.org/)  
- [React Native](https://reactnative.dev/)  


