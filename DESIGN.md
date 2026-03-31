# Metra Wealth — Design Language

This document describes the visual and interaction design system used across the application. All design tokens are defined in [app/globals.css](app/globals.css) and extended in [tailwind.config.js](tailwind.config.js).

---

## Design Philosophy

Metra Wealth uses a **clean, trustworthy, and calm** visual language. Financial tools should feel reliable and legible — not flashy. The palette is built around deep teal and green tones that communicate stability and growth without being aggressive. Generous whitespace, consistent spacing, and subtle motion keep the interface approachable.

---

## Color System

Colors are defined as CSS custom properties using raw RGB channel values so they can be composed with Tailwind's opacity utilities (e.g., `bg-[rgb(var(--mw-accent)/0.1)]`).

### Light Mode

| Token | RGB Value | Role |
|---|---|---|
| `--mw-bg` | `255 255 255` | Page background |
| `--mw-surface` | `255 255 255` | Card and panel background |
| `--mw-soft` | `244 251 250` | Subtle hover backgrounds, section fills |
| `--mw-primary` | `11 79 90` | Primary text, headings, icon fills |
| `--mw-light` | `42 106 115` | Secondary text, subdued labels |
| `--mw-accent` | `56 198 179` | Interactive elements — buttons, links, focus rings, badges |
| `--mw-border` | `215 238 238` | Card borders, dividers |
| `--mw-body` | `74 101 105` | Body copy, paragraph text |
| `--mw-dark` | `11 42 47` | Darkest text, strong headings |
| `--mw-danger` | `185 28 28` | Error messages, delete actions |
| `--mw-success` | `22 101 52` | Confirmation messages, success states |

### Dark Mode

Dark mode overrides shift background layers to desaturated blue-grays and lighten text colors for contrast. The accent color (`--mw-accent`) remains the same bright teal in both modes so interactive elements are always visually consistent.

| Token | Dark Value | Effect |
|---|---|---|
| `--mw-bg` | `10 20 22` | Near-black page background |
| `--mw-surface` | `15 30 34` | Slightly lighter card background |
| `--mw-soft` | `18 38 42` | Hover/subtle fill |
| `--mw-primary` | `200 235 235` | Light teal text |
| `--mw-light` | `150 200 205` | Subdued light teal |
| `--mw-border` | `30 60 68` | Dark border lines |
| `--mw-body` | `160 195 200` | Body text |
| `--mw-dark` | `230 245 245` | Highest contrast text |

Dark mode is toggled by adding/removing the `dark` class on `<html>`. The preference is persisted to `localStorage` and restored via an inline script before React hydrates, preventing a flash of the wrong theme.

---

## Typography

