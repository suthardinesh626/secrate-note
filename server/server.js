const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const noteRoutes = require("./routes/noteRoutes");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/notes", noteRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running" });
});

// Centralized error handler (must be after routes)
app.use(errorHandler);

// Connect to DB and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
