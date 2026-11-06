# 📸 SpendSnap — Smart Mobile Expense & Receipt Tracker

> **SpendSnap** is a high-speed, offline-first mobile expense tracking application built with **React Native**, **Expo SDK 58**, and **TypeScript**. It features smart receipt OCR scanning, interactive visual financial analytics, multi-wallet balance management, subscription tracking, and instant PDF/CSV report generation.

---

## ✨ Features

### 1. 🌟 Core Expense & Income Management
- **Instant Logging:** Log Expenses, Income, and Transfers with amounts, categories, accounts, dates, notes, and tags.
- **Preloaded Categories:** Food & Dining, Groceries, Shopping, Transport, Housing, Bills, Entertainment, Health, Subscriptions, Salary, Freelance, and more.
- **Account Filtering:** Filter expenses across individual wallets or view unified net worth.

### 2. 📸 SpendSnap AI Receipt OCR ("Snap to Track")
- **Camera & Photo Library Scanning:** Snap a picture of a bill/invoice or choose from your gallery.
- **Intelligent Field Extraction:** Automatically extracts Merchant Name, Date, Total Amount, Tax, and itemized line items.
- **One-Tap Commit:** Validates extracted receipts and auto-categorizes with a single tap.

### 3. 🎯 Budgets, Goals & Subscriptions
- **Category Spending Caps:** Set monthly budgets per category with real-time percentage indicators.
- **Visual Alert States:** Progress bars shift from green to amber at 80% and rose-red with warning badges when over budget.
- **Active Subscription Manager:** Track monthly recurring burn rates (Netflix, Spotify, Gym, Rent).
- **Savings Goals (Piggy Banks):** Create milestone targets (Emergency Fund, Vacations, Tech) with one-tap quick-deposit buttons (`+$50`, `+$100`).

### 4. 📊 Visual Analytics & Insights
- **Category Donut Chart:** Dynamic SVG donut chart with interactive legends and percentage distributions.
- **Monthly Cash Flow Trend:** Comparative bar charts measuring inflow vs. outflow velocity.
- **AI Financial Advisor:** Contextual spending advice and savings estimations based on spending patterns.
- **Timeframe Filters:** Toggle between *This Month*, *Last 30 Days*, *This Year*, or *All Time*.

### 5. 💳 Multi-Wallet & Account Balances
- **Multiple Accounts:** Cash Wallet, Checking Accounts, Credit Cards, and High-Yield Savings.
- **Inter-Account Transfers:** Transfer balances between accounts with automatic transaction logging without skewing income/expense metrics.

### 6. 🔒 Privacy, Persistence & Data Export
- **100% Offline-First:** Backed by local `AsyncStorage` and fast in-memory reactive Zustand store. Zero cloud latency and total privacy.
- **Spreadsheet Export:** Download or share complete transaction history as **CSV**.
- **Formatted PDF Statements:** Generate clean, formatted PDF activity statements with summary cards and itemized tables.
- **Light & Dark Mode:** Toggle seamlessly between dark and light themes.

---

## 🛠️ Tech Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 58) & [React Native](https://reactnative.dev/) (0.88)
- **Language:** TypeScript 5.9+
- **State & Local Persistence:** [Zustand](https://github.com/pmndrs/zustand) + `@react-native-async-storage/async-storage`
- **Vector Icons:** [lucide-react-native](https://lucide.dev/)
- **Charts & Graphics:** `react-native-svg`
- **Camera & Media:** `expo-image-picker`
- **Haptics & Sharing:** `expo-haptics`, `expo-print`, `expo-sharing`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

### 3. Running the App
- **On Physical Phone (iOS / Android):**
  1. Install the free **Expo Go** app from the App Store or Google Play Store.
  2. Scan the QR code shown in your terminal with your camera (iOS) or inside the Expo Go app (Android).
- **In Web Browser:**
  Press `w` in the terminal, or run:
  ```bash
  npm run web
  ```
- **In Android Emulator:**
  Press `a` in the terminal.
- **In iOS Simulator:**
  Press `i` in the terminal (macOS required).

---

## 🧪 Verification & Health Checks

Run dependency verification:
```bash
npx expo-doctor
```

Run TypeScript type check:
```bash
npx tsc --noEmit
```

---

## 📁 Project Structure

```
SpendSnap/
├── assets/                 # App icons, splash screens, and images
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Charts/         # DonutChart & BarChart (SVG-based)
│   │   ├── AddTransactionModal.tsx
│   │   ├── CategoryIcon.tsx
│   │   ├── Header.tsx
│   │   ├── NavigationTabBar.tsx
│   │   ├── ReceiptScanModal.tsx
│   │   ├── SummaryCard.tsx
│   │   └── TransactionCard.tsx
│   ├── constants/          # Theme tokens, categories, currencies, sample data
│   │   ├── categories.ts
│   │   ├── currencies.ts
│   │   ├── sampleData.ts
│   │   └── theme.ts
│   ├── screens/            # Application screens
│   │   ├── AnalyticsScreen.tsx
│   │   ├── BudgetsScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── WalletsScreen.tsx
│   ├── services/           # OCR parsing and export (CSV/PDF)
│   │   ├── exportService.ts
│   │   └── ocrService.ts
│   ├── store/              # Zustand persistent store
│   │   └── useExpenseStore.ts
│   └── types/              # TypeScript interfaces and models
│       └── index.ts
├── App.tsx                 # Root application container & tab coordinator
├── app.json                # Expo project configuration
└── package.json
```

