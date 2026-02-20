const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: messages.join(", "),
        });
    }

    // Mongoose bad ObjectId (CastError)
    if (err.name === "CastError" && err.kind === "ObjectId") {
        return res.status(404).json({
            success: false,
            message: "Note not found",
        });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error",
    });
};

export default errorHandler;
