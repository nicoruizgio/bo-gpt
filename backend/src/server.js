import "dotenv/config";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

import dotenv from "dotenv";
dotenv.config({ path: envFile });


console.log("Loaded ENV Variables:");
console.log("POSTGRES_HOST:", process.env.POSTGRES_HOST);
console.log("POSTGRES_USER:", process.env.POSTGRES_USER);
console.log("POSTGRES_DB:", process.env.POSTGRES_DB);

import express from "express";
import pkg from 'body-parser';
const { json } = pkg;
import cors from "cors";
import cookieParser from "cookie-parser";
import completionRoutes from "./routes/completionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authVerificationRoute from "./routes/authVerificationRoute.js";
import questionnaireRoute from "./routes/questionnaireRoute.js";
import conversationRoute from "./routes/conversationRoutes.js";
import saveMessageRoute from "./routes/saveMessageRoute.js";

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_PORT = process.env.BACKEND_PORT;

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(json());

app.use("/api", completionRoutes);
app.use("/api", userRoutes);
app.use("/api", authVerificationRoute);
app.use("/api",questionnaireRoute);
app.use("/api", conversationRoute);
app.use("/api", saveMessageRoute);

app.listen(BACKEND_PORT, () => {
  console.log(
    `Server running on port ${BACKEND_PORT} (Mode: ${process.env.NODE_ENV})`
  );
});
