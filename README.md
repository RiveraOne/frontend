# Metra Wealth — Frontend Documentation

A personal finance tracking web application built with Next.js 15, Firebase, and Tailwind CSS. Users can record income and expenses, view analytics, and consult an AI financial advisor.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 + custom component classes |
| Animations | Motion.js v12 |
| Auth & DB | Firebase 12 (Auth, Firestore, Storage) |
| State | React Context API + local component state |
| Font | DM Sans (Google Fonts) |

---

## Project Structure

```
app/                      # Next.js App Router pages
  layout.tsx              # Root layout — font, theme script, footer, AuthProvider
  page.tsx                # Landing page
  navbar.tsx              # Global navigation bar
  theme-toggle.tsx        # Dark/light mode toggle button
  login/                  # Email + Google sign-in
  register/               # Account creation
  forgot-password/        # Password reset flow
  dashboard/              # Authenticated home — stats + recent transactions
  ledger/                 # Transaction log
    page.tsx              # Ledger list with month filter
    new/page.tsx          # Add transaction form
    [id]/page.tsx         # Transaction detail view
  advisor/                # AI financial advisor chat
  settings/               # User account settings
  pricing/                # Public pricing page
  privacy/                # Privacy policy
  terms/                  # Terms of service
  not-found.tsx           # 404 page

components/
  landing/                # Landing page section components
    hero-section.tsx
    features-section.tsx
    faq-section.tsx
    ticker-marquee.tsx
    pricing-preview.tsx
    social-proof.tsx
    cta-section.tsx
    how-it-works.tsx
  motion/                 # Reusable animation wrappers
    fade-in.tsx
    stagger-children.tsx
    counter.tsx

contexts/
  AuthContext.tsx         # Firebase auth state, useAuth() hook

lib/
  firebase/
    config.ts             # Firebase app initialization
    auth.ts               # Auth helper functions
    firestore.ts          # Firestore CRUD + real-time listeners
    storage.ts            # Firebase Storage setup
    index.ts              # Barrel exports
  mock-data.ts            # Static mock transactions and user
```

---

## Environment Setup

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

All variables are prefixed with `NEXT_PUBLIC_` so they are available in client-side code.

---

## Running the Project

```bash
npm install
npm run dev        # Development server at localhost:3000
npm run build      # Production build
npm run start      # Serve production build
npm run lint       # ESLint
```

---

## Features

### Authentication

**Implementation:** Firebase Authentication with email/password and Google OAuth.

**Files:** [lib/firebase/auth.ts](lib/firebase/auth.ts), [contexts/AuthContext.tsx](contexts/AuthContext.tsx), [app/login/](app/login/), [app/register/](app/register/), [app/forgot-password/](app/forgot-password/)

**How it works:**
- `AuthContext` wraps the entire app in `app/layout.tsx` and subscribes to `onAuthStateChanged` from Firebase
- The `useAuth()` hook exposes `{ user, loading }` to any component
- On initial load, a `loading` state prevents route flickers before Firebase resolves the session
- Auth helper functions in `lib/firebase/auth.ts`:
  - `registerWithEmail(name, email, password)` — creates account and sets `displayName`
  - `loginWithEmail(email, password)` — standard sign-in
  - `loginWithGoogle()` — OAuth popup flow, Firebase handles token exchange
  - `resetPassword(email)` — sends Firebase password-reset email
  - `logout()` — signs out and clears session

**Sign-in / Register UI:** Two-panel layout on desktop. Right panel contains the form; left panel is a decorative gradient with animated orbs and app branding. Both forms show validation errors and loading states. Google OAuth button triggers a popup.

**Password Reset:** User enters their email on `/forgot-password`. Firebase sends a reset link. No server-side code required.

---

### Dashboard

**Route:** `/dashboard`

**Implementation:** Client component. Reads all transactions from Firestore via a real-time listener and computes summary statistics locally.

**Files:** [app/dashboard/](app/dashboard/)

