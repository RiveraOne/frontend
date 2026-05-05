const DEFAULT_AUTH_REDIRECT = "/pricing";

export function safeAuthRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (
    value.startsWith("/advisor") ||
    value.startsWith("/login") ||
    value.startsWith("/register")
  ) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return value;
}
