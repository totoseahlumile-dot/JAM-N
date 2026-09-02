import express from "express";
import cors from "cors";
import env from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
