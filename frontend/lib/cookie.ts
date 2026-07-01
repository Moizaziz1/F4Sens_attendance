const COOKIE_NAME = "access_token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day

export function setAuthToken(token: string) {
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function removeAuthToken() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
