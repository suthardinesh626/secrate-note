const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Note = require("../models/Note");

const SALT_ROUNDS = 10;

// @desc    Create a new note
// @route   POST /api/notes
const createNote = async (req, res, next) => {
    try {
        const { noteText } = req.body;

        // Validation
        if (!noteText || noteText.trim().length === 0) {
            const error = new Error("Note text is required and cannot be empty");
            error.statusCode = 400;
            throw error;
        }

        if (noteText.length > 500) {
            const error = new Error("Note must be 500 characters or less");
            error.statusCode = 400;
            throw error;
        }

        // Generate a random password (12 characters, URL-safe)
        const plainPassword = crypto.randomBytes(9).toString("base64url");

        // Hash the password
        const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

        // Save note to database
        const note = await Note.create({
            noteText: noteText.trim(),
            passwordHash,
        });

        // Return shareable URL and password (shown only once)
        res.status(201).json({
            success: true,
            data: {
                noteId: note._id,
                noteUrl: `/note/${note._id}`,
                password: plainPassword,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Unlock a note with password
// @route   POST /api/notes/:id/unlock
const unlockNote = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            const error = new Error("Password is required");
            error.statusCode = 400;
            throw error;
        }

        const note = await Note.findById(req.params.id);

        if (!note) {
            const error = new Error("Note not found");
            error.statusCode = 404;
            throw error;
        }

        // Compare password with stored hash
        const isMatch = await bcrypt.compare(password, note.passwordHash);

        if (!isMatch) {
            const error = new Error("Incorrect password");
            error.statusCode = 401;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: {
                noteText: note.noteText,
                createdAt: note.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Summarize a note using Gemini AI
// @route   POST /api/notes/:id/summarize
const summarizeNote = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            const error = new Error("Password is required");
            error.statusCode = 400;
            throw error;
        }

        const note = await Note.findById(req.params.id);

        if (!note) {
            const error = new Error("Note not found");
            error.statusCode = 404;
            throw error;
        }

        // Verify password before allowing summarization
        const isMatch = await bcrypt.compare(password, note.passwordHash);

        if (!isMatch) {
            const error = new Error("Incorrect password");
            error.statusCode = 401;
            throw error;
        }

        // Initialize Gemini AI
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const error = new Error("AI service is not configured (GEMINI_API_KEY missing)");
            error.statusCode = 500;
            throw error;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: "Strictly summarize the note into 3-5 short bullet points. Use short fragments, NOT full sentences. Strictly ONLY bullet points. Each sentence should be make sence. also make sure that bullet point should be relevant to the note."
        });

        const prompt = `Note content:\n${note.noteText}`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const summary = response.text();

        if (!summary || summary.trim().length === 0) {
            const error = new Error("AI returned an empty response. Please try again.");
            error.statusCode = 502;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: {
                summary: summary.trim(),
            },
        });
    } catch (error) {
        // Handle Gemini API specific errors
        if (error.message?.includes("API key") || error.status === 401) {
            error.message = "AI service authentication failed (Invalid Gemini Key)";
            error.statusCode = 500;
        } else if (error.message?.includes("quota") || error.status === 429) {
            error.message = "AI service rate limit reached. Please try again later or check your Gemini quota.";
            error.statusCode = 429;
        } else if (!error.statusCode) {
            error.message = "AI summarization failed. Please try again.";
            error.statusCode = 502;
        }
        next(error);
    }
};

module.exports = { createNote, unlockNote, summarizeNote };
