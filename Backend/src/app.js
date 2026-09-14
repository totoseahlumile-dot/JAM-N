import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import env from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import socialRoutes from "./routes/social.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import followRoutes from "./routes/follow.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import openApiDocument from "./docs/openapi.js";

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.get("/api/docs/openapi.json", (req, res) => res.json(openApiDocument));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  explorer: true,
  customSiteTitle: "JAM'N API Documentation",
  swaggerOptions: { persistAuthorization: true, withCredentials: true }
}));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api", socialRoutes);
app.use("/api", notificationRoutes);
app.use("/api", followRoutes);
app.use("/api", playlistRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
