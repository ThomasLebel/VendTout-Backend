import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  userID: Schema.Types.ObjectId;
  title: string;
  description: string;
  photos: string[];
  gender: string;
  subCategory: string;
  brand: string;
  size: string;
  condition: string;
  color: string;
  price: number;
  nbLikes: number;
  nbViews: number;
  isSold: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    userID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    photos: { type: [String], required: false },
    gender: { type: String, required: true },
    subCategory: { type: String, required: true },
    brand: { type: String, required: true },
    size: { type: String, required: true },
    condition: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    nbLikes: { type: Number, required: true, default: 0 },
    nbViews: { type: Number, required: true, default: 0 },
    isSold: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model<IProduct>("products", productSchema);

export default Product;
