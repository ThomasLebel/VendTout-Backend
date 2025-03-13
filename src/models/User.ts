import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
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
  birthDate : string;
  shippingAddress : {fullName : string, street : string, city : string, zipCode : string};
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
    profilePicture: { type: String, required: false, default: "https://res.cloudinary.com/dkf48p2ah/image/upload/v1739809289/VendToutAvatars/mk8ihczepktfn61qdzh1.jpg" },
    country: { type: String, required: false, default: "" },
    city: { type: String, required: false, default: "" },
    gender: { type: String, required: false, default: "" },
    birthDate: { type: String, required: false, default: "" },
    shippingAddress: { type: Object, required: false, default: {fullName : "", street : "", city : "", zipCode : ""}},
    likedProducts: [{ type: Schema.Types.ObjectId, ref: "products", required: false, default: [] }],
    postedProducts: [{ type: Schema.Types.ObjectId, ref: "products", required: false, default: [] }],
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;