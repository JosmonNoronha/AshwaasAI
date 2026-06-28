# AshwaasAI

AshwaasAI is an Expo Router app built with React Native and Expo SDK 56. It includes onboarding, tab-based navigation, and a chat flow.

## Requirements

- Node.js 18 or newer
- npm
- Expo Go on a phone, or an Android/iOS simulator if you want to run locally on a device/emulator

## Install Expo and dependencies

This app already uses Expo SDK 56. On a fresh clone, install the project dependencies with:

```bash
git clone <your-repo-url>
cd AshwaasAI
npm install
```

If you ever need to install or update Expo-managed packages, use the Expo installer so the versions stay aligned with SDK 56:

```bash
npm exec expo -- install <package-name>
```

The app uses these exact packages and versions:

```json
{
	"@expo-google-fonts/inter": "^0.4.2",
	"@expo-google-fonts/playfair-display": "^0.4.2",
	"@react-navigation/bottom-tabs": "^7.16.2",
	"@react-navigation/native": "^7.2.5",
	"@react-navigation/stack": "^7.9.3",
	"expo": "~56.0.8",
	"expo-blur": "~56.0.3",
	"expo-font": "~56.0.5",
	"expo-haptics": "~56.0.3",
	"expo-linear-gradient": "~56.0.4",
	"expo-router": "~56.2.8",
	"expo-status-bar": "~56.0.4",
	"lottie-react-native": "^7.3.8",
	"react": "19.2.3",
	"react-dom": "19.2.3",
	"react-native": "0.85.3",
	"react-native-gesture-handler": "^3.0.0",
	"react-native-reanimated": "^4.4.0",
	"react-native-safe-area-context": "~5.7.0",
	"react-native-screens": "4.25.2",
	"react-native-svg": "^15.15.5",
	"react-native-web": "^0.21.2"
}
```

## Run the app

Start the Expo development server with either command:

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
