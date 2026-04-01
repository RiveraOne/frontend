# Metra Wealth AI Implementation Notes

This document summarizes every AI-related detail currently present in the codebase and README, then proposes a concrete implementation plan for replacing the mock advisor with a real AI system.

## Current AI State

The app already presents AI as a product feature, but the current implementation is only a frontend mock.

### What exists today

- Route: `/advisor`
- Main file: `app/advisor/page.tsx`
- Current behavior:
  - Chat UI runs entirely on the client
  - Messages are stored in local React state
  - Assistant replies come from `getMockResponse(input)`
  - Response generation is simple keyword matching
  - Typing is simulated with `setTimeout(..., 800)`
  - Free usage is tracked only in component state with `MAX_FREE = 5`
  - Usage resets on refresh because nothing is persisted

### Current advisor prompts and UX

The advisor currently suggests these starter prompts:

- `Can I afford a $300 purchase?`
- `How should I start saving?`
- `How do I pay off debt faster?`
- `Where should I cut expenses?`

The page copy describes it as:

- `Financial Advisor`
- `Ask money questions and get instant guidance.`
- `Upgrade to Pro for unlimited AI advisor access.`

### Current mock response logic

`app/advisor/page.tsx` uses basic keyword rules:

- If input includes `afford`, it returns affordability guidance
- If input includes `save` or `saving`, it returns savings guidance
- If input includes `debt`, it returns debt-payoff guidance
- Otherwise it returns a generic spending-pattern answer

This means there is currently:

- No real model call
- No API route
- No backend validation
- No grounding from user transaction data
- No persistence of conversations
- No real rate limiting

## AI-Related Information Already Present Elsewhere

### README statements

The top-level [README.md](/Users/admin/Desktop/Codes/riveraone%202/metrawealth/codes/frontend/README.md) says:

- The AI advisor is a client-side chat UI with mock response logic
- There is no live AI API integration
- The daily/free usage limit is local only
- `receiptUrl` is planned for future AI-related behavior
- Real AI responses are listed under incomplete features

### Pricing and product positioning

AI is already used in product and pricing language in multiple places:

- [app/pricing/page.tsx](/Users/admin/Desktop/Codes/riveraone%202/metrawealth/codes/frontend/app/pricing/page.tsx)
  - `Purchase Checks (Limited)`
  - `Unlimited Purchase Checks`
  - `Priority AI Performance`
  - `Investment Insights`
  - `Custom Assistant Tone`
- [app/register/page.tsx](/Users/admin/Desktop/Codes/riveraone%202/metrawealth/codes/frontend/app/register/page.tsx)
  - `AI advisor (5 queries/day)`
- [app/settings/page.tsx](/Users/admin/Desktop/Codes/riveraone%202/metrawealth/codes/frontend/app/settings/page.tsx)
  - Free vs Pro UI exists, but entitlement is currently hardcoded

This matters because the AI backend should eventually support:

- free-tier query limits
- pro-tier unlimited or higher limits
- tier-aware responses or features

### Legal and privacy constraints already present

- [app/terms/page.tsx](/Users/admin/Desktop/Codes/riveraone%202/metrawealth/codes/frontend/app/terms/page.tsx)
  - states the AI advisor is not financial, legal, tax, or investment advice
- [app/privacy/page.tsx](/Users/admin/Desktop/Codes/riveraone%202/metrawealth/codes/frontend/app/privacy/page.tsx)
  - states user queries may be processed to generate responses
  - states personal financial data should not be used to train models without explicit consent

Any real AI implementation should preserve and reinforce those constraints.

## Data Available to Power AI

### Authentication

User identity is available through [contexts/AuthContext.tsx](/Users/admin/Desktop/Codes/riveraone%202/metrawealth/codes/frontend/contexts/AuthContext.tsx).

The app already exposes:

- `user.uid`
- `user.email`
- `user.displayName`
- `loading`

This is enough to authorize AI requests and scope them to the signed-in user.

### Transaction data

The transaction model is defined in [lib/firebase/firestore.ts](/Users/admin/Desktop/Codes/riveraone%202/metrawealth/codes/frontend/lib/firebase/firestore.ts):

- `id`
- `date`
- `type`
- `amount`
- `category`
- `notes?`
- `receiptUrl?`
- `createdAt`

Transactions are stored at:

- `users/{userId}/transactions/{transactionId}`

The app already has a realtime subscription helper:

- `subscribeToTransactions(userId, callback)`

This gives the AI system a usable source of structured financial context without needing a new core data model for v1.

### Receipt support

Receipt handling is only partially built:

- [app/ledger/new/page.tsx](/Users/admin/Desktop/Codes/riveraone%202/metrawealth/codes/frontend/app/ledger/new/page.tsx)
  - file picker and local preview exist
  - upload is not wired
- [lib/firebase/storage.ts](/Users/admin/Desktop/Codes/riveraone%202/metrawealth/codes/frontend/lib/firebase/storage.ts)
  - Firebase Storage is initialized
  - helper functions do not exist yet

This is relevant because later AI versions could analyze receipts, but that should be treated as phase 2 or later.

## Gaps Blocking Real AI

The current codebase is missing the backend pieces required for production AI:

- no server-side API route for model calls
- no model provider SDK installed
- no server-side auth verification for AI requests
- no persistent chat history
- no usage tracking in Firestore
- no subscription or entitlement document
- no moderation/safety handling
- no structured prompt-building from transaction history
- no streaming response pipeline

There is also a product mismatch today:

- pricing and registration copy promise AI capability
- actual implementation is only a mock and resets on refresh

## Recommended Implementation Approach

The best fit for this project is to keep the existing `/advisor` page, but move response generation to a server route and ground responses with user transaction data from Firebase.

### Recommended v1 scope

Build a real AI advisor that can:

