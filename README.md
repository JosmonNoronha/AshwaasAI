# AshwaasAI

AshwaasAI is an Expo Router app built with React Native and Expo SDK 56. It includes onboarding, tab-based navigation, and a chat flow.

## Requirements

- Node.js 18 or newer
- npm
- Expo Go on a phone, or an Android/iOS simulator if you want to run locally on a device/emulator

## Clone and install

```bash
git clone <your-repo-url>
cd AshwaasAI
npm install
```

If you need to add or reinstall Expo-managed packages later, use the Expo installer so versions stay aligned with SDK 56:

```bash
npm exec expo -- install <package-name>
```

## Run the app

Start the Expo development server:

```bash
npm run start

npx expo start   ( i use this command the run on web in developer mode and change the display to any mobile device cuz android studio doesnt work on my laptop and their expo go app is dogshit )
```

From there you can:

- Scan the QR code with Expo Go on your phone
- Press `a` to open Android
- Press `i` to open iOS
- Press `w` to open the web version

You can also run the platform-specific scripts directly:

```bash
npm run android
npm run ios
npm run web
```

## Project structure

- `app/` - Expo Router screens and navigation layouts
- `components/` - Reusable UI components
- `constants/` - Shared theme and configuration values
- `assets/` - Static images, icons, and other bundled assets
- `App.js` / `index.js` - App entry points for Expo Router

## Notes

- The project uses Expo Router, so screen routes are defined inside `app/`.
- Fonts are loaded at startup in the root layout before the app UI renders.
- A generated `dist/` folder is present in the repo; you usually do not need it for day-to-day development.
