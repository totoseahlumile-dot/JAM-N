# JAM'N PayFast Backend (Sandbox)

Small standalone Express service handling PayFast checkout signing and ITN
(payment notifications) for JAM'N's Plus/Pro subscriptions.

## Setup

```bash
cd payfast-backend
npm install
cp .env.example .env
```

Then edit `.env` and fill in:
- `PAYFAST_MERCHANT_ID` — 10054735 (from your sandbox dashboard)
- `PAYFAST_MERCHANT_KEY` — from your sandbox dashboard
- `PAYFAST_PASSPHRASE` — the one you set in the sandbox (JamnSandbox2026Test)

## Run

```bash
npm start
```

Server runs on http://localhost:4000 by default.

## Making the ITN reachable (required for full testing)

PayFast's servers call `NOTIFY_URL` directly — they can't reach `localhost`.
Use ngrok while developing:

```bash
ngrok http 4000
```

Then set `NOTIFY_URL` in `.env` to the ngrok https URL + `/api/payment/notify`,
e.g. `https://abcd1234.ngrok-free.app/api/payment/notify`, and restart the server.

Without this step, checkout still works and redirects back to your success
page — you just won't get the server-side confirmation, so don't rely on the
redirect alone to mark someone's plan as paid in production.

## How Vue talks to this

1. User clicks "Upgrade to Plus/Pro" in `SubscriptionView.vue`.
2. Vue calls `POST http://localhost:4000/api/payment/initiate` with
   `{ plan: "plus" }`.
3. Backend responds with `{ action, fields }` — `action` is PayFast's URL,
   `fields` includes the signed payment fields.
4. Vue builds a real `<form>` element (NOT a fetch/axios request) with those
   fields as hidden inputs, and calls `form.submit()`. This is required —
   PayFast needs an actual page POST, and a fetch call won't redirect the
   browser correctly.
5. User is redirected to PayFast sandbox, pays with sandbox wallet, and
   lands back on `FRONTEND_RETURN_URL`.
6. Separately (and asynchronously), PayFast's server calls
   `/api/payment/notify` to confirm the payment server-side. This is the
   trustworthy source of truth — use it to actually flip someone's
   subscription plan.

## Example Vue snippet (checkout button handler)

```js
async function startCheckout(plan) {
  const res = await fetch("http://localhost:4000/api/payment/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const { action, fields } = await res.json();

  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
```
