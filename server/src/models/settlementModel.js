import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, "Amount cannot be negative"]
    },
    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },
    paidAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("Settlement", settlementSchema);
