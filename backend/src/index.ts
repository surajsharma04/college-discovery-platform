import "dotenv/config";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { prisma } from "./lib/prisma.js";
import { attachRequestContext } from "./middleware/request-context.js";
import authRoutes from "./routes/auth.routes.js";
import collegesRoutes from "./routes/colleges.routes.js";
import compareRoutes from "./routes/compare.routes.js";
import predictorRoutes from "./routes/predictor.routes.js";
import questionsRoutes from "./routes/questions.routes.js";
import savedRoutes from "./routes/saved.routes.js";
import { sendError } from "./lib/http.js";

const app = express();

app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["x-request-id"]
  })
);

app.set("trust proxy", 1);

app.use(attachRequestContext);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "college-discovery-backend"
  });
});

app.get("/api/ready", (_request, response) => {
  void prisma.$queryRaw`SELECT 1`
    .then(() => {
      response.status(200).json({
        status: "ready",
        database: "connected"
      });
    })
    .catch(() => {
      response.status(503).json({
        status: "database_unavailable",
        database: "disconnected"
      });
    });
});

app.get("/api/status", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const collegeCount = await prisma.college.count();

    response.json({
      status: "ok",
      ready: true,
      service: "college-discovery-backend",
      database: "connected",
      data: {
        colleges: collegeCount
      }
    });
  } catch {
    response.status(503).json({
      status: "degraded",
      ready: false,
      service: "college-discovery-backend",
      database: "disconnected"
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegesRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/predictor", predictorRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/saved", savedRoutes);

app.use((request, response) => {
  sendError(request, response, 404, "Route not found.");
});

app.use(
  (
    error: Error,
    request: express.Request & { requestId?: string },
    response: express.Response,
    _next: express.NextFunction
  ) => {
    const errorId = request.requestId ?? crypto.randomUUID();

    console.error(
      JSON.stringify({
        errorId,
        message: error.message,
        stack: error.stack
      })
    );

    response.status(500).json({
      message: "Internal server error.",
      errorId,
      requestId: request.requestId
    });
  }
);

app.listen(config.PORT, () => {
  console.log(`Backend running on http://localhost:${config.PORT}`);
});