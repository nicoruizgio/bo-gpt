require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const completionRoutes = require("./routes/completionRoutes");
const userRoutes = require("./routes/userRoutes");
const authVerificationRoute = require("./routes/authVerificationRoute");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173", // Specify the frontend URL
  credentials: true, // Allow cookies and credentials
};

app.use(cors(corsOptions)); // Apply the CORS configuration to all routes
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api", completionRoutes);
app.use("/api", userRoutes);
app.use("/api", authVerificationRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
