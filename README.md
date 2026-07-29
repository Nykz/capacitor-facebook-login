# Facebook Sign-In Setup & Troubleshooting Guide

A guide for integrating and configuring native Facebook Authentication in Ionic Angular applications using `@capawesome/capacitor-facebook-sign-in`.

---

## 📱 Useful Ionic CLI Commands

### Start Development Server
```bash
ionic serve
```

### Build Web Production Assets
```bash
ionic build
```

### Sync Web Assets & Native Capacitor Plugins
```bash
ionic cap sync
```

### Run Application on Native Platforms
```bash
# Run on iOS Device / Simulator
ionic cap run ios

# Run on Android Device / Emulator
ionic cap run android
```

---

## 🔑 How to Generate Android Debug Key Hash

To generate the debug Key Hash required by the Meta Developer Dashboard for Android native sign-in, run the following command in your macOS **Terminal**:

```bash
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android | openssl sha1 -binary | openssl base64
```

Copy the 28-character output string (ending with `=`) to paste into the Meta App Settings.

---

## ⚙️ Meta Developer Dashboard Configuration Steps

In your [Meta Developer Dashboard](https://developers.facebook.com/) under **App Settings > Basic**:

### 1. Register iOS Platform
1. Click **`+ Add platform`** at the bottom of the page and select **iOS**.
2. Enter your app's **Bundle Identifier** (found in `capacitor.config.ts` under `appId`).
3. Click **Save Changes**.

### 2. Register Android Platform
1. Click **`+ Add platform`** and select **Android**.
2. Select **Google Play Store** (or default store).
3. Enter your app's **Package Name** (found in `capacitor.config.ts` under `appId`).
4. Enter your app's **Class Name** (e.g. `<package_name>.MainActivity`).
5. Paste your generated 28-character **Key Hash** into the **Key hashes** field.
6. Click **Save Changes**. *(If prompted with "We couldn't verify this package name", click **Use this package name**).*

---

## 🛠 Troubleshooting Common Issues

### Issue 1: iOS Crash (`InvalidOperationException`)
- **Symptom**: Tapping "Continue with Facebook" on iOS causes an immediate app crash with `fb<APP_ID> is not registered as a URL scheme`.
- **Cause**: Missing the **`fb`** prefix in `CFBundleURLSchemes` inside `Info.plist`.
- **Solution**: Ensure `ios/App/App/Info.plist` has `CFBundleURLSchemes` formatted as `fb` + App ID:
  ```xml
  <key>CFBundleURLTypes</key>
  <array>
    <dict>
      <key>CFBundleURLSchemes</key>
      <array>
        <string>fbYOUR_APP_ID</string>
      </array>
    </dict>
  </array>
  ```

### Issue 2: "Given URL is not allowed by the Application configuration" Error
- **Symptom**: Facebook OAuth web view displays a red banner error.
- **Cause**: The platform Bundle ID (iOS) or Package Name (Android) has not been added to Meta Developer Dashboard under **App Settings > Basic**.
- **Solution**: Register your Bundle ID and Package Name under **App Settings > Basic** as described in the setup steps above.

### Issue 3: Blank Screen or Invisible Text in Light Mode
- **Symptom**: Custom dark background renders, but text appears invisible or blank on app start/re-open.
- **Cause**: Light Mode default system text colors blending into dark radial background, combined with webview route resolution failures on cold restarts.
- **Solution**: 
  1. Enforce explicit text contrast (`--color: #ffffff; color: #ffffff;`) in `home.page.scss`.
  2. Add `withHashLocation()` in `main.ts` for mobile webview route resolution.
  3. Cache user profile in `localStorage` to restore session profile details cleanly on restart.
