# NeuroScan

A React Native mobile app built with Expo, styled with NativeWind (Tailwind), and using Redux Toolkit for state management and Expo Router for file-based navigation (Tabs & Drawer included).

This repository is an Expo-managed project (Expo SDK ~53) that uses:

- React 19 / React Native 0.79.6
- Expo Router (file-based routing)
- NativeWind (Tailwind utilities for React Native)
- Redux Toolkit + react-redux
- Expo packages: ImagePicker, Blur, Haptics, Splash Screen, Status Bar, and more


Quick links
- Project name: NeuroScan
- Entry: expo-router (`app/` directory)
- Config: `app.json`
- Package manager: npm (package.json provided)


Checklist (what this README covers)
- Project purpose and stack
- Local setup (macOS) and required tools
- Start / build commands
- Environment variables
- Project structure and important files
- Troubleshooting tips and contribution notes


Getting started (macOS)

Prerequisites
- Node.js (16+ recommended for Expo SDK 53). Use nvm to manage versions: https://github.com/nvm-sh/nvm
- npm (bundled with Node) or yarn/pnpm
- Expo CLI (optional, you can use npx): npm install -g expo-cli
- Xcode (for iOS simulator) — install from App Store
- Android Studio (for Android emulator) — install Android SDK and create an AVD
- CocoaPods: sudo gem install cocoapods (used by `expo run:ios`)

Clone and install

```bash
git clone <repo-url>
cd NeuroScan
npm install
# or: yarn install
```

Start the development server

```bash
# start Metro + Expo dev tools
npm start
# or
npx expo start
```

Run on device / simulator

```bash
# iOS simulator (macOS only)
npm run ios
# Android emulator
npm run android
# Web (in a browser)
npm run web
```

Tips for iOS: if CocoaPods are out of date, run `cd ios && pod install` before `npm run ios`.

Builds

- Local / debug: `npm run android` / `npm run ios`
- Production builds (EAS recommended): follow Expo Application Services (EAS) docs:
  - https://expo.dev/eas

Environment variables

If your app needs build-time or runtime configuration, create an `.env` file in the project root (not checked into git). Example:

```
EXPO_PUBLIC_API_URL=https://api.example.com
OTHER_PUBLIC_KEY=abc123
```

Use with `process.env.EXPO_PUBLIC_API_URL` (Expo exposes variables prefixed with EXPO_PUBLIC_ to the app).

Project structure (high level)

- app/                    — Expo Router pages and layout (file-based routing)
  - (drawer)/             — Drawer navigator container
  - (tabs)/               — Tab screens inside drawer
  - _layout.tsx           — layout wrappers and providers
  - index.jsx / Scan.tsx  — example pages
- src/                    — application source (API helpers, components, store)
  - api/                  — API wrapper (e.g., gemini-api.js)
  - components/           — reusable UI components
  - conf/                 — configuration helpers
  - store/                — Redux store & slices
  - utils/                — miscellaneous utilities & prompts
- assets/                 — images, fonts
- android/, ios/          — native project folders (managed by Expo but present for run:ios/run:android)
- app.json                — Expo app config
- package.json            — npm scripts and dependencies

Key files to check
- `app/_layout.tsx` and `app/(drawer)/_layout.tsx` — app-level layouts and navigation wrappers
- `src/store/store.ts` — Redux store initialization
- `src/conf/conf.ts` — config values and helpers

Common commands

```bash
npm install         # install deps
npm start           # start development server
npm run android     # run on Android device/emulator
npm run ios         # run on iOS simulator (macOS only)
npm run web         # run as web app
npm run lint        # run ESLint
```

Development notes & gotchas

- Metro cache issues: if the app behaves strangely after changes, run:

```bash
npx expo start -c
```

- React Native Reanimated: if you see issues or a white screen, ensure babel plugin config is present (check `babel.config.js`) and rebuild the app after changes.

- Native modules & CocoaPods: when you add native modules, run `cd ios && pod install` before running on iOS.

- Permissions: if using camera or image picker, ensure permissions are listed in `app.json` (iOS `Info.plist` and Android manifest will be adjusted by Expo).

Testing

This project doesn't include a test runner by default. Recommended quick additions:

- Jest for unit tests
- React Native Testing Library for component tests

Contributing

- Please open issues or PRs.
- Keep changes small and focused.
- Follow existing code style (TypeScript types where used, Prettier & ESLint for formatting and linting).

Recommended local workflow

1. Create a branch for your feature/fix: `git checkout -b feat/awesome`.
2. Add tests for new/changed logic.
3. Run `npm run lint` and address warnings.
4. Create a PR with a clear description and steps to reproduce.

Troubleshooting quick list

- Metro errors / stale cache: `npx expo start -c`
- iOS build failures: run `cd ios && pod install`, open Xcode workspace and check signing
- Android build failures: ensure Android SDK and JAVA_HOME are set, update Gradle if needed

License

This project does not include a license file. If you want to open-source it, add a `LICENSE` (MIT is common).

Contact / Maintainer

- Maintainer: (add your name or contact here)


Acknowledgements

Built on an Expo + NativeWind + Redux + Expo Router template. Thanks to the open-source libraries that make rapid mobile development possible.


---

If you'd like, I can also:
- Add a small `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` template.
- Add a `.env.example` file with common variables.
- Add a quick screenshots section (showing how to embed images from `assets/images`).

Tell me which extras you want and I'll add them.
