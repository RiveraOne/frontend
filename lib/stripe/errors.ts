import { stripe } from "@/lib/stripe/client";

type StripeLikeError = {
  code?: string;
  message?: string;
  statusCode?: number;
  type?: string;
};

function asStripeLikeError(error: unknown): StripeLikeError {
  return typeof error === "object" && error !== null
    ? (error as StripeLikeError)
    : {};
}

export function isMissingStripeResource(error: unknown): boolean {
  return asStripeLikeError(error).code === "resource_missing";
}

export function messageForStripeError(
  error: unknown,
  fallback = "Could not create Stripe checkout session. Please try again."
): string {
  const stripeError = asStripeLikeError(error);
  const message = stripeError.message ?? "";

  if (stripeError.code === "resource_missing") {
    return "Stripe could not find the saved billing record. Please try again.";
  }

  if (
    stripeError.code === "account_invalid" ||
    message.toLowerCase().includes("charges") ||
    message.toLowerCase().includes("account")
  ) {
    return "Stripe checkout is not ready for this account. Use Stripe test-mode keys locally, or finish live account onboarding in Stripe.";
  }

  if (
    stripeError.code === "resource_missing" ||
    message.includes("No such price") ||
    message.includes("No such customer")
  ) {
    return "Stripe billing details are out of sync. Please try again.";
  }

  if (stripeError.type === "StripeAuthenticationError" || stripeError.statusCode === 401) {
    return "Stripe secret key is invalid. Check the server-side Stripe key in your environment.";
  }

  if (stripeError.type === "StripePermissionError" || stripeError.statusCode === 403) {
    return "Stripe rejected this billing request. Check the account mode and Stripe permissions.";
  }

  return fallback;
}

export async function getStripeAccountReadinessMessage(): Promise<string | null> {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";

  if (!secretKey.startsWith("sk_live_")) {
    return null;
  }

  const account = await stripe.accounts.retrieveCurrent();

  if (account.charges_enabled) {
    return null;
  }

  return "Stripe live checkout is not enabled for this account yet. Use Stripe test-mode keys locally, or finish live account onboarding in Stripe.";
}
