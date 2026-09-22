import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { sign, validSignature, parameterString } from "../src/services/payfast.js";

test("PayFast signature depends on field values and passphrase", () => {
  const fields = { merchant_id: "10000100", amount: "49.00", item_name: "JAM'N Plus" };
  const signature = sign(fields, "secret");
  assert.match(signature, /^[a-f0-9]{32}$/);
  assert.equal(validSignature({ ...fields, signature }, "secret"), true);
  assert.equal(validSignature({ ...fields, amount: "0.01", signature }, "secret"), false);
  assert.equal(validSignature({ ...fields, signature }, "wrong"), false);
  assert.match(parameterString(fields, "secret"), /item_name=JAM%27N\+Plus/);
});

test("payment checkout requires authentication and catalog prices are public", async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const plans = await fetch(`${base}/api/payments/plans`);
    assert.equal(plans.status, 200);
    assert.deepEqual((await plans.json()).plans.map((plan) => plan.amountCents), [0, 4900, 12900]);
    const checkout = await fetch(`${base}/api/payments/checkout`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ planId: "plus", amountCents: 1 }) });
    assert.equal(checkout.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
