# 01. Настройка окружения разработки

Подготовка машины для разработки мобильного приложения на React Native + Expo.

---

## 1. Системные требования

| Компонент | Минимум | Рекомендуется |
|-----------|---------|---------------|
| macOS | 13.0 (Ventura) | 15.x (Sequoia) |
| Node.js | 20 LTS | 22 LTS |
| npm/yarn | npm 10+ | bun 1.x (быстрее) |
| Xcode | 15.0 | 16.x (для iOS 18 SDK) |
| Android Studio | Hedgehog | Latest stable |
| Watchman | 4.x | Latest |
| Git | 2.x | Latest |

> **Примечание:** для разработки под обе платформы нужен macOS. Для Android-only подойдёт Linux/Windows.

---

## 2. Установка зависимостей

### 2.1 Node.js и пакетный менеджер

```bash
# Через Homebrew
brew install node@22
# Или через nvm
nvm install 22
nvm use 22

# Проверка
node -v  # v22.x.x
npm -v   # 10.x.x
```

### 2.2 Expo CLI

```bash
# Глобально (опционально, можно использовать npx)
npm install -g expo-cli@latest
npm install -g eas-cli@latest

# Проверка
npx expo --version
eas --version
```

### 2.3 Watchman (рекомендуется для macOS)

```bash
brew install watchman
watchman --version
```

---

## 3. iOS: Xcode

### 3.1 Установка

1. **App Store** → найти **Xcode** → установить (~15 GB).
2. После установки открыть Xcode и принять лицензию.
3. Установить Command Line Tools:
   ```bash
   sudo xcodebuild -license accept
   xcode-select --install
   ```

### 3.2 Симуляторы

Xcode включает симуляторы iPhone. Для установки дополнительных:

**Xcode → Settings → Platforms** → скачать нужные версии iOS.

Рекомендуемые симуляторы для тестирования:
- iPhone SE (3rd gen) — маленький экран (4.7")
- iPhone 15 — стандарт (6.1")
- iPhone 16 Pro Max — большой экран (6.9")

### 3.3 Подпись для физического устройства

- **Бесплатный Apple ID** достаточен для запуска на своём устройстве (до 3 приложений, сертификат обновляется каждые 7 дней).
- В Xcode: **Settings → Accounts** → добавить Apple ID.
- Для TestFlight и публикации потребуется **Apple Developer Program** ($99/год).

---

## 4. Android: Android Studio

### 4.1 Установка

```bash
# Через Homebrew
brew install --cask android-studio
```

Или скачать с [developer.android.com](https://developer.android.com/studio).

### 4.2 SDK и эмулятор

При первом запуске Android Studio установит Android SDK. Дополнительно убедиться:

1. **Android Studio → Settings → SDK Manager**:
   - SDK Platforms: Android 15 (API 35), Android 14 (API 34)
   - SDK Tools: Android SDK Build-Tools, Android Emulator, Android SDK Platform-Tools

2. **Переменные окружения** (добавить в `~/.zshrc` или `~/.bashrc`):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Создание эмулятора:**
   - Android Studio → Device Manager → Create Virtual Device
   - Рекомендуемые: Pixel 7 (API 34), Pixel 8 Pro (API 35)

### 4.3 Проверка

```bash
adb --version
emulator -list-avds
```

---

## 5. Создание проекта

### 5.1 Инициализация

```bash
# Из корня ninhao
npx create-expo-app apps/mobile --template tabs
```

> Проект размещается в `/apps/mobile/` рядом с web-клиентом (`/apps/client/`).

### 5.2 Первый запуск

```bash
cd apps/mobile

# iOS симулятор
npx expo run:ios

# Android эмулятор
npx expo run:android

# Expo Go (для быстрой итерации, без нативных модулей)
npx expo start
```

### 5.3 Запуск на физическом устройстве

**iOS:**
1. Подключить iPhone по USB.
2. `npx expo run:ios --device` — выбрать устройство из списка.
3. При первом запуске: на iPhone → Настройки → Основные → VPN и управление устройством → Доверять.

**Android:**
1. Включить Developer Options и USB Debugging на устройстве.
2. Подключить по USB.
3. `npx expo run:android --device`

### 5.4 Ошибка «No profiles for … were found» (iOS, устройство)

Если при `npx expo run:ios --device` появляется ошибка про отсутствие provisioning profile и предлагается передать `-allowProvisioningUpdates`: в проекте применена правка в Expo CLI — при уже настроенной подписи (DEVELOPMENT_TEAM в проекте) в вызов xcodebuild добавляются флаги `-allowProvisioningUpdates` и `-allowProvisioningDeviceRegistration`. Файл: `node_modules/expo/node_modules/@expo/cli/build/src/run/ios/XcodeBuild.js` (блок `else if (!props.isSimulator)` с `args.push(...)`). После `npm install` правку нужно применить заново или один раз собрать приложение из Xcode (открыть `ios/mobile.xcworkspace`, выбрать устройство, Run), чтобы Xcode создал профиль.

---

## 6. Установка ключевых зависимостей

```bash
cd apps/mobile

# Навигация (если не из шаблона tabs)
npx expo install expo-router react-native-screens react-native-safe-area-context

# Анимации и жесты
npx expo install react-native-reanimated react-native-gesture-handler

# Состояние и данные
npm install zustand @tanstack/react-query axios

# Хранилище
npx expo install expo-secure-store
npm install react-native-mmkv

# Изображения
npx expo install expo-image

# UI (NativeWind — Tailwind для React Native)
npm install nativewind tailwindcss

# Иконки (совместимость с web — lucide)
npm install lucide-react-native react-native-svg

# Push-уведомления
npx expo install expo-notifications expo-device expo-constants

# Биометрия
npx expo install expo-local-authentication

# Тесты
npm install -D jest @testing-library/react-native @types/jest
```

---

## 7. Конфигурация app.json

```json
{
  "expo": {
    "name": "Ninhao",
    "slug": "ninhao-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "ninhao",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.ninhao.client",
      "infoPlist": {
        "NSFaceIDUsageDescription": "Use Face ID for quick login"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.ninhao.client"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-notifications",
      "expo-local-authentication"
    ]
  }
}
```

---

## 8. Конфигурация EAS (eas.json)

```json
{
  "cli": { "version": ">= 13.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

---

## 9. Подключение к локальному бекенду

| Среда | Base URL |
|-------|----------|
| iOS симулятор | `http://localhost:8000` |
| Android эмулятор | `http://10.0.2.2:8000` |
| Физическое устройство | `http://<IP_MAC>:8000` |
| Туннель (ngrok) | `https://xxx.ngrok.io` |

---

## 10. Полезные команды

```bash
# Запуск dev-сервера
npx expo start

# Сборка для симулятора
npx expo run:ios
npx expo run:android

# Prebuild (генерация нативных проектов)
npx expo prebuild

# Очистка кешей
npx expo start --clear
watchman watch-del-all

# EAS Build (облачная сборка)
eas build --platform ios --profile development
eas build --platform android --profile development

# EAS Update (OTA)
eas update --branch preview --message "Fix: cart total calculation"
```

---

## Следующий шаг

→ [02-api-contracts.md](02-api-contracts.md) — полный справочник API эндпоинтов
