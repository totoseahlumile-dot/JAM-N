const crypto = require("crypto");

/**
 * PayFast requires an MD5 hash of all the posted fields, joined as
 * key=urlencodedValue&key=urlencodedValue... in the EXACT order they
 * are added to the form/object, with the passphrase appended at the end
 * (if one is set).
 *
 * IMPORTANT:
 * - Do not alphabetise the keys. Use insertion order.
 * - Skip any field that is empty/undefined — PayFast does not include
 *   blank fields in the signature string.
 * - PayFast's own encoding quirk: spaces must be encoded as '+' (not %20).
 *   encodeURIComponent gives %20, so we swap it after encoding.
 */
function payfastEncode(value) {
  return encodeURIComponent(value.toString().trim()).replace(/%20/g, "+");
}

function generateSignature(fields, passphrase) {
  let pairs = [];

  for (const key in fields) {
    const value = fields[key];
    if (value !== undefined && value !== null && value !== "") {
      pairs.push(`${key}=${payfastEncode(value)}`);
    }
  }

  let payload = pairs.join("&");

  if (passphrase) {
    payload += `&passphrase=${payfastEncode(passphrase)}`;
  }

  return crypto.createHash("md5").update(payload).digest("hex");
}

module.exports = { generateSignature, payfastEncode };
