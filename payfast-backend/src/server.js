require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const https = require("https");
const { generateSignature } = require("./payfastSignature");

const app = express();

app.use(cors());
app.use(bodyParser.json());
// PayFast's ITN arrives as application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

const {
  PAYFAST_MERCHANT_ID,
  PAYFAST_MERCHANT_KEY,
  PAYFAST_PASSPHRASE,
  PAYFAST_URL,
  FRONTEND_RETURN_URL,
  FRONTEND_CANCEL_URL,
  NOTIFY_URL,
  PORT,
} = process.env;

// In-memory "orders" store for the demo. Replace with your real DB/Vuex-backed
// persistence layer when you wire this into the actual subscription flow.
const orders = {};

/**
 * PLANS
 * Keep prices server-side, not trusted from the frontend, so nobody can
 * tamper with the amount by editing a request in devtools.
 */
const PLANS = {
  plus: { name: "JAM'N Plus", amount: "49.00" },
  pro: { name: "JAM'N Pro", amount: "129.00" },
};

/**
 * POST /api/payment/initiate
 * body: { plan: "plus" | "pro" }
 * returns: { action, fields } -- action is the PayFast URL to POST to,
 * fields is everything (including signature) your frontend form needs.
 */
app.post("/api/payment/initiate", (req, res) => {
  const { plan } = req.body;
  const selectedPlan = PLANS[plan];

  if (!selectedPlan) {
    return res.status(400).json({ error: "Unknown plan" });
  }

  const paymentId = `jamn_${plan}_${Date.now()}`;

  // Append the plan + payment id so the success page knows what to activate
  // once the browser is redirected back.
  const returnUrlWithPlan = `${FRONTEND_RETURN_URL}?plan=${plan}&m_payment_id=${paymentId}`;

  // Order matters here — this exact order is what gets signed.
  const fields = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: returnUrlWithPlan,
    cancel_url: FRONTEND_CANCEL_URL,
    notify_url: NOTIFY_URL,
    m_payment_id: paymentId,
    amount: selectedPlan.amount,
    item_name: selectedPlan.name,
    custom_str1: plan,
  };

  const signature = generateSignature(fields, PAYFAST_PASSPHRASE);

  orders[paymentId] = { plan, amount: selectedPlan.amount, status: "pending" };

  res.json({
    action: PAYFAST_URL,
    fields: { ...fields, signature },
  });
});

/**
 * POST /api/payment/notify
 * PayFast's server calls this directly (the ITN). It is NOT the browser
 * redirect -- this must be reachable from the public internet, so use
 * ngrok (or similar) during development and point NOTIFY_URL at the
 * ngrok URL.
 */
app.post("/api/payment/notify", (req, res) => {
  const data = req.body;

  // 1. Always respond 200 quickly so PayFast doesn't retry endlessly.
  res.sendStatus(200);

  // 2. Verify the signature PayFast sent matches what we'd generate.
  const { signature, ...fieldsWithoutSignature } = data;
  const expectedSignature = generateSignature(
    fieldsWithoutSignature,
    PAYFAST_PASSPHRASE
  );

  if (signature !== expectedSignature) {
    console.error("ITN signature mismatch — possible tampering or bug", data);
    return;
  }

  // 3. Confirm the amount matches what we expect for this order.
  const order = orders[data.m_payment_id];
  if (!order) {
    console.error("ITN for unknown payment id", data.m_payment_id);
    return;
  }
  if (parseFloat(data.amount_gross) !== parseFloat(order.amount)) {
    console.error("ITN amount mismatch", data.amount_gross, order.amount);
    return;
  }

  // 4. Confirm with PayFast that the request genuinely came from them
  //    (recommended by PayFast to prevent spoofed ITNs).
  validateWithPayfast(req.body, (isValid) => {
    if (!isValid) {
      console.error("PayFast could not validate this ITN as genuine");
      return;
    }

    if (data.payment_status === "COMPLETE") {
      order.status = "complete";
      console.log(`Order ${data.m_payment_id} marked complete.`);
      // TODO: this is where you'd flip the user's plan in your real DB,
      // e.g. update their subscription record.
    } else {
      order.status = data.payment_status;
      console.log(`Order ${data.m_payment_id} status: ${data.payment_status}`);
    }
  });
});

function validateWithPayfast(fields, callback) {
  const host = PAYFAST_URL.includes("sandbox")
    ? "sandbox.payfast.co.za"
    : "www.payfast.co.za";

  const body = new URLSearchParams(fields).toString();

  const options = {
    hostname: host,
    path: "/eng/query/validate",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  const request = https.request(options, (response) => {
    let responseBody = "";
    response.on("data", (chunk) => (responseBody += chunk));
    response.on("end", () => callback(responseBody.trim() === "VALID"));
  });

  request.on("error", (err) => {
    console.error("Error validating ITN with PayFast:", err);
    callback(false);
  });

  request.write(body);
  request.end();
}

// Simple endpoint to check order status from the frontend after redirect back
app.get("/api/payment/status/:paymentId", (req, res) => {
  const order = orders[req.params.paymentId];
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

app.listen(PORT || 4000, () => {
  console.log(`PayFast backend running on http://localhost:${PORT || 4000}`);
});