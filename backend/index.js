const express = require("express");
const cors = require("cors"); // Import CORS middleware
const routes = require("./routes");
require("dotenv").config(); // Load environment variables from .env

const app = express();

// Configure CORS to allow only your frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; 
app.use(
  cors({
    origin: FRONTEND_URL, // Restrict requests to this origin
    methods: ["GET", "POST"], // Adjust based on your needs
    credentials: true, // Enable if using cookies/sessions
  })
);

app.use(express.json());
app.use("", routes);

module.exports = app;