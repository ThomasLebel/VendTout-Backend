"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    fullName: { type: String, required: false, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    aboutDescription: { type: String, required: false, default: "" },
    profilePicture: { type: String, required: false, default: "https://res.cloudinary.com/dkf48p2ah/image/upload/v1739809289/VendToutAvatars/mk8ihczepktfn61qdzh1.jpg" },
    country: { type: String, required: false, default: "" },
    city: { type: String, required: false, default: "" },
    gender: { type: String, required: false, default: "" },
    birthDate: { type: String, required: false, default: "" },
    shippingAddress: { type: Object, required: false, default: { fullName: "", street: "", city: "", zipCode: "" } },
    likedProducts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "products", required: false, default: [] }],
    postedProducts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "products", required: false, default: [] }],
}, { timestamps: true });
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