- answer budgeting questions
- answer affordability questions
- summarize recent spending patterns
- give category-based suggestions
- respect free/pro usage limits
- return a clear disclaimer that it is not financial advice

Do not include in v1:

- receipt image analysis
- investment recommendation tooling
- bank account integrations
- long-term memory across many chats
- fully customizable advisor personas

## Proposed Architecture

### 1. Frontend chat stays in `app/advisor/page.tsx`

Replace the mock `getMockResponse()` flow with a fetch call to a server endpoint, for example:

- `POST /api/ai/advisor`

Frontend responsibilities:

- collect the user message
- render loading state
- render assistant reply
- display quota/limit state returned by the server
- keep optimistic UI simple

### 2. Add a server route for AI

Create a route handler such as:

- `app/api/ai/advisor/route.ts`

Server responsibilities:

- verify the user is authenticated
- load relevant financial context for that user
- enforce rate limits
- build the prompt
- call the model provider
- return the assistant reply
- optionally store the exchange

### 3. Store AI usage and optionally chat history in Firestore

Suggested Firestore paths:

- `users/{userId}/meta/subscription`
- `users/{userId}/aiUsage/{YYYY-MM-DD}`
- `users/{userId}/advisorThreads/{threadId}`
- `users/{userId}/advisorThreads/{threadId}/messages/{messageId}`

Minimal v1 version:

- only store usage counters
- optionally skip thread persistence until core AI is working

Better v1.1 version:

- also persist messages so the user can revisit previous chats

### 4. Build responses from user transaction data

For each AI request, derive a compact summary from Firestore data such as:

- income total for current month
- expense total for current month
- balance
- top spending categories
- recent transactions
- average spend in a category

This summary should be passed to the model instead of dumping raw transaction history whenever possible. That will reduce cost, latency, and prompt noise.

### 5. Enforce entitlement and usage on the server

The current `MAX_FREE = 5` check is purely client-side. That should move to the backend.

Suggested initial rules:

- Free: 5 advisor queries per day
- Pro: effectively unlimited or much higher daily cap

The server should return:

- remaining usage
- whether the user is blocked
- current plan if available

## Prompting Strategy

The advisor should be positioned as a budgeting and planning assistant, not a licensed financial advisor.

### System prompt goals

The system prompt should tell the model to:

- stay within budgeting, spending, saving, and debt-planning guidance
- base answers on the supplied user data summary
- clearly say when available data is insufficient
- avoid pretending to know account balances not present in app data
- avoid legal, tax, or investment advice phrasing
- use practical, short recommendations
- include a short non-advice disclaimer when appropriate

### Input prompt structure

Each request should include:

- user profile basics if needed
- subscription tier
- derived financial summary
- recent chat turns, capped to a small number
- latest user question

### Output style

Responses should be:

- short to medium length
- specific to the user data when possible
- action-oriented
- careful when data is missing

Example response shape:

- brief answer
- 2 to 4 concrete suggestions
- short caution or disclaimer if the topic is high-stakes

## Model and API Integration Plan

This repository does not currently include any AI SDK dependency in `package.json`.

For implementation, I would add:

- a server-side model SDK
- environment variables for the provider API key

At the code level, the integration should be isolated behind a small server utility layer so the UI is not tightly coupled to one provider.

Suggested internal files:

- `lib/ai/advisor.ts`
- `lib/ai/prompt.ts`
- `lib/ai/usage.ts`
- `lib/ai/summary.ts`

Responsibilities:

- `advisor.ts`: provider call and response handling
- `prompt.ts`: system and user prompt construction
- `usage.ts`: Firestore quota logic
- `summary.ts`: derive compact finance summaries from transactions

## Implementation Phases

### Phase 1: Replace mock responses

- add server AI route
- install model SDK
- move advisor reply generation to the server
- keep the current frontend UI largely intact

### Phase 2: Use real user finance context

- fetch user transactions on the server
- derive summary stats
- inject that summary into the prompt
- make affordability and spending advice data-aware

### Phase 3: Real usage enforcement

- persist daily counters in Firestore
- enforce limits on the server
- update the frontend badge to reflect server truth

### Phase 4: Conversation persistence

- save messages or threads in Firestore
- load previous chats for the user
- optionally support continuing an existing thread

### Phase 5: Receipt-aware AI

- upload receipt images to Firebase Storage
- save `receiptUrl`
- optionally add OCR or image understanding later

## Concrete Code Changes I Would Make

If implementing this feature next, I would plan to do the following:

1. Add a server route at `app/api/ai/advisor/route.ts`.
2. Add AI helper modules under `lib/ai/`.
3. Add Firestore helpers for AI usage tracking.
4. Refactor `app/advisor/page.tsx` to call the route instead of `getMockResponse()`.
5. Return real usage state from the server and remove the purely local limiter.
6. Add env vars for the AI provider key and model selection.
7. Optionally add Firestore-backed thread/message persistence once the basic flow is stable.

## Risks and Design Notes

### 1. Client-side trust is not enough

Usage limits and premium feature gates must not remain client-only. Otherwise users can bypass them easily.

### 2. Raw financial data should be minimized

The server should send only the necessary transaction summary to the model, not full user history by default.

### 3. Product claims should match implementation

Because pricing and registration pages already promote AI features, the backend should support at least:

- real purchase checks
- basic spending guidance
- consistent usage enforcement

### 4. Legal wording should stay visible

The current terms correctly say this is not financial advice. The advisor UX should preserve that framing.

## Short Conclusion

The codebase already has the right frontend entry point and user financial data structure for an AI advisor, but the current implementation is only a local mock. The clean path forward is to add a server AI route, ground responses in Firestore transaction summaries, move quota enforcement to the backend, and later add persistence and receipt-aware features in separate phases.
