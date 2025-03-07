import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { connectDatabase } from "./models/connection";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";

const app = express();

// Configuration de CORS
const corsOptions = {
    origin: ['https://vendtout.vercel.app', 'http://localhost:3000', 'http://192.168.1.100:3000', 'https://2e3e-2a02-842a-3ac-c101-60db-7cdc-2632-c4ef.ngrok-free.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes autorisées
    credentials: true, // Autoriser les cookies
  };

// Configuration de CORS
app.use(cors(corsOptions));

// Connexion à la base de données
connectDatabase().catch(console.error);

// Configuration de fileUpload
const fileUpload = require("express-fileupload");
app.use(fileUpload());

// Configuration des middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

export default app;
