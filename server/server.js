const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const noteRoutes = require("./routes/noteRoutes");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
});

// Routes
app.use("/api/notes", noteRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running" });
});

// Centralized error handler (must be after routes)
app.use(errorHandler);

// For local development
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
