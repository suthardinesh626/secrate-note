const express = require("express");
const router = express.Router();
const {
    createNote,
    unlockNote,
    summarizeNote,
} = require("../controllers/noteController");

router.post("/", createNote);
router.post("/:id/unlock", unlockNote);
router.post("/:id/summarize", summarizeNote);

module.exports = router;
