import { createHash, randomBytes } from "node:crypto";
export function newToken() {
  return randomBytes(32).toString("hex");
}
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export function validToken(token: string) {
  return /^[a-f0-9]{64}$/.test(token);
}
export function validPassword(password: string) {
  return password.length >= 8 && Buffer.byteLength(password, "utf8") <= 72;
}
