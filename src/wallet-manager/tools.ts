import CryptoJS from "crypto-js";

export function formatIndex(index: number): string {
  return index < 10 ? `0${index}` : `${index}`;
}

export function genUID() {
  const randomBytes = CryptoJS.lib.WordArray.random(16);
  return randomBytes.toString(CryptoJS.enc.Hex);
}
