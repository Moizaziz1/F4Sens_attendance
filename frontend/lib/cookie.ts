const COOKIE_NAME = "access_token";

export function removeAuthToken() {
  if (typeof window === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