**What it shows:**
- Personalized welcome using `user.displayName`
- Three stat cards: **Total Income**, **Total Expenses**, **Remaining Balance** (income minus expenses)
- A budget utilization progress bar showing expenses as a percentage of income
- Three quick action buttons linking to Ledger, Advisor, and Settings
- A "Recent Transactions" list showing the five most recent entries, each linking to its detail page

**Data flow:** Transactions are fetched via `subscribeToTransactions(userId, callback)` from Firestore. The component filters and sums them locally for the stat calculations.

---

### Ledger (Transaction Log)

**Routes:** `/ledger`, `/ledger/new`, `/ledger/[id]`

**Implementation:** Real-time Firestore listener drives the list. Month filtering is applied client-side. Each row navigates to the detail page.

**Files:** [app/ledger/](app/ledger/)

**Ledger list (`/ledger`):**
- Header with total Income, Expenses, and Balance for the selected month
- Month filter dropdown — selecting a month filters the displayed rows
- Transaction table with columns: Date, Category, Type (badge), Amount
- Clicking a row navigates to `/ledger/[id]`
- Empty state shown when no transactions exist for the selected filter

**Add transaction (`/ledger/new`):**
- Toggle between Income and Expense type
- Amount input field with `$` prefix
- Date picker (defaults to today)
- Category text input with quick-pick shortcut tags (e.g., Groceries, Salary)
- Optional notes textarea
- Optional receipt image upload (local preview; Firebase Storage upload not yet wired)
- On submit, calls `addTransaction(userId, data)` which writes to `users/{userId}/transactions` in Firestore
- Redirects to `/ledger` on success

**Transaction detail (`/ledger/[id]`):**
- Fetches the single transaction with `getTransaction(userId, id)`
- Displays the amount prominently with an income/expense badge
- Shows all metadata: transaction ID, date, category, type, amount
- Notes section rendered if present
- Two contextual stats computed from all user transactions:
  - **Category total** — sum of all transactions in the same category
  - **Share of month** — what percentage this transaction is of that month's total spend
- Related transactions list — other transactions in the same category, each clickable
- Actions: "Add similar" pre-fills the new form, "Delete" calls `deleteTransaction` and redirects

---

### AI Advisor

**Route:** `/advisor`

**Implementation:** Client-side chat UI with mock response logic. No live AI API integration — responses are generated from keyword matching.

**Files:** [app/advisor/](app/advisor/)

**How it works:**
- Chat messages stored in local React state as an array of `{ role, content }` objects
- A usage counter (also local state) limits users to 5 free queries per session
- On message send, the component matches the input against keyword patterns and returns a hardcoded financial response
- A typing indicator animates while the "response" is being generated (simulated delay)
- Suggestion chip buttons are shown before the first message to guide first-time users
- When the daily limit is reached, the input is disabled and an upgrade prompt is shown

**Planned behavior:** The `receiptUrl` field in the Transaction type and the usage badge UI are designed for a real AI backend with per-user rate limiting.

---

### Settings

**Route:** `/settings`

**Implementation:** Reads from `useAuth()` and `mockUser`. Profile edits call Firebase `updateProfile`.

**Files:** [app/settings/](app/settings/)

**Sections:**
- **Profile** — avatar with initials fallback, display name (editable inline), email address, subscription badge
- **Edit name** — inline form that calls Firebase `updateProfile` to persist the change
- **Password reset** — button that sends a reset email via `resetPassword(user.email)`
- **Account info** — displays email and subscription tier
- **Sign out** — calls `logout()` and redirects to home
- **Upgrade CTA** — shown to free-tier users, links to `/pricing`

---

### Landing Page

**Route:** `/`

**Implementation:** Composed of individual section components, each animated with Motion.js.

**Files:** [app/page.tsx](app/page.tsx), [components/landing/](components/landing/)

