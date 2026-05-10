# E2E (Playwright)

These specs run against a real Next.js dev server, the Firebase emulator, and Stripe test mode.

## One-time setup

```bash
npx playwright install chromium
```

## Running locally

You need three things up at the same time:

1. **Firebase emulator** (Auth + Firestore):
   ```bash
   firebase emulators:start --only auth,firestore --project metrawealth-test
   ```

2. **Next.js dev server with emulator env**:
   ```bash
   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
   FIRESTORE_EMULATOR_HOST=localhost:8080 \
   STRIPE_SECRET_KEY=sk_test_... \
   STRIPE_PRICE_ESSENTIAL=price_test_... \
   STRIPE_PRICE_PRO=price_test_... \
   npm run dev
   ```

3. **Playwright**:
   ```bash
   npm run test:e2e
   ```

## Notes

- These specs create and tear down their own users.
- Stripe checkout flows use the test card `4242 4242 4242 4242`.
- The advisor spec mocks the OpenAI call at the API-route layer — see [stubs.ts](./stubs.ts) (todo).
