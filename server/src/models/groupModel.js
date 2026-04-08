import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Group name is required"],
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }]
}, { timestamps: true });

export default mongoose.model("Group", groupSchema);