**Sections in order:**
1. **Hero** (`hero-section.tsx`) — headline, subheadline, CTA buttons, floating illustration, animated orbs
2. **Ticker Marquee** (`ticker-marquee.tsx`) — horizontally scrolling text strip using CSS `@keyframes marquee`
3. **Features** (`features-section.tsx`) — three-column grid: Live Money, Pre-Spend Clarity, Simple System
4. **Social Proof** (`social-proof.tsx`) — avatar stack + user count
5. **How It Works** (`how-it-works.tsx`) — numbered step list
6. **Pricing Preview** (`pricing-preview.tsx`) — teaser cards linking to `/pricing`
7. **FAQ** (`faq-section.tsx`) — card-based accordion questions
8. **CTA** (`cta-section.tsx`) — final conversion section with sign-up button

**Animation approach:** `FadeIn` and `StaggerChildren` wrapper components from `components/motion/` apply Motion.js `viewport` animations so sections animate in as the user scrolls.

---

### Pricing Page

**Route:** `/pricing`

**Files:** [app/pricing/](app/pricing/)

**What it shows:**
- Two plan cards side by side: **Essential** ($4.99/mo) and **Pro** ($9.99/mo)
- Feature lists with checkmark icons
- Full feature comparison table on desktop; stacked cards on mobile
- CTA footer

**Note:** No payment processor is integrated. The pricing page is informational only.

---

### Navigation

**Implementation:** Single `Navbar` component rendered in the root layout.

**Files:** [app/navbar.tsx](app/navbar.tsx)

**Behavior:**
- Sticky top bar (`position: sticky`, `z-30`)
- Desktop: horizontal link list — Home, Pricing, Dashboard, Advisor
- Mobile: hamburger icon toggles a dropdown menu
- Theme toggle button (sun/moon icons swap on click)
- Auth state-aware:
  - Unauthenticated: Login and Get Started buttons
  - Authenticated: user avatar/initials with a dropdown showing Settings and Sign Out

---

### Dark Mode

**Implementation:** Class-based dark mode using Tailwind's `dark:` prefix. State persists in `localStorage`.

**Files:** [app/theme-toggle.tsx](app/theme-toggle.tsx), [app/layout.tsx](app/layout.tsx)

**How it works:**
- An inline `<script>` tag in `layout.tsx` runs before React hydrates to read `localStorage` and apply the `dark` class to `<html>`. This prevents a flash of the wrong theme.
- `ThemeToggle` reads the current class, toggles it on click, and saves the preference to `localStorage`.
- All color tokens are defined as CSS custom properties with `dark` variants in `globals.css`.

---

## Data Model

### Transaction

```typescript
type Transaction = {
  id: string;
  date: string;          // "YYYY-MM-DD"
  type: "Income" | "Expense";
  amount: number;        // Dollar amount
  category: string;      // e.g. "Groceries", "Salary"
  notes?: string;
  receiptUrl?: string;   // Planned — not yet wired to Storage
  createdAt: Timestamp;  // Firestore server timestamp
};
```

Stored in Firestore at path: `users/{userId}/transactions/{transactionId}`

Transactions are ordered by `date` descending via a Firestore `orderBy` query inside `subscribeToTransactions`.

### Firebase User

Standard Firebase `User` object:

```typescript
{
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
```

No separate Firestore user document exists yet. Subscription status is currently hardcoded in the settings mock.

---

## Firebase Services Used

| Service | Purpose |
|---|---|
| Authentication | Email/password and Google OAuth sign-in |
| Firestore | NoSQL transaction storage with real-time listeners |
| Storage | Initialized — receipt upload planned but not wired |

---

## Responsive Design

Mobile-first using Tailwind breakpoints:

- **Mobile (<640px):** Stacked layouts, hamburger nav, scrollable ledger table
- **Tablet+ (sm: 640px):** Multi-column stat cards, expanded forms
- **Desktop (lg: 1024px):** Full comparison table on pricing, side-by-side auth layout

---

## Known Incomplete Features

| Feature | Status |
|---|---|
| Receipt image upload to Firebase Storage | UI exists, upload not wired |
| Subscription enforcement | UI shows tiers, no backend check |
| AI Advisor real responses | Mock keyword matching, no API |
| Payment processing | Pricing page only, no Stripe |
| Per-user Firestore security rules | Must be configured in Firebase Console |
| User profile photo upload | Google OAuth photo displays, no custom upload |
| Daily AI query limit | Client-side only, resets on page refresh |
