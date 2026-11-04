export function emailAuthEnabled() {
  return process.env.EMAIL_AUTH_ENABLED !== "false";
}
