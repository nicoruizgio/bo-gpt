require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

console.log("Loaded ENV Variables:");
console.log("POSTGRES_HOST:", process.env.POSTGRES_HOST);
console.log("POSTGRES_USER:", process.env.POSTGRES_USER);
console.log("POSTGRES_DB:", process.env.POSTGRES_DB);

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const completionRoutes = require("./routes/completionRoutes");
const userRoutes = require("./routes/userRoutes");
const authVerificationRoute = require("./routes/authVerificationRoute");
const questionnaireRoute = require("./routes/questionnaireRoute");
const conversationRoute = require("./routes/conversationRoutes");
const saveMessageRoute = require("./routes/saveMessageRoute")

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_PORT = process.env.BACKEND_PORT;

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());

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
