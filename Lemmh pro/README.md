# Lemmh Connect

A cross-platform Expo prototype for onboarding Wi-Fi IoT devices and controlling them from a mobile dashboard.

## Run

```sh
npm install
npm start
```

Use the Expo Go app to scan the QR code, or run `npm run android` / `npm run ios` with the relevant development environment installed.

## Prototype behavior

- Browse a sample device list and toggle simulated device power.
- Walk through a Wi-Fi onboarding flow with sample networks and a password field.
- Complete a simulated connection and add a sample smart plug to the dashboard.
- The demo does not scan for nearby hardware, send Wi-Fi credentials, or connect to a cloud service.

Real provisioning and remote control need a selected device provisioning protocol and cloud API. Those integrations should replace the simulated network discovery and connection in `App.tsx`; do not send real Wi-Fi credentials until the device protocol and secure transport are implemented.
