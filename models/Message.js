import mongoose from "mongoose";


const MessageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,

        },

        clerkUserId: {
            type: String,
            default: null,
        },

        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20000,
        },
    },
    { timestamps: true }
)

MessageSchema.index({
    conversationId: 1,
    createdAt: 1,
});

MessageSchema.index({
    clerkUserId: 1,
    conversationId: 1,
});

const Message =
    mongoose.models.Message ||
    mongoose.model("Message", MessageSchema);

export default Message;