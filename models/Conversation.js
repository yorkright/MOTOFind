import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(

    {
        sessionId: {
            type: String,
            required: true,
            index: true,
        },

        clerkUserId: {
            type: String,
            default: null,
        },

        title: {
            type: String,
            default: "New Chat",
            trim: true,
            maxlength: 100,
        },
    },
    { timestamps: true }

);

ConversationSchema.index({
    sessionId: 1,
    updatedAt: -1,
});

ConversationSchema.index({
    clerkUserId: 1,
    updatedAt: -1,
});


const Conversation =
    mongoose.models.Conversation ||
    mongoose.model("Conversation", ConversationSchema);

export default Conversation;