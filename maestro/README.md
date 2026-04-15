# Maestro E2E Tests

End-to-end tests for Ninhao mobile app using [Maestro](https://maestro.mobile.dev/).

## Prerequisites

1. **Backend** — Laravel API must be running with seeded data:
   ```bash
   make up
   make migrate-fresh   # or: make migrate && make seed
   ```

2. **Dev build** — Run the app (not Expo Go; MMKV and other native modules require dev build):
   ```bash
   # iOS Simulator
   npx expo run:ios

   # Android Emulator
   npx expo run:android
   ```

3. **Maestro CLI**:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

## API URL

In `__DEV__`, the app uses:
- **iOS Simulator**: `http://localhost:8000`
- **Android Emulator**: `http://10.0.2.2:8000` (host machine)

No extra config needed — ensure the backend is reachable from the simulator/emulator.

## Running Tests

```bash
# All flows
maestro test maestro/flows/

# Single flow
maestro test maestro/flows/01-home.yaml

# Smoke only (tag filter)
maestro test maestro/flows/ --tags smoke

# iOS (default if both connected)
maestro test maestro/flows/ --platform ios

# Android
maestro test maestro/flows/ --platform android
```

## Flows

| File | Description |
|------|-------------|
| `01-home.yaml` | Home screen — Search bar, New Arrivals, Popular, All |
| `02-search.yaml` | Search — tap search, type query, verify input |
| `03-product-detail.yaml` | Product — tap product, Add to Cart, toast |
| `04-cart.yaml` | Cart tab — verify Cart screen |
| `05-smoke.yaml` | Full smoke — runs 01→02→03→04 |

## testID Usage

Key components have `testID` for stable selectors:
- `search-bar` — Home search bar
- `search-input` — Search screen input
- `product-card` — Product cards
- `add-to-cart` — Add to Cart button
