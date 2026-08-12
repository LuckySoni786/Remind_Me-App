import mongoose from "mongoose";

const medicineScheme = new mongoose.Schema(
    {
        medicineName: {
    type: String,
    required: [true, "Medicine name is required"],
    trim: true,
},
dosage: {
    type: String,
    required: [true, "Dosage is required"],
    trim: true,
},
type: {
    type: String,
    enum: [
        "Tablet",
        "Capsule",
        "Syrup",
        "Injection",
        "Drops",
        "Cream",
        "Spray",
        "Other",
    ],
    required: [true, "Medicine type is required"],
},
instructions: {
    type: String,
    enum: [
        "Before Food",
        "After Food",
        "With Food",
        "Empty Stomach",
        "Anytime",
    ],
    default: "Anytime",
},
notes: {
    type: String,
    trim: true,
    default: "",
},
color: {
    type: String,
    default: "#3B82F6",
},
isActive: {
    type: Boolean,
    default: true,
},
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
},
startDate: {
    type: Date,
    required: [true, "Start date is required"],
},
endDate: {
    type: Date,
},
reminderEnabled: {
    type: Boolean,
    default: true,
},


    },
    {
        timestamps:true,
    }
);

const Medicine = mongoose.model("Medicine", medicineScheme);
export default Medicine;