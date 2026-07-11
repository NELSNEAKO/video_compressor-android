# Security & Privacy

Video Compressor is a local-only Android app. It is designed so compression does not require uploading your videos to a server.

## What the app does

1. Lets you pick a video from your device
2. Re-encodes it on-device (Media3 Transformer) to reduce file size while keeping the original resolution
3. Lets you choose where to save the compressed file with the system Save dialog

## What the app does **not** do

- No account / login
- No analytics / ads SDKs in this project
- No cloud upload of your videos for compression
- No access to contacts, SMS, call logs, camera, microphone, or location

## Permissions

| Permission | Why |
|------------|-----|
| `INTERNET` | Declared for the Capacitor WebView runtime. Compression itself works offline. |

Storage access uses the system file picker / Save as flow rather than broad “read all files” permission.

## Build integrity (for GitHub APKs)

- **Release builds** are signed with a project release keystore (not the debug key).
- The keystore and passwords stay on the maintainer machine and must **not** be committed to git.
- Users installing from GitHub may still see Android / Play Protect warnings because the app is sideloaded (not from Play Store). That is expected for GitHub distribution.

## Device safety notes

- Compression uses device CPU/GPU and temporary cache space; very large videos need free storage.
- The app disables cleartext HTTP and cloud backup of app data in the Android manifest.
- Always download the APK only from this repository’s official Releases page.

## Reporting issues

If you find a security concern, open a GitHub issue describing the problem (avoid posting private videos or secrets).
