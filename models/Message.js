import mongoose, { mongo, Mongoose } from "mongoose";


const MessageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,

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

const Message =
    mongoose.models.Message ||
    mongoose.model("Message", MessageSchema);

export default Message;