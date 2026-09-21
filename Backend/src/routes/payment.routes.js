import express from "express";
import crypto from "node:crypto";
import { pool } from "../config/database.js";
import env from "../config/env.js";
import authenticate from "../middleware/authenticate.js";
import httpError from "../utils/httpError.js";
import { SANDBOX_HOST, sign, validSignature, confirmNotification } from "../services/payfast.js";

const router = express.Router();
const prices = Object.freeze({ plus: 4900, pro: 12900 });
const configured = () => Object.values(env.payfast).every(Boolean);
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);

router.get("/plans", (req, res) => res.json({ currency: "ZAR", plans: [{ id: "free", amountCents: 0 }, ...Object.entries(prices).map(([id, amountCents]) => ({ id, amountCents }))] }));

router.get("/subscription", authenticate, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute("SELECT plan_id, active_until FROM user_subscriptions WHERE user_id = ? AND active_until > UTC_TIMESTAMP()", [req.user.id]);
  res.json({ planId: rows[0]?.plan_id || "free", activeUntil: rows[0]?.active_until || null });
}));

router.post("/checkout", authenticate, asyncRoute(async (req, res) => {
  const planId = req.body?.planId;
  if (!Object.hasOwn(prices, planId)) throw httpError(400, "INVALID_PLAN", "Choose Plus or Pro");
  if (!configured()) throw httpError(503, "PAYMENTS_NOT_CONFIGURED", "Sandbox payments need PayFast credentials and public callback URLs");
  if (!env.payfast.notifyUrl.startsWith("https://")) throw httpError(503, "INVALID_PAYMENT_CONFIG", "PAYFAST_NOTIFY_URL must use public HTTPS");

  const id = crypto.randomUUID();
  const amountCents = prices[planId]; // Never accept a price from the browser.
  await pool.execute("INSERT INTO payment_orders (id, user_id, plan_id, amount_cents) VALUES (?, ?, ?, ?)", [id, req.user.id, planId, amountCents]);
  const fields = {
    merchant_id: env.payfast.merchantId,
    merchant_key: env.payfast.merchantKey,
    return_url: env.payfast.returnUrl,
    cancel_url: env.payfast.cancelUrl,
    notify_url: env.payfast.notifyUrl,
    m_payment_id: id,
    amount: (amountCents / 100).toFixed(2),
    item_name: `JAM'N ${planId} 30-day access`
  };
  fields.signature = sign(fields, env.payfast.passphrase);
  res.status(201).json({ orderId: id, checkoutUrl: `${SANDBOX_HOST}/eng/process`, fields });
}));

router.get("/orders/:id", authenticate, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute("SELECT id, plan_id, amount_cents, currency, status, created_at, paid_at FROM payment_orders WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!rows[0]) throw httpError(404, "ORDER_NOT_FOUND", "Order not found");
  res.json(rows[0]);
}));

router.post("/payfast/notify", asyncRoute(async (req, res) => {
  const fields = req.body;
  if (!configured() || !validSignature(fields, env.payfast.passphrase) || fields.merchant_id !== env.payfast.merchantId) {
    throw httpError(400, "INVALID_NOTIFICATION", "Invalid payment notification");
  }
  if (!(await confirmNotification(fields))) throw httpError(400, "UNVERIFIED_NOTIFICATION", "PayFast did not verify the notification");

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute("SELECT * FROM payment_orders WHERE id = ? FOR UPDATE", [fields.m_payment_id]);
    const order = rows[0];
    if (!order || fields.amount_gross !== (order.amount_cents / 100).toFixed(2) || !fields.pf_payment_id) {
      throw httpError(400, "PAYMENT_MISMATCH", "Payment does not match an order");
    }
    if (order.status === "paid") {
      if (order.provider_payment_id !== fields.pf_payment_id) throw httpError(409, "PAYMENT_CONFLICT", "Order was paid by a different transaction");
    } else if (order.status === "pending" && fields.payment_status === "COMPLETE") {
      await connection.execute("UPDATE payment_orders SET status = 'paid', provider_payment_id = ?, paid_at = UTC_TIMESTAMP() WHERE id = ?", [fields.pf_payment_id, order.id]);
      // A renewal extends an active term; it never shortens paid access.
      await connection.execute("INSERT INTO user_subscriptions (user_id, plan_id, active_until) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 DAY)) ON DUPLICATE KEY UPDATE plan_id = VALUES(plan_id), active_until = DATE_ADD(GREATEST(active_until, UTC_TIMESTAMP()), INTERVAL 30 DAY)", [order.user_id, order.plan_id]);
    } else if (order.status === "pending" && fields.payment_status === "FAILED") {
      await connection.execute("UPDATE payment_orders SET status = 'failed' WHERE id = ?", [order.id]);
    }
    await connection.commit();
    res.status(200).send("OK");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

export default router;
