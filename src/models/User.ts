import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  token: string;
  username : string;
  aboutDescription: string;
  profilePicture: string;
  country : string;
  city : string;
  gender : string;
  birthDate : Date;
  shippingAddress : {fullName : string, street : string, city : string, zipCode : number};
  likedProducts : Schema.Types.ObjectId[];
  postedProducts :Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: false, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    aboutDescription: { type: String, required: false, default: "" },
    profilePicture: { type: String, required: false, default: "" },
    country: { type: String, required: false, default: "" },
    city: { type: String, required: false, default: "" },
    gender: { type: String, required: false, default: "" },
    birthDate: { type: Date, required: false, default: null },
    shippingAddress: { type: Object, required: false, default: {fullName : "", street : "", city : "", zipCode : 0}},
    likedProducts: [{ type: Schema.Types.ObjectId, ref: "Product", required: false, default: [] }],
    postedProducts: [{ type: Schema.Types.ObjectId, ref: "Product", required: false, default: [] }],
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;