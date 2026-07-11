# Video Compressor

Local-only Android app that compresses videos on-device. Pick a video, choose a quality mode, and save a smaller file — without uploading anything to a server.

## Features

- **On-device compression** using Android Media3 Transformer
- **Original resolution preserved** — only bitrate is reduced
- **Three quality modes:** Fast, Balanced, and Maximum
- **System file picker & Save dialog** — no broad storage permissions
- **Privacy-first** — no accounts, analytics, ads, or cloud upload

See [SECURITY.md](SECURITY.md) for privacy and permission details.

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | Vue 3, Vite, Tailwind CSS |
| Native shell | Capacitor 8 |
| Compression | Media3 Transformer (Android) |
| App ID | `com.videocompressor.app` |

## Prerequisites

- Node.js 18+
- Android Studio (SDK + emulator or device)
- JDK 17+

## Getting started

```bash
npm install
npm run cap:sync
npm run cap:open
```

`cap:open` launches Android Studio. Run the app from there, or use:

```bash
npm run cap:run
```

### Web UI only (browser mock)

```bash
npm run dev
```

Compression in the browser is simulated; real re-encoding requires the Android build.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build web assets |
| `npm run cap:sync` | Build web assets and sync to Android |
| `npm run cap:open` | Open the Android project in Android Studio |
| `npm run cap:run` | Sync and run on a connected device/emulator |
| `npm run cap:build:apk` | Build a debug APK |
| `npm run cap:build:apk:release` | Build a signed release APK |

### APK output paths

- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

## Release signing

1. Copy `android/keystore.properties.example` to `android/keystore.properties`
2. Create a keystore and fill in the store password, key alias, and key password
3. Keep `keystore.properties` and `*.keystore` out of git

Then run:

```bash
npm run cap:build:apk:release
```

## Compression modes

| Mode | Target bitrate | Typical size reduction |
|------|----------------|------------------------|
| Fast | 3.5 Mbps | ~25% |
| Balanced | 1.8 Mbps | ~45% |
| Maximum | 0.9 Mbps | ~65% |

Actual results depend on the source video. Resolution is unchanged in all modes.

## Project structure

```
src/                  Vue app (UI + Capacitor bridges)
android/              Native Android project + VideoReencoder plugin
capacitor.config.ts   Capacitor app id and webDir
```

## License

Private project. All rights reserved unless otherwise stated.
