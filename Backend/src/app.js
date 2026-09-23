import express from "express";
import { fileURLToPath } from "node:url";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import env from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import socialRoutes from "./routes/social.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import followRoutes from "./routes/follow.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import searchRoutes from "./routes/search.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import trackCommentRoutes from "./routes/track-comments.routes.js";
import trackPlayRoutes from "./routes/track-plays.routes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import openApiDocument from "./docs/openapi.js";
import { observeRequests } from "./middleware/observability.js";

const app = express();

app.disable("x-powered-by");
if (env.nodeEnv === "production") app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(observeRequests);
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
// Existing profile pictures are stored on disk; keep their public URLs valid.
const mediaDirectory = fileURLToPath(new URL('../uploads/', import.meta.url));
app.use('/api/media', (_req, res, next) => { res.set('Cross-Origin-Resource-Policy', 'cross-origin'); next(); }, express.static(mediaDirectory));

app.get("/api/docs/openapi.json", (req, res) => res.json(openApiDocument));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  explorer: true,
  customSiteTitle: "JAM'N API Documentation",
  swaggerOptions: { persistAuthorization: true, withCredentials: true }
}));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api", trackCommentRoutes);
app.use("/api", trackPlayRoutes);
app.use("/api", socialRoutes);
app.use("/api", notificationRoutes);
app.use("/api", followRoutes);
app.use("/api", playlistRoutes);
app.use("/api", searchRoutes);
app.use("/api", adminRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
