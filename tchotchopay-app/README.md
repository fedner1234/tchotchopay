# TchotchoPay Mobile App

React Native (Expo) app for iOS and Android.

## Setup

### 1. Install dependencies

```bash
cd tchotchopay-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:
- `API_BASE_URL` → your Netlify site URL (e.g. `https://tchotchopay.com`)
- `STRIPE_PUBLISHABLE_KEY` → your Stripe **publishable** key (starts with `pk_`)
- `PERSONA_TEMPLATE_ID` → your Persona inquiry template ID

### 3. Run locally

```bash
# Start dev server
npm start

# iOS (requires Mac + Xcode)
npm run ios

# Android (requires Android Studio)
npm run android
```

> **Easiest option:** Download the Expo Go app on your iPhone or Android phone,
> then scan the QR code shown in the terminal.

---

## Build for App Store & Google Play

### Install EAS CLI

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Build for iOS (App Store)

```bash
npm run build:ios
```

You will need:
- Apple Developer Account ($99/year) at developer.apple.com
- The bundle ID `com.tchotchopay.app` registered in App Store Connect

### Build for Android (Google Play)

```bash
npm run build:android
```

You will need:
- Google Play Console account ($25 one-time) at play.google.com/console
- The package name `com.tchotchopay.app`

### Submit to stores

```bash
# After build completes:
npm run submit:ios
npm run submit:android
```

---

## App Structure

```
tchotchopay-app/
├── App.js                        # Root component
├── app.json                      # Expo config
├── package.json
├── src/
│   ├── context/
│   │   └── AuthContext.js        # Auth state (login/logout/register)
│   ├── navigation/
│   │   └── AppNavigator.js       # Stack + Tab navigation
│   ├── services/
│   │   ├── api.js                # All API calls to Netlify backend
│   │   └── storage.js            # Secure token storage
│   └── screens/
│       ├── SplashScreen.js       # Animated launch screen
│       ├── OnboardingScreen.js   # 4-slide intro carousel
│       ├── LoginScreen.js        # Email + password login
│       ├── SignUpScreen.js       # Registration + Persona KYC
│       ├── HomeScreen.js         # Dashboard, balance, quick actions
│       ├── SendMoneyScreen.js    # MonCash / NatCash transfers
│       ├── WalletScreen.js       # USDC wallet, history, add funds
│       ├── TopUpScreen.js        # Digicel / Natcom top-ups
│       └── ProfileScreen.js      # Settings, biometrics, logout
```

## Backend

All API calls go to Netlify Functions at `https://tchotchopay.com/.netlify/functions/`:

| Function | Purpose |
|---|---|
| `register` | Create user + Circle wallet |
| `login` | Authenticate, return JWT |
| `circle-wallet` | Get balance + transactions |
| `moncash-transfer` | Send to MonCash/NatCash |
| `send-payment` | Create Stripe PaymentIntent |
| `reloadly-proxy` | Mobile top-up |
| `exchange-rates` | Live USD/HTG rate |

## Updating Persona Template ID

In `src/screens/SignUpScreen.js`, replace:
```js
const PERSONA_TEMPLATE_ID = 'itmpl_YOUR_TEMPLATE_ID';
```
with your actual template ID from the Persona dashboard.
