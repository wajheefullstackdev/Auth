import mongoose from "mongoose";

const groupExpenseSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount cannot be negative"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    splitAmong: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("GroupExpense", groupExpenseSchema);
