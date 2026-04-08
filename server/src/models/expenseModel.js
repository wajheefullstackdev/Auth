import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount cannot be negative"]
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

expenseSchema.index({ userId: 1, date: -1 });

const expenseModel = mongoose.model("Expense", expenseSchema);

export default expenseModel;
