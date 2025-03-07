import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  _id: Schema.Types.ObjectId
  product : Schema.Types.ObjectId
  buyer : Schema.Types.ObjectId
  seller : Schema.Types.ObjectId
  totalPrice : number
  sellerPrice : number
  paymentMethod : string
  status : string
}

const productSchema = new Schema<IOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "products", required: true },
    totalPrice: { type: Number, required: true },
    sellerPrice: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("orders", productSchema);

export default Order;
