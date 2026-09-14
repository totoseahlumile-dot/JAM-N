import express from "express";
import * as notificationController from "../controllers/notification.controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.use(authenticate);
router.get("/alerts", notificationController.listAlerts);
router.get("/alerts/unread-count", notificationController.getUnreadCount);
router.put("/alerts/read-all", notificationController.markAllRead);
router.put("/alerts/:id/read", notificationController.markRead);
router.delete("/alerts/:id", notificationController.deleteAlert);
router.get("/alert-preferences", notificationController.getPreferences);
router.put("/alert-preferences/:type", notificationController.setPreference);

export default router;
