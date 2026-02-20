import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        noteText: {
            type: String,
            required: [true, "Note text is required"],
            maxlength: [500, "Note must be 500 characters or less"],
        },
        passwordHash: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

noteSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model("Note", noteSchema);
