import crypto from "node:crypto";

export const SANDBOX_HOST = "https://sandbox.payfast.co.za";

const encode = (value) => encodeURIComponent(String(value).trim()).replace(/%20/g, "+").replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

export function parameterString(fields, passphrase) {
  const values = Object.entries(fields)
    .filter(([key, value]) => key !== "signature" && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}=${encode(value)}`);
  if (passphrase) values.push(`passphrase=${encode(passphrase)}`);
  return values.join("&");
}

export function sign(fields, passphrase) {
  return crypto.createHash("md5").update(parameterString(fields, passphrase)).digest("hex");
}

export function validSignature(fields, passphrase) {
  if (typeof fields.signature !== "string" || !/^[a-f0-9]{32}$/i.test(fields.signature)) return false;
  return crypto.timingSafeEqual(Buffer.from(fields.signature.toLowerCase()), Buffer.from(sign(fields, passphrase)));
}

// PayFast's server-to-server confirmation is required in addition to the signed ITN.
// This prevents a browser from fabricating a successful notification.
export async function confirmNotification(fields) {
  const response = await fetch(`${SANDBOX_HOST}/eng/query/validate`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: parameterString(fields),
    signal: AbortSignal.timeout(10000)
  });
  return response.ok && (await response.text()).trim() === "VALID";
}
