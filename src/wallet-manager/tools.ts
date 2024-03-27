import crypto from "crypto";

export function formatIndex(index: number): string {
  return index < 10 ? `0${index}` : `${index}`;
}

export function genUID() {
  return crypto.randomBytes(16).toString("hex");
}