**Font Family:** [DM Sans](https://fonts.google.com/specimen/DM+Sans) — a low-contrast geometric sans-serif chosen for its high legibility at small sizes and clean appearance at large display sizes.

**Weights loaded:** 300, 400, 500, 600, 700, 800

**CSS variable:** `--font-dm-sans` (applied to `<html>` via `className` in the root layout)

### Scale

| Usage | Tailwind Class | Approx Size |
|---|---|---|
| Page title / hero | `text-4xl` – `text-5xl` | 36–48px |
| Section heading | `text-2xl` – `text-3xl` | 24–30px |
| Card heading | `text-lg` – `text-xl` | 18–20px |
| Body copy | `text-sm` – `text-base` | 14–16px |
| Labels / captions | `text-xs` – `text-sm` | 12–14px |

### Weight conventions

- `font-extrabold` (`800`) — hero headlines, primary page titles
- `font-bold` (`700`) — card headings, stat values
- `font-semibold` (`600`) — buttons, section labels, form labels
- `font-medium` (`500`) — nav links, secondary labels
- `font-normal` (`400`) — body copy, inputs
- `font-light` (`300`) — decorative subheadlines

### Section labels

A `.mw-section-label` utility class creates a consistent treatment for section identifiers: uppercase, wide letter-spacing, small font size, and the accent color. Example: "FOR INDIVIDUALS", "HOW IT WORKS".

```css
.mw-section-label {
  @apply text-xs font-semibold uppercase tracking-widest text-[rgb(var(--mw-accent))];
}
```

---

## Spacing

Tailwind's default 4px base unit is used throughout. Key conventions:

- **Component padding:** `p-4` (16px) on mobile, `p-6`–`p-8` (24–32px) on desktop cards
- **Section vertical rhythm:** `py-16`–`py-24` (64–96px) between landing page sections
- **Stack gaps:** `gap-2`–`gap-4` (8–16px) for inline elements; `gap-6`–`gap-8` (24–32px) for card grids
- **Form fields:** `gap-4`–`gap-6` between labeled inputs

---

## Layout

### Container

The `.mw-shell` class creates the primary content container:

```css
.mw-shell {
  @apply mx-auto max-w-6xl px-4 sm:px-6;
}
```

This limits content to 72rem (1152px) and adds horizontal padding that expands at larger viewports.

### Grid patterns

- **Stat cards:** 3-column grid on `sm+`, stacked on mobile (`grid-cols-1 sm:grid-cols-3`)
- **Feature cards:** 3-column on `md+`, single column on mobile
- **Pricing tiers:** 2-column on `lg+`, stacked below

### Page headers

The `.mw-page-header` class creates a flex row with title left and action buttons right, wrapping to stacked on narrow viewports:

```css
.mw-page-header {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4;
}
```

---

## Component Classes

Custom component classes are defined in `app/globals.css` using Tailwind's `@apply` directive. This keeps component styles consistent without requiring a component framework.

### Cards

```css
.mw-card {
  @apply rounded-xl border border-[rgb(var(--mw-border))]
         bg-[rgb(var(--mw-surface))] p-6 shadow-sm
         transition-shadow hover:shadow-md;
}
```

Cards have:
- `rounded-xl` — 12px radius, which is soft but not circular
- A 1px border in the `--mw-border` color
- A subtle `shadow-sm` that deepens to `shadow-md` on hover
- Smooth `transition-shadow` so the hover effect is not jarring

### Stat cards

```css
.mw-stat-card {
  @apply mw-card border-l-4 border-l-[rgb(var(--mw-accent))];
}
```

Stat cards add a 4px left accent border in the teal color. This creates a clear visual hierarchy — these cards carry the most important numbers on the page.

### Buttons

**Primary button:**
```css
.mw-btn-primary {
  @apply inline-flex items-center gap-2 rounded-lg
         bg-gradient-to-r from-[rgb(var(--mw-accent))] to-[rgb(var(--mw-primary))]
         px-5 py-2.5 text-sm font-semibold text-white shadow-sm
         transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0;
}
```

The gradient runs from bright teal to dark teal. The `hover:-translate-y-0.5` lift (2px) gives tactile feedback without being excessive.

**Ghost button:**
```css
.mw-btn-ghost {
  @apply inline-flex items-center gap-2 rounded-lg
         border border-[rgb(var(--mw-border))]
         bg-[rgb(var(--mw-soft))] px-5 py-2.5 text-sm font-semibold
         text-[rgb(var(--mw-primary))] transition-all
         hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0;
}
```

Ghost buttons use the soft background and border. They pair with primary buttons as secondary actions.

**Danger button:**
```css
.mw-btn-danger {
  @apply inline-flex items-center gap-2 rounded-lg
         border border-red-200 bg-red-50 px-5 py-2.5
         text-sm font-semibold text-red-700
         transition-all hover:bg-red-100 dark:border-red-900
         dark:bg-red-950 dark:text-red-400;
}
```

Danger buttons are red-tinted but not filled — this makes them feel serious without being alarming. Used only for destructive actions (delete).

### Form inputs

```css
.mw-input {
  @apply w-full rounded-lg border border-[rgb(var(--mw-border))]
         bg-[rgb(var(--mw-surface))] px-3 py-2 text-sm
         text-[rgb(var(--mw-primary))]
         placeholder:text-[rgb(var(--mw-body)/0.5)]
         focus:outline-none focus:ring-2 focus:ring-[rgb(var(--mw-accent)/0.4)];
}
```

Inputs show a teal focus ring at 40% opacity — visible but not distracting. Placeholders are at 50% body color opacity.

### Badges

```css
.mw-badge         { @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium; }
.mw-badge-income  { @apply mw-badge bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400; }
.mw-badge-expense { @apply mw-badge bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400; }
.mw-badge-pro     { @apply mw-badge bg-[rgb(var(--mw-accent)/0.15)] text-[rgb(var(--mw-accent))]; }
```

Badges use semantic color: green for income, red for expenses, teal for Pro tier. Dark mode variants keep the same hue but shift to darker backgrounds with lighter text for contrast.

---

## Motion & Animation

### Library

[Motion.js](https://motion.dev/) (from the Framer Motion ecosystem) is used for component-level animations on the landing page. It provides declarative viewport-triggered animations with smooth spring physics.

### Motion components

`components/motion/` provides three reusable wrappers:

- **`FadeIn`** — wraps a single child, fades it in when it enters the viewport
- **`StaggerChildren`** — wraps a list, staggers children's animations with a configurable delay between each
- **`Counter`** — animates a number counting up from 0 to a target value on mount

### CSS Keyframes

Four custom keyframes are defined in `globals.css` for ambient and decorative animations:

| Animation | Duration | Usage |
|---|---|---|
| `marquee` | 30s loop | Ticker strip on landing page — horizontal scroll |
| `shimmer` | — | Loading skeleton shimmer effect |
| `float` | 6s loop | Floating illustration in hero section |
| `float-slow` | 8s loop | Slower orb decorations in hero |
| `glow-pulse` | 4s loop | Opacity + scale pulse on decorative orbs |

Utility classes: `.animate-marquee`, `.animate-shimmer`, `.animate-float`, `.animate-glow-pulse`

### Interaction transitions

All interactive elements use `transition-all` with default Tailwind duration (150ms). Hover states use:
- **Cards:** `shadow-sm` → `shadow-md`
- **Primary and ghost buttons:** `translateY(0)` → `translateY(-2px)` + shadow
- **Links and nav items:** color shift to accent

Active (press) states use `active:translate-y-0` to snap back, giving a physical click feel.

---

## Iconography

Icons are rendered inline as SVG elements directly in JSX — no icon library is used. This keeps the bundle small and ensures icons match the surrounding text color via `currentColor`.

Common icon patterns:
- Heroic outline style (2px stroke, 24×24 viewport)
- `stroke="currentColor"` so they inherit text color automatically
- `strokeLinecap="round" strokeLinejoin="round"` for soft joins

---

## Imagery & Decoration

### Decorative orbs

The hero section and auth pages use blurred circular gradients as background decoration:

```jsx
<div className="absolute w-96 h-96 rounded-full bg-[rgb(var(--mw-accent)/0.15)] blur-3xl animate-glow-pulse" />
```

These provide depth without requiring image assets. The `blur-3xl` filter creates a soft, out-of-focus look.

### Avatar / initials fallback

When a user has no profile photo, their initials are displayed in a circular div with the accent color background:

```jsx
<div className="w-10 h-10 rounded-full bg-[rgb(var(--mw-accent))] flex items-center justify-center text-white font-bold">
  {initials}
</div>
```

### Social proof avatars

The landing page uses stacked placeholder circles (`-ml-3` negative margin) to create an overlapping avatar cluster, suggesting a community of users.

---

## Responsive Behavior

The application is mobile-first. All components default to a stacked, single-column layout and expand at breakpoints:

| Breakpoint | Value | Layout changes |
|---|---|---|
| Default (mobile) | < 640px | Single column, hamburger nav, scrollable tables |
| `sm` | 640px+ | Multi-column stat grids, wider form max-width |
| `lg` | 1024px+ | Full pricing comparison table, side-by-side auth layout |

### Navigation

- **Mobile:** Hamburger icon reveals a full-width dropdown with links and auth buttons stacked vertically
- **Desktop:** Inline horizontal nav bar with all links visible

### Tables

The ledger table uses `overflow-x-auto` on mobile so users can scroll horizontally rather than seeing a broken layout.

---

## Dark Mode Implementation

1. `app/layout.tsx` contains an inline `<script>` that reads `localStorage.getItem("theme")` and adds the `dark` class to `<html>` before React hydrates. This is the standard pattern to avoid a white flash on dark-mode users.

2. All color tokens have dark-mode overrides in `:root.dark` in `globals.css`.

3. Tailwind's `darkMode: "class"` config enables `dark:` prefixed utilities.

4. Semantic color badges (income green, expense red) have explicit `dark:` variants to ensure they remain legible on dark backgrounds.

---

## Design Patterns & Conventions

### Hierarchy within pages

Each page follows a consistent visual hierarchy:
1. **Section label** (small uppercase, accent color) — sets context
2. **Title** (2xl–4xl, font-extrabold) — primary message
3. **Subtitle / description** (base, body color) — supporting detail
4. **Actions** (buttons) — what to do next

### Empty states

When a list has no data (e.g., no transactions), a centered block with a descriptive message and a primary CTA button is shown. This guides the user to take the first action rather than presenting a blank screen.

### Loading states

Skeleton screens (animated shimmer divs) are shown while auth state resolves or data loads. This prevents layout shift and gives the user confidence that content is coming.

### Error states

Form errors appear as small red text below the relevant input. Global errors (e.g., failed login) appear as a red-tinted alert box above the form. Error colors use `--mw-danger` / standard Tailwind `red-*` tokens.

### Dividers

`.mw-divider` renders a 1px horizontal line in `--mw-border` color. Used to separate sections within cards or between content blocks, never between unrelated page sections.
