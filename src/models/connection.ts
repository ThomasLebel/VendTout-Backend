import mongoose from "mongoose";


const CONNECTION_STRING = process.env.CONNECTION_STRING

if (!CONNECTION_STRING) {
    throw new Error("La variable d'environnement connectionString n'est pas définie");
  }

mongoose
  .connect(CONNECTION_STRING, { connectTimeoutMS: 2000 })
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error))